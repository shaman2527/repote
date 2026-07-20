"""
Simple fast scrape of phonesdata.com - just listing pages, no detail pages.
"""
import cloudscraper, json, re, os, time, sys
from bs4 import BeautifulSoup
from urllib.parse import urljoin

BASE = "https://phonesdata.com"
os.makedirs("data", exist_ok=True)
sys.stdout.reconfigure(encoding='utf-8')

scraper = cloudscraper.create_scraper()

def fetch(url):
    try:
        r = scraper.get(url, timeout=20)
        if r.status_code == 200:
            return r.text
    except:
        pass
    return None

def extract_phones(url):
    html = fetch(url)
    if not html:
        return []
    soup = BeautifulSoup(html, "html.parser")
    phones = []
    seen = set()

    for a in soup.find_all("a", href=True):
        href = a["href"]
        if "/movil/" not in href and "/phone/" not in href:
            continue
        text = a.get_text(strip=True)
        text = re.sub(r'\s+', ' ', text).strip()
        if not text or len(text) < 4:
            continue
        key = text.lower()
        if key in seen:
            continue
        seen.add(key)

        img = a.find("img")
        img_src = ""
        if img:
            img_src = img.get("src") or img.get("data-src") or ""

        phones.append({
            "name": text,
            "url": urljoin(BASE, href),
            "img": img_src,
        })

    return phones

# Focus on Xiaomi
print("Scraping Xiaomi from phonesdata.com...")
all_phones = []
seen_names = set()

for url in [
    f"{BASE}/es/smartphones/xiaomi/",
]:
    html = fetch(url)
    if not html:
        print(f"Failed: {url}")
        continue
    soup = BeautifulSoup(html, "html.parser")

    # Find all year links
    year_links = set()
    for a in soup.find_all("a", href=True):
        m = re.search(r"/es/smartphones/xiaomi/(\d{4})/?", a["href"])
        if m:
            year_links.add(int(m.group(1)))

    print(f"Found years: {sorted(year_links)}")

    for year in sorted(year_links):
        year_url = f"{BASE}/es/smartphones/xiaomi/{year}/"
        phones = extract_phones(year_url)
        for p in phones:
            if p["name"].lower() not in seen_names:
                seen_names.add(p["name"].lower())
                p["year"] = year
                all_phones.append(p)
        print(f"  {year}: {len(phones)} phones (total: {len(all_phones)})")
        time.sleep(0.5)

print(f"\nTotal: {len(all_phones)} Xiaomi phones")

# Save
with open("data/phonesdata-xiaomi.json", "w", encoding="utf-8") as f:
    json.dump(all_phones, f, ensure_ascii=False, indent=2, default=str)

for p in all_phones[:30]:
    print(f"  [{p['year']}] {p['name'][:50]:50s} img={'yes' if p.get('img') else 'no'}")

# Now try other major brands
BRANDS = ["samsung", "apple-iphone", "huawei", "tecno", "infinix", "motorola", "lg", "nokia", "honor"]

for brand in BRANDS:
    print(f"\n--- {brand} ---")
    brand_url = f"{BASE}/es/smartphones/{brand}/"
    phones = extract_phones(brand_url)
    for p in phones:
        if p["name"].lower() not in seen_names:
            seen_names.add(p["name"].lower())
            p["year"] = 0
            p["brand"] = brand
            all_phones.append(p)
    print(f"  {len(phones)} phones (total: {len(all_phones)})")
    time.sleep(0.5)

# Save all
with open("data/phonesdata-all.json", "w", encoding="utf-8") as f:
    json.dump(all_phones, f, ensure_ascii=False, indent=2, default=str)

print(f"\nGrand total: {len(all_phones)} phones")
print(f"Saved to data/phonesdata-all.json")
