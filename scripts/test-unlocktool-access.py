"""
Test: Can we access unlocktool.net with playwright-stealth?
Quick probe to see the page structure.
"""
import json, sys, os, time, random
from playwright.sync_api import sync_playwright
from playwright_stealth import Stealth

BASE_URL = "https://unlocktool.net"
os.makedirs("data", exist_ok=True)

def human_delay(min_s=0.3, max_s=1.5):
    time.sleep(random.uniform(min_s, max_s))

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        viewport={"width": 1920, "height": 1080},
        locale="en-US",
        timezone_id="America/New_York",
        device_scale_factor=1,
    )
    page = context.new_page()
    Stealth().apply_stealth_sync(page)

    print("[1] Navigating to https://unlocktool.net/models/ ...")
    try:
        page.goto(f"{BASE_URL}/models/", timeout=60000, wait_until="domcontentloaded")
        human_delay(2, 4)
        print(f"  Title: {page.title()}")
        print(f"  URL: {page.url}")
        
        # Check if we got past Cloudflare
        content = page.content()
        if "cloudflare" in content.lower() or "security verification" in content.lower() or "challenge" in content.lower():
            print("  ❌ Blocked by Cloudflare")
            # Try to screenshot for debug
            page.screenshot(path="data/cloudflare-blocked.png")
            print("  Screenshot saved to data/cloudflare-blocked.png")
        else:
            print("  ✅ PASSED Cloudflare!")
            text = page.inner_text("body")
            print(f"\n  Body text (first 2000 chars):\n{text[:2000]}")
            page.screenshot(path="data/unlocktool-success.png")
            
            # Get all links
            links = page.eval_on_selector_all("a[href]", "els => els.map(el => ({ text: el.innerText.trim(), href: el.href }))")
            print(f"\n  Total links: {len(links)}")
            brand_links = [l for l in links if l["href"].startswith(BASE_URL) and l["text"]]
            print(f"  Internal links with text: {len(brand_links)}")
            for l in brand_links[:40]:
                print(f"    [{l['text'][:40]:40s}] {l['href']}")
            
            # Save full HTML
            with open("data/unlocktool-models-page.html", "w", encoding="utf-8") as f:
                f.write(content)
            
            # Extract structured data
            print("\n  Looking for model tables/lists...")
            tables = page.query_selector_all("table")
            print(f"  Tables found: {len(tables)}")
            
            lists = page.query_selector_all("ul, ol")
            print(f"  Lists found: {len(lists)}")
            
            # Check for brand sections/headings
            headings = page.query_selector_all("h1, h2, h3, h4, h5")
            print(f"  Headings: {len(headings)}")
            for h in headings[:30]:
                print(f"    <{h.evaluate('el => el.tagName')}> {h.inner_text()[:80]}")
                
    except Exception as e:
        print(f"  Error: {e}")
        page.screenshot(path="data/unlocktool-error.png")

    browser.close()
