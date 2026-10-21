# CAYARI Marketing · Michelle Bayer, MBA

**Growth strategy meets applied AI.** A public, mobile-friendly portfolio for a senior marketing leader with 20+ years of experience across performance, partnerships, lifecycle, and affiliate growth.

**Public website:** https://oneocean933.github.io/ *(requires GitHub Pages to be enabled and a successful deployment)*

> **Why this repository is public:** So colleagues and recruiters can inspect real work, not just read "I use AI." The site is AI-assisted, human-directed, and explicit about which demos actually use AI versus standard JavaScript and math.

## What's here

- **Career case study:** Blueair affiliate program grown to roughly $1M revenue in about three months (career highlight supplied by site owner).
- **Real AI code:** [AI-assisted LinkedIn content workflow](https://github.com/Oneocean933/linkedin-content-automation) — a separate Python project with OpenAI API integration, topic deduplication, formatting checks, tests, and GitHub Actions. It produces drafts for **human review**, not automatic LinkedIn publication.
- **Lab 001 — Affiliate economics:** Calculates revenue ÷ media spend (media ROAS), media spend plus commissions ÷ orders (acquisition cost per order), and revenue minus both acquisition costs. Excludes product costs, returns, taxes, and overhead.
- **Lab 002 — Partner performance:** A functional CSV importer calculating partner ROAS and rule-based signals. Imported data stays in the browser, with no network calls.
- **Lab 003 — AI workflow blueprint:** A deterministic prompt/brief builder that documents inputs, analysis plans, review criteria, and human approval. It **does not** call an AI model.

The header dashboard uses fictional data, visibly labeled as an illustration rather than actual client reporting.

## Tech stack

Plain HTML, CSS, and JavaScript — no build tools, third-party runtime dependencies, API keys, trackers, or backend services.

Files:
- `index.html` — semantic content, demo markup, and accessibility structure.
- `styles.css` — responsive design system with focus states and reduced-motion support.
- `app.js` — calculator, safe CSV parser, prompt-blueprint builder, and mobile navigation.
- `favicon.svg` — lightweight scalable brand mark.
- `tests/check_site.py` — standard-library structural integrity checks.
- `.github/workflows/deploy-pages.yml` — automated validation and deployment.

## Preview on your computer

```bash
python3 -m http.server 8000
```

Open http://localhost:8000 in a browser and use the three labs.

Check the site's static integrity:

```bash
python3 tests/check_site.py
```

## Publishing through GitHub Pages

Every push to `main` triggers the included deployment workflow.

If this repository hasn't used GitHub Pages before:
1. Open **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. In **Actions → Publish CAYARI portfolio**, run the workflow if needed.
4. Confirm a successful deployment before sharing https://oneocean933.github.io/.

The workflow stages only four public web assets in `_site`. It does not publish Git internals, test data, or the older PDF stored elsewhere in this repository.

### Custom domain

A custom domain is not yet configured. After confirming ownership of the domain, add it via **Settings → Pages → Custom domain**, follow GitHub's DNS records, and enable HTTPS. Do not add an assumed domain or speculative CNAME.

## Privacy and limitations

- No user accounts, analytics pixels, third-party scripts, or cookies.
- CSV processing is entirely local; limit: 1MB / 1,000 partners.
- Imported labels are safely rendered as text, not executable markup.
- Example calculator amounts and partner names are fictional.
- Rule-based signals are heuristics, not a real AI risk or investment model.
- Results and public marketing achievements aren't presented as independently audited case studies.
- Separate AI automation code requires keys provided through private environment variables or GitHub Secrets, never committed to a public repository.

## AI-assisted development disclosure

The portfolio was built using a **human-directed, AI-assisted** coding process, with explicit review of business claims, limitations, and data handling. The public source makes it easy to verify what each component does. The separate LinkedIn automation project demonstrates an actual model API integration.

© 2026 CAYARI Marketing · Michelle Bayer, MBA
