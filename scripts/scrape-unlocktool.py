"""
Scrape unlocktool.net/models/ - all phone models with FRP methods.
Uses cloudscraper to bypass Cloudflare protection.
"""

import cloudscraper
import json
import re
import os
import uuid
from bs4 import BeautifulSoup
from urllib.parse import urljoin

BASE_URL = "https://unlocktool.net"
os.makedirs("data", exist_ok=True)

def extract_models_from_page(soup, source_url=""):
    """Extract phone model info from a parsed page."""
    models = []
    
    # Find tables
    tables = soup.find_all("table")
    for table in tables:
        rows = table.find_all("tr")
        for row in rows:
            cells = row.find_all(["td", "th"])
            if len(cells) >= 2:
                text = row.get_text(" ", strip=True)
                if any(skip in text.lower() for skip in ["model", "brand", "name", "description", "price", "action", "select"]):
                    continue
                if 5 < len(text) < 250:
                    models.append(text.strip())
    
    # Find div cards/grid items
    for cls_pattern in ["model", "phone", "device", "product", "item", "card", "box", "grid"]:
        divs = soup.find_all("div", class_=re.compile(cls_pattern, re.I))
        for div in divs:
            text = div.get_text(" ", strip=True)
            links_in_div = div.find_all("a")
            # Get the main link text if available
            for a in links_in_div:
                t = a.get_text(" ", strip=True)
                if t and len(t) > 3 and len(t) < 150 and not any(skip in t.lower() for skip in ["click", "read", "more", "details"]):
                    models.append(t.strip())
    
    # Find all links
    for a in soup.find_all("a", href=True):
        text = a.get_text(" ", strip=True)
        href = a["href"]
        if text and len(text) > 3 and len(text) < 150:
            # Filter navigation/UI links
            if any(skip in text.lower() for skip in ["home", "login", "register", "contact", "about", "page", "next", "prev", "previous"]):
                continue
            if not href.startswith("#") and not href.startswith("javascript"):
                models.append(text.strip())
    
    # Get subpage links
    sub_links = []
    for a in soup.find_all("a", href=True):
        href = a["href"]
        text = a.get_text(" ", strip=True)
        full = urljoin(BASE_URL, href)
        if href and not href.startswith("#") and not href.startswith("javascript") and not href.startswith("tel:") and not href.startswith("mailto:"):
            if href.startswith("/") or BASE_URL in full:
                if text and len(text) > 1:
                    sub_links.append({"text": text.strip()[:80], "url": full})
    
    return list(set(models)), sub_links

print("=" * 60)
print("Scraping unlocktool.net/models/ with cloudscraper")
print("=" * 60)

scraper = cloudscraper.create_scraper(
    browser={
        'browser': 'chrome',
        'platform': 'windows',
        'desktop': True,
    }
)

# Get main page
print("\nFetching main page...")
resp = scraper.get(f"{BASE_URL}/models/", timeout=30)
print(f"Status: {resp.status_code}, Length: {len(resp.text)}")

if resp.status_code != 200:
    print(f"Failed. Trying different URLs...")
    for url in [f"{BASE_URL}/models", f"{BASE_URL}/model-list", f"{BASE_URL}/devices", f"{BASE_URL}/phones"]:
        r = scraper.get(url, timeout=30)
        print(f"  {url}: {r.status_code}")
        if r.status_code == 200:
            resp = r
            break

if resp.status_code == 200:
    html = resp.text
    with open("data/unlocktool-main.html", "w", encoding="utf-8") as f:
        f.write(html)
    
    soup = BeautifulSoup(html, "html.parser")
    page_text = soup.get_text(" ", strip=True)
    print(f"\nPage text sample: {page_text[:500]}")
    print(f"Total text length: {len(page_text)}")
    
    models, sub_links = extract_models_from_page(soup)
    
    # Deduplicate sub_links
    seen_urls = set()
    unique_links = []
    for l in sub_links:
        if l["url"] not in seen_urls:
            seen_urls.add(l["url"])
            unique_links.append(l)
    
    print(f"\nModels found: {len(models)}")
    print(f"Subpage links: {len(unique_links)}")
    
    if models:
        print("\nSample models:")
        for m in models[:30]:
            print(f"  {m}")
    
    print("\nSample links:")
    for l in unique_links[:20]:
        print(f"  {l['text'][:40]:40s} -> {l['url']}")
    
    # Save current models
    with open("data/unlocktool-models.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(sorted(set(models))))
    
    # Visit subpages
    all_models = set(models)
    visited_pages = set()
    
    brand_pages = [l for l in unique_links if any(b in l['text'].lower() or b in l['url'].lower() 
                   for b in ['samsung', 'xiaomi', 'huawei', 'tecno', 'infinix', 'apple', 'lg', 
                             'motorola', 'nokia', 'google', 'oneplus', 'oppo', 'vivo', 'realme',
                             'alcatel', 'zte', 'blu', 'blackview', 'umidigi', 'tcl', 'lenovo',
                             'honor', 'poco', 'redmi', 'mi '])]
    
    print(f"\nBrand pages to visit: {len(brand_pages)}")
    
    for i, link in enumerate(brand_pages[:100]):
        url = link["url"]
        if url in visited_pages:
            continue
        visited_pages.add(url)
        
        print(f"[{i+1}/{len(brand_pages[:100])}] {link['text'][:40]}... ", end="", flush=True)
        try:
            r = scraper.get(url, timeout=20)
            if r.status_code == 200:
                sub_soup = BeautifulSoup(r.text, "html.parser")
                sub_models, sub_links2 = extract_models_from_page(sub_soup)
                all_models.update(sub_models)
                print(f"{len(sub_models)} models")
                
                # Visit device detail pages
                device_links = [l for l in sub_links2 if l['url'] not in visited_pages 
                               and '/model/' in l['url'] or '/device/' in l['url'] or '/phone/' in l['url']]
                for dl in device_links[:10]:
                    if dl['url'] not in visited_pages:
                        visited_pages.add(dl['url'])
                        try:
                            dr = scraper.get(dl['url'], timeout=15)
                            if dr.status_code == 200:
                                ds = BeautifulSoup(dr.text, "html.parser")
                                dm, _ = extract_models_from_page(ds)
                                all_models.update(dm)
                        except:
                            pass
            else:
                print(f"HTTP {r.status_code}")
        except Exception as e:
            print(f"Error: {e}")
        
        import time
        time.sleep(0.5)
    
    # Clean and structure
    print(f"\n{'=' * 60}")
    print(f"Total unique entries: {len(all_models)}")
    
    # Save raw
    with open("data/unlocktool-all-models.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(sorted(all_models)))
    
    # Try to parse into structured data (brand + model)
    BRANDS = ['Samsung', 'Apple', 'Xiaomi', 'Huawei', 'Honor', 'Tecno', 'Infinix', 
              'Motorola', 'LG', 'Google', 'Nokia', 'OnePlus', 'Oppo', 'Vivo', 'Realme',
              'Alcatel', 'ZTE', 'BLU', 'Blackview', 'Umidigi', 'TCL', 'Lenovo', 'POCO',
              'Redmi', 'Meizu', 'Sony', 'Asus']
    
    structured = []
    for entry in sorted(all_models):
        found_brand = None
        for b in BRANDS:
            if b.lower() in entry.lower():
                # Extract model name after brand
                idx = entry.lower().index(b.lower())
                model_part = entry[idx + len(b):].strip().strip('-:;,.').strip()
                if model_part:
                    found_brand = b if b != 'Honor' else 'Huawei'
                    found_brand = b if b != 'Redmi' else 'Xiaomi'
                    model_name = model_part
                    # Clean up
                    model_name = re.sub(r'\s+', ' ', model_name).strip()
                    structured.append({
                        'brand': found_brand,
                        'model': model_name,
                        'source': entry
                    })
                    break
    
    print(f"\nStructured entries with brand+model: {len(structured)}")
    
    with open("data/unlocktool-structured.json", "w", encoding="utf-8") as f:
        json.dump(structured, f, ensure_ascii=False, indent=2)
    
    print("\nSample structured:")
    for s in structured[:30]:
        print(f"  {s['brand']:12s} {s['model']}")
    
else:
    print("Could not access unlocktool.net")
    print("Trying web fetch alternative...")
