"""
Scrape unlocktool.net using undetected-chromedriver (bypasses Cloudflare).
"""

import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import json
import re
import os
import time

BASE_URL = "https://unlocktool.net"
os.makedirs("data", exist_ok=True)

BRANDS = ['Samsung', 'Apple', 'Xiaomi', 'Huawei', 'Honor', 'Tecno', 'Infinix',
          'Motorola', 'LG', 'Google', 'Nokia', 'OnePlus', 'Oppo', 'Vivo', 'Realme',
          'Alcatel', 'ZTE', 'BLU', 'Blackview', 'Umidigi', 'TCL', 'Lenovo',
          'POCO', 'Redmi', 'Meizu', 'Sony', 'Asus', 'GM', 'Gionee', 'Itel']

print("=" * 60)
print("Scraping unlocktool.net with undetected-chromedriver")
print("=" * 60)

options = uc.ChromeOptions()
options.add_argument('--headless=new')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
options.add_argument('--disable-blink-features=AutomationControlled')

driver = uc.Chrome(options=options)

try:
    print("\nNavigating to main page...")
    driver.get(f"{BASE_URL}/models/")
    time.sleep(5)
    
    print(f"Title: {driver.title}")
    print(f"URL: {driver.current_url}")
    
    # Get page text
    body = driver.find_element(By.TAG_NAME, "body")
    content = body.text
    print(f"\nContent length: {len(content)} chars")
    print(f"\nFirst 1500 chars:")
    print(content[:1500])
    
    if "Just a moment" in content or "security verification" in content.lower():
        print("\nStill behind Cloudflare. Waiting longer...")
        time.sleep(10)
        content = driver.find_element(By.TAG_NAME, "body").text
        print(f"After wait: {content[:500]}")
    
    # Save
    with open("data/unlocktool-undetected.txt", "w", encoding="utf-8") as f:
        f.write(content)
    
    # Find all links
    links = driver.find_elements(By.TAG_NAME, "a")
    all_links = []
    for a in links:
        href = a.get_attribute("href")
        text = a.text.strip()
        if href and text and not href.startswith("javascript") and not href.startswith("#"):
            all_links.append({"text": text[:80], "href": href})
    
    print(f"\nTotal links: {len(all_links)}")
    
    brand_links = [l for l in all_links if any(b.lower() in l['text'].lower() or b.lower() in l['href'].lower() 
                   for b in BRANDS + ['model', 'phone', 'device'])]
    
    print(f"Brand/device links: {len(brand_links)}")
    for l in brand_links[:20]:
        print(f"  [{l['text'][:30]:30s}] {l['href'][:80]}")
    
    # Collect all text
    all_texts = [content]
    visited = set()
    
    for i, link in enumerate(brand_links[:30]):
        href = link['href']
        if href in visited:
            continue
        visited.add(href)
        
        print(f"\n[{i+1}/30] {link['text'][:30]}...", end=" ")
        try:
            driver.get(href)
            time.sleep(3)
            sub_text = driver.find_element(By.TAG_NAME, "body").text
            all_texts.append(sub_text)
            print(f"{len(sub_text)} chars")
            
            # Get sub-links
            sub_as = driver.find_elements(By.TAG_NAME, "a")
            detail_links = []
            for a in sub_as:
                h = a.get_attribute("href")
                t = a.text.strip()
                if h and t and not h.startswith("javascript") and not h.startswith("#"):
                    if '/model/' in h or '/device/' in h or '/phone/' in h or h.count('/') >= 4:
                        detail_links.append({"text": t[:50], "href": h})
            
            for dl in detail_links[:5]:
                if dl['href'] not in visited:
                    visited.add(dl['href'])
                    try:
                        driver.get(dl['href'])
                        time.sleep(2)
                        dt = driver.find_element(By.TAG_NAME, "body").text
                        all_texts.append(dt)
                    except:
                        pass
        except Exception as e:
            print(f"Error: {e}")
    
    # Parse
    full_text = "\n".join(all_texts)
    
    lines = full_text.split("\n")
    phone_lines = []
    
    for line in lines:
        line = line.strip()
        if 5 < len(line) < 200:
            for b in BRANDS:
                if b.lower() in line.lower():
                    phone_lines.append(line)
                    break
    
    phone_lines = list(dict.fromkeys(phone_lines))
    
    print(f"\n{'=' * 60}")
    print(f"Total phone model lines: {len(phone_lines)}")
    
    with open("data/unlocktool-all-models.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(phone_lines))
    
    print("\nSample:")
    for l in phone_lines[:50]:
        print(f"  {l}")
    
    # Parse structured
    structured = []
    for entry in phone_lines:
        for b in sorted(BRANDS, key=len, reverse=True):
            if b.lower() in entry.lower():
                idx = entry.lower().index(b.lower())
                model_part = entry[idx + len(b):].strip().strip('-:;,.').strip()
                model_part = re.sub(r'\s+', ' ', model_part).strip()
                if model_part and len(model_part) > 1:
                    structured.append({
                        'brand': 'Xiaomi' if b == 'Redmi' else ('Huawei' if b == 'Honor' else b),
                        'model': model_part,
                        'source': entry
                    })
                break
    
    print(f"\nStructured entries: {len(structured)}")
    with open("data/unlocktool-structured.json", "w", encoding="utf-8") as f:
        json.dump(structured, f, ensure_ascii=False, indent=2)
    
    for s in structured[:30]:
        print(f"  {s['brand']:12s} {s['model']}")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()

finally:
    driver.quit()
