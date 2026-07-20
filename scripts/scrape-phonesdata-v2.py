"""
Scrape phonesdata.com - ALL phone models with images by year.
Fast: extracts from listing pages, no detail pages needed.
"""
import cloudscraper, json, re, os, time, sys
from bs4 import BeautifulSoup
from urllib.parse import urljoin

BASE = "https://phonesdata.com"
os.makedirs("data", exist_ok=True)
sys.stdout.reconfigure(encoding='utf-8')

scraper = cloudscraper.create_scraper()

def fetch(url):
    for retry in range(2):
        try:
            r = scraper.get(url, timeout=20)
            if r.status_code == 200:
                return r.text
        except:
            time.sleep(2)
    return None

def extract_phones(html, year_label=""):
    """Extract phone models with images from a listing page."""
    soup = BeautifulSoup(html, "html.parser")
    phones = []
    seen_urls = set()

    for a in soup.find_all("a", href=True):
        h = a["href"]
        t = a.get_text(strip=True)
        t_clean = re.sub(r'\s+', ' ', t).strip()

        # Must contain a phone name (not a year/language/filter)
        if not t_clean or len(t_clean) < 4:
            continue
        if t_clean.isdigit():
            continue
        # Skip non-phone text
        skip_words = ["english", "deutsch", "espanol", "italiano",
                      "portugues", "turkce", "smartphones", "moviles",
                      "telefonos", "todos", "nuevos", "ofertas"]
        if t_clean.lower() in skip_words or any(s in t_clean.lower() for s in ["ver todo", "ver m\u00e1s"]):
            continue

        # Must have an image
        img = a.find("img")
        if not img:
            continue
        img_src = img.get("src") or img.get("data-src") or ""
        if not img_src:
            continue

        # Must be a phone detail URL pattern
        if not re.search(r"-\d{5,}/?$", h.strip("/")):
            continue

        url = urljoin(BASE, h)
        if url in seen_urls:
            continue
        seen_urls.add(url)

        parts = h.strip("/").split("/")
        brand = parts[2] if len(parts) > 2 else ""

        phones.append({
            "name": t_clean,
            "url": url,
            "img": img_src,
            "brand": brand,
            "year": year_label,
        })

    return phones

# Map phonesdata brand slugs to our brand names
BRAND_MAP = {
    "xiaomi": "Xiaomi", "samsung": "Samsung", "apple": "Apple",
    "apple-iphone": "Apple", "huawei": "Huawei", "honor": "Huawei",
    "tecno": "Tecno", "infinix": "Infinix", "motorola": "Motorola",
    "lg": "LG", "nokia": "Nokia", "google": "Google",
    "google-pixel": "Google", "oneplus": "OnePlus", "oppo": "Oppo",
    "vivo": "Vivo", "realme": "Realme", "alcatel": "Alcatel",
    "zte": "ZTE", "blu": "BLU", "blackview": "Blackview",
    "tcl": "TCL", "lenovo": "Lenovo", "meizu": "Meizu",
    "sony": "Sony", "asus": "Asus",
}

# Only scrape brands we care about + Xiaomi by year
FOCUS_BRANDS = ["xiaomi", "samsung", "tecno", "infinix", "motorola",
                "lg", "nokia", "alcatel", "zte", "google",
                "oneplus", "oppo", "vivo", "realme", "blackview", "tcl", "huawei"]

all_phones = []
seen = set()

# 1. Xiaomi by year (2012-2026)
print("=== XIAOMI BY YEAR ===")
for year in range(2012, 2027):
    url = f"{BASE}/es/smartphones/xiaomi/{year}/"
    html = fetch(url)
    if not html:
        continue
    phones = extract_phones(html, str(year))
    count = 0
    for p in phones:
        if p["url"] not in seen:
            seen.add(p["url"])
            p["brand_clean"] = "Xiaomi"
            all_phones.append(p)
            count += 1
    print(f"  {year}: {count} phones")
    time.sleep(0.3)

print(f"Xiaomi total: {len(all_phones)}")

# 2. Other brands (main page only)
for brand_slug in FOCUS_BRANDS:
    if brand_slug == "xiaomi":
        continue
    brand_name = BRAND_MAP.get(brand_slug, brand_slug.capitalize())
    url = f"{BASE}/es/smartphones/{brand_slug}/"
    print(f"\n=== {brand_name} ===")
    html = fetch(url)
    if not html:
        print(f"  SKIP")
        continue
    phones = extract_phones(html, "")
    count = 0
    for p in phones:
        if p["url"] not in seen:
            seen.add(p["url"])
            p["brand_clean"] = brand_name
            all_phones.append(p)
            count += 1
    print(f"  {count} phones")
    time.sleep(0.3)

print(f"\n{'=' * 60}")
print(f"GRAND TOTAL: {len(all_phones)} phones")
print(f"{'=' * 60}")

# Save
with open("data/phonesdata-all.json", "w", encoding="utf-8") as f:
    json.dump(all_phones, f, ensure_ascii=False, indent=2, default=str)

# Print sample with images
phones_with_img = [p for p in all_phones if p.get("img")]
print(f"\nPhones with images: {len(phones_with_img)}")
print("\nSample:")
for p in all_phones[:20]:
    y = f"[{p['year']}]" if p.get("year") else "     "
    b = p.get("brand_clean", p.get("brand", ""))
    i = "img" if p.get("img") else "   "
    print(f"  {y} {b:12s} {p['name'][:45]:45s} {i}")
