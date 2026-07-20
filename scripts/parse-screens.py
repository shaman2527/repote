import pdfplumber
import json
import re
import os

os.makedirs('data', exist_ok=True)

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

# Single-letter border noise
BORDER_NOISE = {'D', 'L', 'R', 'O', 'W', 'E', 'C', 'DL', 'LD', 'DR', 'RD',
                'LR', 'RL', 'WD', 'LD', 'LL', 'LE', 'RE', 'RO', 'CO', 'OW',
                'EC', 'DLD', 'LLL', 'LLE', 'REC', 'ERO', 'ROC', 'OCW', 'COW',
                'LDL', 'LLR', 'REO', 'ECO', 'OWW', 'WW', 'ER', 'RE',
                'LE', 'EL', 'DR', 'RD', 'ERC', 'REC'}

def is_noise(line):
    return line in BORDER_NOISE or 'CELL WORLD' in line or 'C.C. CITY' in line or 'LOCAL B' in line or 'FECHA ACTUALIZADA' in line or 'AL COMPRAR' in line or 'PRECIO AL MAYOR' in line

def has_prices(s):
    parts = s.strip().split()
    prices = []
    for p in parts:
        p = p.replace(',', '.')
        try:
            v = float(p)
            if v > 0:
                prices.append(p)
        except:
            pass
    return prices

# Get all lines from PDF
print("Opening PDF...")
with pdfplumber.open(r'C:\Users\ROBER\Downloads\CELL WORLD PANTALLAS 09-07-2026_.pdf') as pdf:
    raw_lines = []
    for page in pdf.pages:
        text = page.extract_text()
        if text:
            raw_lines.extend(text.split('\n'))

print(f"Total raw lines: {len(raw_lines)}")

# Clean noise and merge multi-line entries
entries_text = []
for line in raw_lines:
    line = line.strip()
    if not line or len(line) <= 1 or is_noise(line):
        continue
    entries_text.append(line)

print(f"Lines after noise removal: {len(entries_text)}")

# Merge lines: entries start with "3/4" or a brand name
merged = []
buffer = ''
for line in entries_text:
    # Check if this line starts a new entry
    starts_with = line.startswith('3/4') or line.startswith('3/E4')
    # Or if it's a brand name following a digit
    is_brand = any(b in line for b in BRAND_MAP)
    
    if starts_with:
        if buffer:
            merged.append(buffer)
        buffer = line
    elif buffer and is_brand:
        # Brand name without 3/4 prefix - check if it's a continuation or new entry
        # If previous buffer already has prices, this is a new entry
        prices = has_prices(buffer)
        has_price_info = len(prices) >= 2
        if has_price_info and not buffer.startswith('3/4'):
            merged.append(buffer)
            buffer = line
        else:
            buffer += ' ' + line
    elif buffer:
        buffer += ' ' + line
    else:
        buffer = line

if buffer:
    merged.append(buffer)

print(f"Merged lines: {len(merged)}")

# Parse each entry
screens = []
for entry in merged:
    text = entry
    
    # Clean up 3/4 prefix
    if text.startswith('3/4 '):
        text = text[4:]
    elif text.startswith('3/E4 '):
        text = text[5:]
    
    # Find brand
    brand = None
    for b in sorted(BRAND_MAP.keys(), key=len, reverse=True):
        if b in text:
            idx = text.index(b)
            brand = BRAND_MAP[b]
            text = text[idx + len(b):].strip()
            break
    
    if not brand:
        continue
    
    # Extract prices (last two numbers)
    parts = text.split()
    prices = []
    non_price_parts = []
    for p in reversed(parts):
        p_clean = p.replace(',', '.')
        try:
            v = float(p_clean)
            if v > 0 and v < 10000:
                prices.insert(0, p_clean)
                continue
        except:
            pass
        non_price_parts.insert(0, p)
    
    if len(prices) < 1:
        continue
    
    wholesale = float(prices[-2]) if len(prices) >= 2 else float(prices[0])
    retail = float(prices[-1])
    
    # Remove prices from text
    model_text = ' '.join(non_price_parts).strip()
    
    # Check stock
    stock = 'disponible'
    if 'AGOTADO' in model_text.upper() or 'AGOTADA' in model_text.upper():
        stock = 'agotado'
    model_text = re.sub(r'(?i)\bAGOTADO\b|\bAGOTADA\b', '', model_text).strip()
    
    # Detect screen type  
    screen_type = '3/4'
    for st in sorted(SCREEN_TYPES, key=len, reverse=True):
        if st in model_text.upper():
            screen_type = st
            break
    # Check for OLED variants
    if 'OLED' in model_text.upper() and screen_type == '3/4':
        screen_type = 'OLED'
    if 'AMOLED' in model_text.upper() and screen_type == '3/4':
        screen_type = 'AMOLED'
    if 'INCELL' in model_text.upper() and screen_type == '3/4':
        screen_type = 'INCELL CON MARCO'
    # Check frame
    if 'CON MARCO' in model_text.upper():
        if 'ORIGINAL' in screen_type.upper():
            screen_type = 'ORIGINAL CON MARCO'
        elif screen_type == '3/4':
            screen_type = '3/4 CON MARCO'
    elif 'SIN MARCO' in model_text.upper():
        if 'ORIGINAL' in screen_type.upper():
            screen_type = 'ORIGINAL SIN MARCO'
    
    # Clean model name from screen type noise
    model_name = model_text
    for st in SCREEN_TYPES:
        model_name = re.sub(re.escape(st), '', model_name, flags=re.IGNORECASE)
    model_name = re.sub(r'(?i)\bCON MARCO\b|\bSIN MARCO\b|\bOLED\b|\bAMOLED\b|\bINCELL\b|\bLENTE\b|\bLCD\b|\bTFT\b|\bFLEX\b', '', model_name)
    model_name = re.sub(r'\s+', ' ', model_name).strip()
    
    if not model_name:
        continue
    
    screens.append({
        'brand': brand,
        'model': model_name,
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

# Generate IDs
import uuid
for s in unique:
    s['id'] = str(uuid.uuid4())

print(f"Total screens parsed: {len(unique)}")

with open('data/screen_catalog.json', 'w', encoding='utf-8') as f:
    json.dump(unique, f, ensure_ascii=False, indent=2)

print("Saved to data/screen_catalog.json")
print("\n=== SAMPLE (30) ===")
for s in unique[:30]:
    print(f"  {s['brand']:12s} | {s['model']:35s} | {s['screenType']:20s} | W${s['wholesalePrice']:<6.2f} R${s['retailPrice']:<6.2f} | {s['stockStatus']}")

# Count by brand
from collections import Counter
brands = Counter(s['brand'] for s in unique)
print("\n=== BY BRAND ===")
for b, c in brands.most_common():
    print(f"  {b}: {c}")
