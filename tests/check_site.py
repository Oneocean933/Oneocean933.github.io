"""Dependency-free structural checks for the CAYARI public portfolio."""
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REQUIRED_ASSETS = ("index.html", "styles.css", "app.js", "favicon.svg")
REQUIRED_SECTIONS = {"top", "main", "about", "work", "labs", "approach", "contact"}
REQUIRED_INTERACTIONS = {
    "revenue", "spend", "commission", "orders", "reset-metrics",
    "csv-upload", "partner-rows", "restore-partners", "sample-csv",
    "blueprint-form", "blueprint-channel", "blueprint-goal", "copy-blueprint",
    "out-roas", "out-cpa", "out-contribution", "calc-insight"
}

class SiteParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = []
        self.anchors = []
        self.assets = []
        self.external_script_urls = []
        self.images_without_alt = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            self.ids.append(a["id"])
        if tag == "a" and a.get("href", "").startswith("#"):
            self.anchors.append(a["href"][1:])
        if tag == "script" and "src" in a:
            self.assets.append(a["src"])
            if a["src"].startswith(("https://", "http://")):
                self.external_script_urls.append(a["src"])
        if tag == "link" and a.get("rel") in {"stylesheet", "icon"}:
            self.assets.append(a.get("href", ""))
        if tag == "img" and "alt" not in a:
            self.images_without_alt.append(a.get("src", "<unknown>"))

def test_site():
    for name in REQUIRED_ASSETS:
        assert (ROOT / name).is_file(), f"Missing published asset: {name}"
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    css = (ROOT / "styles.css").read_text(encoding="utf-8")
    js = (ROOT / "app.js").read_text(encoding="utf-8")
    parser = SiteParser()
    parser.feed(html)
    ids = set(parser.ids)
    assert len(ids) == len(parser.ids), "Duplicate HTML id detected"
    assert REQUIRED_SECTIONS <= ids, f"Missing sections: {REQUIRED_SECTIONS - ids}"
    assert REQUIRED_INTERACTIONS <= ids, f"Missing demo inputs: {REQUIRED_INTERACTIONS - ids}"
    assert all(a in ids for a in parser.anchors), "Broken in-page link"
    assert not parser.external_script_urls, "Unexpected external JavaScript dependency"
    assert not parser.images_without_alt, "Image without alt text"
    for asset in parser.assets:
        if asset.startswith(("https://", "http://")):
            continue
        assert (ROOT / asset.lstrip("./")).is_file(), f"Broken local asset: {asset}"
    for snippet in (".is-open", ".work-grid", ".lab-frame", "prefers-reduced-motion"):
        assert snippet in css, f"Expected styling rule absent: {snippet}"
    for snippet in ("function calculateEconomics", "function parseCSV",
                    "function renderPartners", "function makeBlueprint"):
        assert snippet in js, f"Expected demo logic absent: {snippet}"
    assert "mailto:ms.micheller@gmail.com" not in html, "Unverified contact address"
    print("PASS: static assets, navigation, accessibility basics, and demo source checks")

if __name__ == "__main__":
    test_site()
