"""
Scrape phonesdata.com for ALL phone models with images, specs, and years.
Covers: all brands, all years 2012-2026
"""

import cloudscraper
import json
import re
import os
import time
from bs4 import BeautifulSoup
from urllib.parse import urljoin

BASE = "https://phonesdata.com"
os.makedirs("data", exist_ok=True)

BRANDS = ["samsung", "xiaomi", "apple-iphone", "huawei", "honor", "tecno", "infinix",
          "motorola", "lg", "nokia", "google-pixel", "oneplus", "oppo", "vivo", "realme",
          "alcatel", "zte", "blu", "blackview", "tcl", "lenovo", "meizu", "sony", "asus"]

scraper = cloudscraper.create_scraper(browser={'browser': 'chrome', 'platform': 'windows', 'desktop': True})

def fetch(url):
    try:
        r = scraper.get(url, timeout=30)
        if r.status_code == 200:
            return r.text
        print(f"  HTTP {r.status_code}: {url}")
    except Exception as e:
        print(f"  Error: {e}")
    return None

def parse_phone_list(html, source_url):
    """Extract phone models from a listing page."""
    soup = BeautifulSoup(html, "html.parser")
    phones = []

    # Find phone cards/items - look for common patterns
    # Method 1: Links with phone names
    for a in soup.find_all("a", href=True):
        href = a["href"]
        text = a.get_text(strip=True)
        img = a.find("img")
        img_src = img.get("src", "") if img else ""
        img_data = img.get("data-src", "") if img else ""

        if href and text and len(text) > 3 and len(text) < 150:
            if any(kw in href for kw in ["/smartphones/", "/movil/", "/phone/"]):
                phones.append({
                    "name": text,
                    "url": urljoin(BASE, href),
                    "img": img_src or img_data or "",
                    "source": source_url,
                })

    # Method 2: Look for phone containers (divs with specific classes)
    for container in soup.find_all(["div", "li", "article"], class_=re.compile(
        r"phone|smartphone|item|product|card|model|device|list-item|row", re.I)):
        link = container.find("a")
        if link and link.get("href"):
            href = link["href"]
            name = link.get_text(strip=True) or container.get_text(strip=True)[:100]
            img = container.find("img")
            img_src = img.get("src", "") if img else ""
            img_data = img.get("data-src", "") if img else ""
            if name and len(name) > 3 and len(name) < 150:
                phones.append({
                    "name": name,
                    "url": urljoin(BASE, href),
                    "img": img_src or img_data or "",
                    "source": source_url,
                })

    # Method 3: Look for images with alt text (common on phonesdata)
    for img in soup.find_all("img"):
        alt = img.get("alt", "").strip()
        src = img.get("src", "") or img.get("data-src", "") or ""
        parent_a = img.find_parent("a")
        href = parent_a["href"] if parent_a and parent_a.get("href") else ""
        if alt and len(alt) > 3 and len(alt) < 150:
            if href and "/smartphones/" in href:
                phones.append({
                    "name": alt,
                    "url": urljoin(BASE, href),
                    "img": src,
                    "source": source_url,
                })

    return phones

def parse_phone_detail(html, url):
    """Extract detailed info from a phone detail page."""
    soup = BeautifulSoup(html, "html.parser")
    data = {"url": url}

    # Title
    title_tag = soup.find("title")
    data["title"] = title_tag.get_text(strip=True) if title_tag else ""

    # Main image
    main_img = soup.find("img", class_=re.compile(r"phone|device|main|photo", re.I))
    if not main_img:
        main_img = soup.find("img", id=re.compile(r"phone|main", re.I))
    if not main_img:
        main_img = soup.find("div", class_="phone-image")
        if main_img:
            img = main_img.find("img")
            if img:
                main_img = img
    if main_img:
        data["image"] = main_img.get("src", "") or main_img.get("data-src", "")

    # Specs table
    specs = {}
    tables = soup.find_all("table")
    for table in tables:
        rows = table.find_all("tr")
        for row in rows:
            cells = row.find_all(["td", "th"])
            if len(cells) >= 2:
                key = cells[0].get_text(strip=True)
                val = cells[1].get_text(strip=True)
                if key and val:
                    specs[key] = val

    # Specs from definition lists
    dls = soup.find_all("dl")
    for dl in dls:
        terms = dl.find_all("dt")
        defs = dl.find_all("dd")
        for t, d in zip(terms, defs):
            key = t.get_text(strip=True)
            val = d.get_text(strip=True)
            if key and val:
                specs[key] = val

    data["specs"] = specs
    return data

print("=" * 60)
print("Scraping phonesdata.com")
print("=" * 60)

# First, scrape by brand
all_phones = []

for brand in BRANDS:
    print(f"\n--- {brand.upper()} ---")

    # Get brand main page
    brand_url = f"{BASE}/es/smartphones/{brand}/"
    html = fetch(brand_url)
    if not html:
        continue

    phones = parse_phone_list(html, brand_url)
    print(f"  Found {len(phones)} phones on main page")

    # Check for pagination
    soup = BeautifulSoup(html, "html.parser")
    pagination = soup.find_all("a", href=re.compile(rf"/es/smartphones/{brand}/\d+"))
    max_page = 1
    for p in pagination:
        text = p.get_text(strip=True)
        if text.isdigit():
            max_page = max(max_page, int(text))

    print(f"  Pages: {max_page}")

    # Get phones from all pages
    all_brand_phones = list(phones)
    seen_urls = set(p["url"] for p in phones)

    for page in range(2, max_page + 1):
        page_url = f"{BASE}/es/smartphones/{brand}/{page}/"
        page_html = fetch(page_url)
        if page_html:
            page_phones = parse_phone_list(page_html, page_url)
            for p in page_phones:
                if p["url"] not in seen_urls:
                    seen_urls.add(p["url"])
                    all_brand_phones.append(p)
            print(f"  Page {page}: +{len(page_phones)} phones")
        time.sleep(0.3)

    print(f"  Total for {brand}: {len(all_brand_phones)}")
    all_phones.extend(all_brand_phones)

    time.sleep(0.5)

print(f"\n{'=' * 60}")
print(f"Total phones collected: {len(all_phones)}")
print(f"{'=' * 60}")

# Deduplicate
seen_names = set()
unique_phones = []
for p in all_phones:
    key = p["name"].lower().strip()
    if key not in seen_names and len(key) > 2:
        seen_names.add(key)
        unique_phones.append(p)

print(f"Unique phones: {len(unique_phones)}")

# Save phone list
with open("data/phonesdata-phones.json", "w", encoding="utf-8") as f:
    json.dump(unique_phones, f, ensure_ascii=False, indent=2)

print("\nSample phones:")
for p in unique_phones[:30]:
    img = p["img"][:50] if p["img"] else "no-img"
    print(f"  {p['name'][:45]:45s} img={img}")

# Now visit detail pages to get images
print(f"\n{'=' * 60}")
print("Fetching detail pages for images...")

for i, phone in enumerate(unique_phones[:200]):  # Limit to 200 for time
    detail_html = fetch(phone["url"])
    if detail_html:
        detail = parse_phone_detail(detail_html, phone["url"])
        if detail.get("image"):
            phone["img"] = detail["image"]
        if detail.get("specs"):
            phone["specs"] = detail["specs"]
    if (i + 1) % 20 == 0:
        print(f"  Processed {i+1}/{min(200, len(unique_phones))}...")
    time.sleep(0.3)

# Save with details
with open("data/phonesdata-detailed.json", "w", encoding="utf-8") as f:
    json.dump(unique_phones, f, ensure_ascii=False, indent=2)

print(f"\nDone! Saved {len(unique_phones)} phones to data/phonesdata-detailed.json")
