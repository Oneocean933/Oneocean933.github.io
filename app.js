/* CAYARI public portfolio demos. Entirely client-side, no tracking or uploads. */
(() => {
  "use strict";

  const byId = (id) => document.getElementById(id);
  const currency = new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 0
  });
  const currencyPrecise = new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2
  });
  const count = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
  const SAMPLE_PARTNERS = Object.freeze([
    { partner: "Editorial Network", spend: 4800, revenue: 24600, orders: 264 },
    { partner: "Creator Collective", spend: 7900, revenue: 27800, orders: 310 },
    { partner: "Review Publisher", spend: 5300, revenue: 10400, orders: 140 },
    { partner: "Niche Newsletter", spend: 2600, revenue: 12000, orders: 135 }
  ]);

  // Navigation keeps the menu usable with a keyboard and small screens.
  const navButton = document.querySelector(".nav-toggle");
  const nav = byId("site-nav");
  const closeNav = () => {
    if (!navButton || !nav) return;
    nav.classList.remove("is-open");
    navButton.setAttribute("aria-expanded", "false");
    navButton.setAttribute("aria-label", "Open navigation");
  };
  if (navButton && nav) {
    navButton.addEventListener("click", () => {
      const opened = nav.classList.toggle("is-open");
      navButton.setAttribute("aria-expanded", String(opened));
      navButton.setAttribute("aria-label", opened ? "Close navigation" : "Open navigation");
    });
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeNav));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeNav();
      }
    });
    document.addEventListener("click", (event) => {
      if (!nav.contains(event.target) && !navButton.contains(event.target)) closeNav();
    });
  }
  if (byId("year")) byId("year").textContent = String(new Date().getFullYear());

  // Lab 001 — explicit formulas. NO AI model, profit, or causal attribution claims.
  const economicInputs = ["revenue", "spend", "commission", "orders"]
    .map(byId).filter(Boolean);
  const initialEconomicValues = { revenue: 125000, spend: 36000, commission: 12, orders: 1800 };
  const readNonnegative = (id) => {
    const value = Number(byId(id)?.value);
    return Number.isFinite(value) && value >= 0 ? value : NaN;
  };
  const formatROAS = (revenue, spend) => {
    if (spend === 0) return "N/A";
    return (revenue / spend).toFixed(2) + "×";
  };
  function calculateEconomics() {
    const revenue = readNonnegative("revenue");
    const spend = readNonnegative("spend");
    const commission = readNonnegative("commission");
    const orders = readNonnegative("orders");
    const isValid = [revenue, spend, commission, orders].every(Number.isFinite)
      && commission <= 100 && orders >= 1 && Number.isInteger(orders);
    const roas = byId("out-roas"), cpa = byId("out-cpa"),
      contribution = byId("out-contribution"), insight = byId("calc-insight");
    if (![roas, cpa, contribution, insight].every(Boolean)) return;
    if (!isValid) {
      roas.textContent = "—"; cpa.textContent = "—";
      contribution.textContent = "—";
      insight.textContent = "Enter valid nonnegative amounts, 0–100% commission, and at least one whole-number order.";
      return;
    }
    const commissionCost = revenue * commission / 100;
    const acquisitionCost = spend + commissionCost;
    const postAcquisitionRevenue = revenue - acquisitionCost;
    roas.textContent = formatROAS(revenue, spend);
    cpa.textContent = currencyPrecise.format(acquisitionCost / orders);
    contribution.textContent = currency.format(postAcquisitionRevenue);
    if (postAcquisitionRevenue < 0) {
      insight.textContent = "Acquisition costs exceed attributed revenue in this scenario. Revisit partner economics and attribution before scaling.";
    } else if (postAcquisitionRevenue === 0) {
      insight.textContent = "Attributed revenue currently covers acquisition costs only. Product costs and overhead are not included.";
    } else if (spend === 0 && commission === 0) {
      insight.textContent = "No acquisition costs were entered. Validate the cost and attribution inputs before drawing conclusions.";
    } else {
      insight.textContent = "Your scenario leaves positive revenue after spend and commissions. Product costs, returns, and overhead still determine profitability.";
    }
  }
  economicInputs.forEach((input) => input.addEventListener("input", calculateEconomics));
  byId("economics-form")?.addEventListener("submit", (event) => {
    event.preventDefault(); calculateEconomics();
  });
  byId("reset-metrics")?.addEventListener("click", () => {
    Object.entries(initialEconomicValues).forEach(([key, value]) => {
      if (byId(key)) byId(key).value = value;
    });
    calculateEconomics();
  });
  calculateEconomics();

  // Lab 002 — local CSV processing with quoted-field support and safe DOM output.
  const maxBytes = 1024 * 1024;
  const maxRows = 1000;
  const status = byId("partner-message");
  const partnerBody = byId("partner-rows");
  const showPartnerStatus = (message) => {
    if (status) status.textContent = message;
  };
  function partnerSignal(spend, revenue) {
    if (spend === 0) return { label: "Check data", type: "review" };
    const roas = revenue / spend;
    if (roas >= 4) return { label: "Strong ROAS", type: "strong" };
    if (roas >= 2) return { label: "Monitor", type: "watch" };
    return { label: "Review", type: "review" };
  }
  function renderPartners(partners) {
    if (!partnerBody) return;
    partnerBody.replaceChildren();
    partners.forEach(({ partner, spend, revenue, orders }) => {
      const tr = document.createElement("tr");
      [partner, currency.format(revenue), currency.format(spend),
        formatROAS(revenue, spend), count.format(orders)].forEach((value) => {
        const td = document.createElement("td");
        td.textContent = value;
        tr.appendChild(td);
      });
      const cell = document.createElement("td");
      const signal = partnerSignal(spend, revenue);
      const badge = document.createElement("span");
      badge.className = "signal signal-" + signal.type;
      badge.textContent = signal.label;
      cell.appendChild(badge);
      tr.appendChild(cell);
      partnerBody.appendChild(tr);
    });
  }

  // A small RFC4180-style parser to handle escaped quotes, delimiters and line breaks.
  function parseCSV(data) {
    const rows = [];
    let row = [], value = "", inQuotes = false, atStart = true;
    const normalized = data.replace(/^\uFEFF/, "");
    for (let i = 0; i < normalized.length; i++) {
      const c = normalized[i];
      if (c === '"') {
        if (inQuotes && normalized[i + 1] === '"') {
          value += '"'; i++;
        } else if (inQuotes) {
          inQuotes = false;
        } else if (atStart) {
          inQuotes = true;
        } else {
          throw new Error("Unexpected quotation mark in CSV field.");
        }
        atStart = false;
      } else if (c === "," && !inQuotes) {
        row.push(value); value = ""; atStart = true;
      } else if ((c === "\n" || c === "\r") && !inQuotes) {
        if (c === "\r" && normalized[i + 1] === "\n") i++;
        row.push(value); value = ""; atStart = true;
        if (row.some((v) => v.trim().length)) rows.push(row);
        if (rows.length > maxRows + 1) throw new Error("Limit your CSV to 1,000 partners.");
        row = [];
      } else {
        value += c;
        atStart = false;
      }
    }
    if (inQuotes) throw new Error("An imported CSV cell has an unclosed quote.");
    row.push(value);
    if (row.some((v) => v.trim().length)) rows.push(row);
    if (rows.length > maxRows + 1) throw new Error("Limit your CSV to 1,000 partners.");
    return rows;
  }
  function normalizePartners(data) {
    const rows = parseCSV(data);
    if (rows.length < 2) throw new Error("Please include a header row and at least one partner.");
    const headers = rows.shift().map((v) => v.toLowerCase().trim());
    const cols = ["partner", "spend", "revenue", "orders"]
      .map((name) => headers.indexOf(name));
    if (cols.some((i) => i < 0)) {
      throw new Error("Required CSV columns: partner, spend, revenue, orders.");
    }
    return rows.map((cells, index) => {
      const partner = (cells[cols[0]] || "").trim();
      const spend = Number((cells[cols[1]] || "").trim());
      const revenue = Number((cells[cols[2]] || "").trim());
      const rawOrders = (cells[cols[3]] || "").trim();
      const orders = Number(rawOrders);
      if (!partner || partner.length > 90 || [spend, revenue, orders]
        .some((n) => !Number.isFinite(n) || n < 0) || !Number.isInteger(orders)
        || !rawOrders.length || !String(cells[cols[1]] ?? "").trim()
        || !String(cells[cols[2]] ?? "").trim()) {
        throw new Error("Invalid values on CSV data row " + (index + 2) +
          ". Partner must be 1–90 characters, spend/revenue nonnegative, and orders a whole number.");
      }
      return { partner, spend, revenue, orders };
    });
  }
  renderPartners(SAMPLE_PARTNERS);
  const csvInput = byId("csv-upload");
  csvInput?.addEventListener("change", async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      if (file.size > maxBytes) throw new Error("File exceeds the 1 MB limit.");
      const data = await file.text();
      const partners = normalizePartners(data);
      renderPartners(partners);
      showPartnerStatus("Loaded " + count.format(partners.length) +
        " partners locally. Your CSV was not uploaded or sent to a server.");
    } catch (error) {
      showPartnerStatus("Import failed: " + (error.message || "Unknown CSV error") +
        " The previous table remains unchanged.");
    } finally {
      csvInput.value = "";
    }
  });
  byId("restore-partners")?.addEventListener("click", () => {
    renderPartners(SAMPLE_PARTNERS);
    showPartnerStatus("Showing fictional sample partner data. Your imported CSV stays on this device.");
  });
  byId("sample-csv")?.addEventListener("click", () => {
    const rows = [["partner", "spend", "revenue", "orders"],
      ...SAMPLE_PARTNERS.map(({partner, spend, revenue, orders}) =>
        [partner, spend, revenue, orders])];
    const csv = rows.map((row) => row.map((v) => {
      const value = String(v);
      return /[,"\r\n]/.test(value) ? '"' + value.replace(/"/g, '""') + '"' : value;
    }).join(",")).join("\r\n") + "\r\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "cayari_sample_partners.csv";
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  // Lab 003 — a transparent, deterministic planning aid; no model calls.
  const workflows = {
    affiliate: {
      context: "Partner-level economics, incremental contribution, and channel mix.",
      data: "Partner ID, attributed sales, commissions, media spend, orders, returns, date range, attribution window.",
      process: "Calculate ROAS and post-commission revenue; segment outliers; compare like-for-like cohorts; rank 3 testable opportunities.",
      qa: "Flag ambiguous attribution, promotional overlap, affiliate fraud indicators, outliers, and missing margin data.",
      output: "One-page partner opportunity table, 3 experiments, owners, hypotheses, and measurable success criteria."
    },
    paid: {
      context: "Paid acquisition efficiency and creative learning.",
      data: "Channel, campaign, cost, impressions, clicks, qualified conversions, revenue, period, attribution method.",
      process: "Normalize spend and conversion definitions; analyze by funnel stage; identify waste and promising tests.",
      qa: "Flag low sample sizes, tracking anomalies, misleading platform attribution, and learning-phase changes.",
      output: "Channel opportunity ranking, 3 controlled creative or audience tests, guardrail metrics, and review cadence."
    },
    lifecycle: {
      context: "Customer retention, journey friction, and responsible personalization.",
      data: "Consent status, segment, journey stage, send/open/click/conversion events, cohort, unsubscribe rate.",
      process: "Map customer journey; find drop-off points; draft a limited set of lifecycle tests by priority.",
      qa: "Protect personal data, check opt-outs and consent, guard against spurious causality, check suppression rules.",
      output: "Journey map, 3 test briefs, target segments, holdout plan, and reporting fields."
    },
    creator: {
      context: "Creator partnership fit, content usefulness, and sustainable acquisition.",
      data: "Creator niche, contracted assets, content performance, rights, cost, clicks, conversions, audience overlap.",
      process: "Evaluate fit and creator economics; map potential creative tests; prioritize authentic collaborations.",
      qa: "Check usage rights and disclosures, avoid vanity metrics, validate claims, review brand safety and duplicates.",
      output: "Creator scorecard, outreach hypotheses, 3 pilot concepts, measurement plan, and approval checkpoints."
    }
  };
  function makeBlueprint() {
    const channel = byId("blueprint-channel")?.value || "affiliate";
    const goal = (byId("blueprint-goal")?.value || "").trim();
    const workflow = workflows[channel] || workflows.affiliate;
    const brief = [
      "ROLE",
      "Act as a senior marketing strategy analyst. Be critical, precise, and transparent.",
      "",
      "OBJECTIVE",
      goal || "Identify a measurable opportunity and propose experiments.",
      "",
      "BUSINESS CONTEXT",
      workflow.context,
      "",
      "REQUESTED DATA",
      workflow.data,
      "",
      "ANALYSIS WORKFLOW",
      workflow.process,
      "",
      "QUALITY + SAFETY GATES",
      workflow.qa,
      "Never invent metrics, case studies, sources, or business facts.",
      "Mark unknowns, distinguish correlation from causation, and request missing inputs.",
      "Use anonymized or consented data only; keep sensitive personal information out of public tools.",
      "",
      "DELIVERABLE",
      workflow.output,
      "",
      "HUMAN APPROVAL",
      "Require a marketer to verify assumptions, compliance, brand voice, and recommendations before execution.",
      "",
      "NOTE: This is a prompt template, not an AI-generated response."
    ].join("\n");
    if (byId("blueprint-text")) byId("blueprint-text").textContent = brief;
    return brief;
  }
  const blueprintForm = byId("blueprint-form");
  blueprintForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    makeBlueprint();
  });
  byId("blueprint-channel")?.addEventListener("change", makeBlueprint);
  byId("copy-blueprint")?.addEventListener("click", async () => {
    const button = byId("copy-blueprint");
    if (!button) return;
    try {
      await navigator.clipboard.writeText(byId("blueprint-text")?.textContent || "");
      button.textContent = "Copied ✓";
    } catch {
      button.textContent = "Select the text to copy";
      byId("blueprint-text")?.focus();
    }
  });
  makeBlueprint();
})();
