"""
Fast scrape phonesdata.com - all Xiaomi models + images by year (2012-2026)
"""
import cloudscraper, json, re, os, time, sys
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse, parse_qs

BASE = "https://phonesdata.com"
os.makedirs("data", exist_ok=True)
sys.stdout.reconfigure(encoding='utf-8')

scraper = cloudscraper.create_scraper(browser={'browser': 'chrome', 'platform': 'windows', 'desktop': True})

def fetch(url):
    for retry in range(3):
        try:
            r = scraper.get(url, timeout=30)
            if r.status_code == 200:
                return r.text
            print(f"  HTTP {r.status_code}: {url}")
        except Exception as e:
            print(f"  Retry {retry+1}: {e}")
        time.sleep(2)
    return None

def parse_listing(html):
    """Extract phone names, URLs, and images from a listing page."""
    soup = BeautifulSoup(html, "html.parser")
    phones = []

    # Each phone is typically in a div with class containing 'item' or similar
    # Find all links that point to phone detail pages
    for a in soup.find_all("a", href=True):
        href = a["href"]
        text = a.get_text(strip=True)

        is_phone_link = any(kw in href for kw in ["/movil/", "/phone/", "/smartphones/"]) and not href.endswith("/es/smartphones/")

        if is_phone_link and text and len(text) > 3:
            img = a.find("img")
            img_src = ""
            if img:
                img_src = img.get("src") or img.get("data-src") or img.get("data-lazy-src") or ""
            phones.append({
                "name": text.strip(),
                "url": urljoin(BASE, href),
                "img": img_src,
            })

    return phones

def get_phone_images(phones):
    """Get images from detail pages (only for phones that don't have images)."""
    need_images = [p for p in phones if not p.get("img")]
    print(f"  Fetching images for {len(need_images)} phones...")
    for i, p in enumerate(need_images):
        html = fetch(p["url"])
        if html:
            soup = BeautifulSoup(html, "html.parser")
            # Find main phone image
            for img in soup.find_all("img"):
                src = img.get("src") or img.get("data-src") or ""
                alt = img.get("alt", "")
                if src and ("phone" in src or "smartphone" in src or "movil" in src):
                    if len(src) > 10:
                        p["img"] = urljoin(BASE, src) if src.startswith("/") else src
                        break
            # Also check for image in the phone-image container
            if not p.get("img"):
                for div in soup.find_all("div", class_=re.compile(r"phone|device|image|photo", re.I)):
                    img = div.find("img")
                    if img:
                        src = img.get("src") or img.get("data-src") or ""
                        if src:
                            p["img"] = urljoin(BASE, src) if src.startswith("/") else src
                            break
        time.sleep(0.3)
    return phones

print("Scraping phonesdata.com - Xiaomi by year")
print("=" * 60)

all_phones = []
seen = set()

for year in range(2012, 2027):
    url = f"{BASE}/es/smartphones/xiaomi/{year}/"
    print(f"\n{year}: fetching {url}...")
    html = fetch(url)
    if not html:
        print(f"  SKIP")
        continue

    phones = parse_listing(html)
    print(f"  Found {len(phones)}")

    # Check for pagination
    soup = BeautifulSoup(html, "html.parser")
    max_page = 1
    for a in soup.find_all("a", href=True):
        if re.search(rf"/es/smartphones/xiaomi/{year}/\d+", a["href"]):
            t = a.get_text(strip=True)
            if t.isdigit():
                max_page = max(max_page, int(t))

    if max_page > 1:
        print(f"  Pages: {max_page}")
        for pg in range(2, max_page + 1):
            pg_url = f"{BASE}/es/smartphones/xiaomi/{year}/{pg}/"
            pg_html = fetch(pg_url)
            if pg_html:
                pg_phones = parse_listing(pg_html)
                phones.extend(pg_phones)
                print(f"    Page {pg}: +{len(pg_phones)}")
            time.sleep(0.5)

    # Deduplicate while adding
    new_count = 0
    for p in phones:
        key = (p["name"].lower().strip(), p["url"])
        if key not in seen:
            seen.add(key)
            p["year"] = year
            all_phones.append(p)
            new_count += 1

    print(f"  New: {new_count}, Total: {len(all_phones)}")
    time.sleep(0.5)

print(f"\n{'=' * 60}")
print(f"Total unique Xiaomi phones: {len(all_phones)}")
print(f"{'=' * 60}")

# Save
with open("data/phonesdata-xiaomi.json", "w", encoding="utf-8") as f:
    json.dump(all_phones, f, ensure_ascii=False, indent=2)

print("\nSample:")
for p in all_phones[:20]:
    print(f"  [{p['year']}] {p['name'][:50]:50s} img={p['img'][:40] if p.get('img') else 'no-img'}")

# Now get images for phones that don't have them
phones_without_img = [p for p in all_phones if not p.get("img")]
if phones_without_img:
    print(f"\nGetting images for {len(phones_without_img)} phones...")
    get_phone_images(phones_without_img)

# Save final version with images
with open("data/phonesdata-xiaomi.json", "w", encoding="utf-8") as f:
    json.dump(all_phones, f, ensure_ascii=False, indent=2)

print(f"\nDone! Final file: data/phonesdata-xiaomi.json ({len(all_phones)} phones)")
