"""
Professional CELL WORLD PDF screen parser v2.
Handles multi-line entries, border noise, and mixed formatting.
"""
import pdfplumber
import json
import re
import uuid
import os
from collections import Counter

os.makedirs("data", exist_ok=True)

BRAND_MAP = {
    'ALCATEL': 'Alcatel', 'BLACKVIEW': 'Blackview', 'BLU': 'BLU',
    'GOOGLE PIXEL': 'Google', 'HUAWEI': 'Huawei', 'HONOR': 'Huawei',
    'INFINIX': 'Infinix', 'KRIP': 'Krip', 'SAMSUNG': 'Samsung',
    'TECNO': 'Tecno', 'XIAOMI': 'Xiaomi', 'ZTE': 'ZTE',
    'VIVO': 'Vivo', 'TCL': 'TCL', 'UMIDIGI': 'Umidigi',
    'MOTOROLA': 'Motorola', 'LG': 'LG', 'NOKIA': 'Nokia',
    'POCO': 'POCO', 'APPLE': 'Apple',
}

SCREEN_TYPES = ['INCELL', 'OLED', 'AMOLED', 'ORIGINAL CON MARCO', 'ORIGINAL SIN MARCO',
                'ORIGINAL', 'LENTE', 'LCD', 'TFT', 'FLEX']

# Letters that are PDF border noise
BORDER_SINGLE = set('DLROWCELD')

def is_noise_line(line):
    s = line.strip()
    if not s:
        return True
    # Page markers
    if s.startswith('===') and 'PAGE' in s:
        return True
    # Known noise patterns
    noise_patterns = [
        'CELL WORLD', 'C.C. CITY', 'LOCAL B', 'FECHA ACTUALIZADA',
        'AL COMPRAR', 'PRECIO AL MAYOR', 'DESCRIPCION MAYORDETAL',
        'MERCADO', 'SABANA GRANDE',
    ]
    if any(p in s.upper() for p in noise_patterns):
        return True
    # Single letters that are border noise
    if all(c in BORDER_SINGLE or c == ' ' for c in s) and len(s) < 10:
        return True
    return False

def is_price_line(line):
    """Line is just prices (no brand, no model)."""
    prices = re.findall(r'\d+[.,]?\d*', line)
    if len(prices) >= 2:
        non_price = re.sub(r'[\d\s,.;]+', '', line).strip()
        return len(non_price) <= 2
    return False

def parse_prices(text):
    parts = text.split()
    prices = []
    non_prices = []
    for p in parts:
        p_clean = p.replace(',', '.')
        try:
            v = float(p_clean)
            if 0.5 <= v <= 9999:
                prices.append(v)
                continue
        except:
            pass
        non_prices.append(p)
    return prices, ' '.join(non_prices)

def clean_model_name(text):
    """Remove screen type keywords, stock status, clean whitespace."""
    text = re.sub(r'\bAGOTADO\b|\bAGOTADA\b', '', text, flags=re.IGNORECASE)
    for st in SCREEN_TYPES:
        text = re.sub(re.escape(st), '', text, flags=re.IGNORECASE)
    text = re.sub(r'\bCON MARCO\b|\bSIN MARCO\b|\bOLED\b|\bAMOLED\b|\bINCELL\b|\bLENTE\b|\bLCD\b|\bTFT\b|\bFLEX\b', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

print("=" * 60)
print("CELL WORLD PANTALLAS - Professional Parser v2")
print("=" * 60)

pdf_path = r'C:\Users\ROBER\Downloads\CELL WORLD PANTALLAS 09-07-2026_.pdf'
with pdfplumber.open(pdf_path) as pdf:
    raw_lines = []
    for page in pdf.pages:
        text = page.extract_text()
        if text:
            raw_lines.extend(text.split('\n'))

print(f"Raw lines: {len(raw_lines)}")

# Merge lines intelligently
entries_raw = []
buffer = []
for line in raw_lines:
    stripped = line.strip()
    # Skip pure noise
    if is_noise_line(stripped):
        continue
    
    # Check if this line starts a new entry (starts with 3/4 or 3/E4)
    is_new_entry = bool(re.match(r'^3/E?4\s', stripped, re.IGNORECASE))
    
    # Price-only lines are continuations
    is_price = is_price_line(stripped) and not is_new_entry
    
    if is_new_entry:
        if buffer:
            entries_raw.append(' '.join(buffer))
        buffer = [stripped]
    elif is_price and buffer:
        buffer.append(stripped)
    elif buffer and not is_price:
        # Could be continuation or new entry without prefix
        # Check if it looks like a brand or model continuation
        buffer.append(stripped)
    else:
        if buffer:
            entries_raw.append(' '.join(buffer))
        buffer = [stripped]

if buffer:
    entries_raw.append(' '.join(buffer))

print(f"Merged entries: {len(entries_raw)}")

# Parse each entry
screens = []
for entry in entries_raw:
    text = entry
    
    # Normalize prefix
    text = re.sub(r'^3/E?4\s*', '', text).strip()
    if not text:
        continue
    
    # Find brand
    brand = None
    for b in sorted(BRAND_MAP.keys(), key=len, reverse=True):
        if re.search(r'\b' + re.escape(b) + r'\b', text.upper()):
            idx = text.upper().index(b)
            brand = BRAND_MAP[b]
            text = text[idx + len(b):].strip()
            break
    
    if not brand:
        continue
    
    # Detect screen type
    screen_type = '3/4'
    text_upper = text.upper()
    for st in sorted(SCREEN_TYPES, key=len, reverse=True):
        if st in text_upper:
            screen_type = st
            break
    
    # Extract prices
    prices, model_text = parse_prices(text)
    
    if len(prices) < 2:
        continue
    
    wholesale = prices[-2]
    retail = prices[-1]
    
    # Clean model text
    model_text = clean_model_name(model_text)
    # Remove isolated year numbers
    model_text = re.sub(r'\b(19|20)\d{2}\b', '', model_text).strip()
    model_text = re.sub(r'\s+', ' ', model_text).strip()
    
    if not model_text or len(model_text) < 2:
        continue
    
    stock = 'agotado' if 'AGOTADO' in text_upper else 'disponible'
    
    screens.append({
        'brand': brand,
        'model': model_text,
        'screenType': screen_type,
        'wholesalePrice': wholesale,
        'retailPrice': retail,
        'stockStatus': stock,
    })

# Deduplicate
seen = set()
unique = []
for s in screens:
    key = (s['brand'], s['model'].lower(), s['screenType'], s['retailPrice'])
    if key not in seen:
        seen.add(key)
        unique.append(s)

for s in unique:
    s['id'] = str(uuid.uuid4())

print(f"\nTotal screens parsed: {len(unique)}")

# Save
for path in ['data/screen_catalog.json', 'src/data/screen_catalog.json']:
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(unique, f, ensure_ascii=False, indent=2)

print("\n=== BY BRAND ===")
brand_counts = Counter(s['brand'] for s in unique)
for b, c in sorted(brand_counts.items(), key=lambda x: -x[1]):
    print(f"  {b}: {c}")

print("\n=== SAMPLE (30) ===")
for s in unique[:30]:
    print(f"  {s['brand']:12s} | {s['model']:35s} | {s['screenType']:20s} | M${s['wholesalePrice']:<6.2f} D${s['retailPrice']:<6.2f} | {s['stockStatus']}")

# Check quality
bad_entries = [s for s in unique if len(s['model']) > 50]
print(f"\nEntries with long names (>50 chars): {len(bad_entries)}")
for s in bad_entries[:5]:
    print(f"  {s['brand']:12s} | {s['model']}")
