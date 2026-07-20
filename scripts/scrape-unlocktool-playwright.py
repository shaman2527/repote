"""
Scrape unlocktool.net/models/ using Playwright (headless Chromium).
Bypasses Cloudflare protection by running a real browser.
"""

import json
import re
import os
import time
from playwright.sync_api import sync_playwright

BASE_URL = "https://unlocktool.net"
os.makedirs("data", exist_ok=True)

def extract_text_content(page):
    """Extract all visible text content from page."""
    return page.evaluate("""() => {
        const body = document.body;
        const clone = body.cloneNode(true);
        // Remove scripts, styles, nav, header, footer
        clone.querySelectorAll('script, style, nav, header, footer, .menu, .nav, navigation').forEach(el => el.remove());
        return clone.innerText;
    }""")

def get_links(page):
    """Get all links on page."""
    return page.evaluate("""() => {
        return Array.from(document.querySelectorAll('a[href]'))
            .map(a => ({ text: a.innerText.trim(), href: a.href }))
            .filter(l => l.text && l.href && !l.href.startsWith('javascript') && !l.href.startsWith('#'));
    }""")

print("=" * 60)
print("Scraping unlocktool.net with Playwright")
print("=" * 60)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        viewport={"width": 1920, "height": 1080}
    )
    page = context.new_page()
    
    print("\nNavigating to main page...")
    try:
        page.goto(f"{BASE_URL}/models/", timeout=90000, wait_until="domcontentloaded")
        print(f"Page loaded! Title: {page.title()}")
        print(f"URL: {page.url}")
        
        # Wait a bit for dynamic content
        page.wait_for_timeout(3000)
        
        # Get page content
        content = extract_text_content(page)
        print(f"\nContent length: {len(content)} chars")
        print(f"\nFirst 1000 chars:")
        print(content[:1000])
        
        # Save full text
        with open("data/unlocktool-playwright.txt", "w", encoding="utf-8") as f:
            f.write(content)
        
        # Get all links
        all_links = get_links(page)
        print(f"\nTotal links: {len(all_links)}")
        
        # Filter relevant links
        brand_keywords = ['samsung', 'xiaomi', 'huawei', 'tecno', 'infinix', 'apple', 'lg',
                         'motorola', 'nokia', 'google', 'oneplus', 'oppo', 'vivo', 'realme',
                         'alcatel', 'zte', 'blu', 'blackview', 'tcl', 'lenovo', 'honor',
                         'poco', 'redmi', 'meizu', 'sony', 'asus', 'model', 'phone', 'device']
        
        brand_links = [l for l in all_links if any(kw in l['text'].lower() or kw in l['href'].lower() for kw in brand_keywords)]
        
        print(f"\nBrand/device links: {len(brand_links)}")
        for l in brand_links[:30]:
            print(f"  [{l['text'][:30]:30s}] {l['href'][:80]}")
        
        # Collect all model text
        all_text = [content]
        visited = set()
        
        # Visit detail pages
        for i, link in enumerate(brand_links[:50]):
            href = link['href']
            if href in visited:
                continue
            visited.add(href)
            
            print(f"\n[{i+1}/{min(50, len(brand_links))}] Visiting {href[:80]}...")
            try:
                page.goto(href, timeout=30000, wait_until="networkidle")
                page.wait_for_timeout(2000)
                sub_content = extract_text_content(page)
                all_text.append(sub_content)
                print(f"  Got {len(sub_content)} chars")
                
                # Get device detail links from this page
                sub_links = get_links(page)
                detail_links = [l for l in sub_links if '/model/' in l['href'] or '/device/' in l['href'] 
                               or '/phone/' in l['href'] or ('/' in l['href'] and l['href'].count('/') >= 4)]
                
                for dl in detail_links[:5]:
                    if dl['href'] not in visited:
                        visited.add(dl['href'])
                        try:
                            page.goto(dl['href'], timeout=20000, wait_until="domcontentloaded")
                            page.wait_for_timeout(1500)
                            detail_content = extract_text_content(page)
                            all_text.append(detail_content)
                        except:
                            pass
                
            except Exception as e:
                print(f"  Error: {e}")
        
        # Parse models from all collected text
        full_text = "\n".join(all_text)
        
        # Extract lines that look like phone models
        lines = full_text.split("\n")
        phone_lines = []
        
        BRANDS = ['Samsung', 'Apple', 'Xiaomi', 'Huawei', 'Honor', 'Tecno', 'Infinix',
                  'Motorola', 'LG', 'Google', 'Nokia', 'OnePlus', 'Oppo', 'Vivo', 'Realme',
                  'Alcatel', 'ZTE', 'BLU', 'Blackview', 'Umidigi', 'TCL', 'Lenovo',
                  'POCO', 'Redmi', 'Meizu', 'Sony', 'Asus', 'GM', 'Gionee', 'Itel']
        
        for line in lines:
            line = line.strip()
            if len(line) > 5 and len(line) < 200:
                for b in BRANDS:
                    if b.lower() in line.lower() and not any(skip in line.lower() for skip in 
                        ['copyright', 'all rights', 'privacy', 'terms', 'cookie', 'email', 
                         'password', 'login', 'register', 'facebook', 'twitter', 'instagram',
                         'https://', 'http://', 'www.', '.com', '.net', '.org']):
                        phone_lines.append(line)
                        break
        
        # Deduplicate
        phone_lines = list(dict.fromkeys(phone_lines))
        
        print(f"\n{'=' * 60}")
        print(f"Total phone model lines: {len(phone_lines)}")
        print(f"{'=' * 60}")
        
        with open("data/unlocktool-all-models.txt", "w", encoding="utf-8") as f:
            f.write("\n".join(phone_lines))
        
        print("\nSample:")
        for l in phone_lines[:50]:
            print(f"  {l}")
        
        # Parse into structured data
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
        
        print("\nSample structured:")
        for s in structured[:30]:
            print(f"  {s['brand']:12s} {s['model']}")
        
    except Exception as e:
        print(f"Error: {e}")
    
    browser.close()
