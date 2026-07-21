"""
Professional merge script: Compare phonesdata.com (2,592 models) vs seed-models.ts
and generate TypeScript code for ALL missing models with proper chipset/FRP.

Outputs:
  data/missing-models-ts.txt  - TypeScript code ready to insert
  data/merge-report.txt       - Summary report
"""
import json, re, os
from collections import defaultdict
from datetime import datetime

os.makedirs("data", exist_ok=True)

# ============================================================
# 1. LOAD SOURCES
# ============================================================

# Load phonesdata
with open("data/phonesdata-all.json", encoding="utf-8") as f:
    phonesdata = json.load(f)

# Load existing seed
with open("src/lib/seed-models.ts", encoding="utf-8") as f:
    seed_content = f.read()

# ============================================================
# 2. EXTRACT EXISTING MODELS FROM SEED
# ============================================================
existing_models = set()
existing_by_brand = defaultdict(set)
existing_details = {}  # (brand, normalized_name) -> (chipset, frp)

for m in re.finditer(r"m\('([^']+)',\s*'([^']+)'(?:,\s*'([^']*)')?(?:,\s*'([^']*)')?", seed_content):
    brand = m.group(1)
    model = re.sub(r'\s+', ' ', m.group(2)).strip()
    chipset = m.group(3) or ""
    frp = m.group(4) or ""
    
    # Normalize for comparison
    norm = model.lower().strip()
    existing_models.add((brand.lower(), norm))
    existing_by_brand[brand.lower()].add(norm)
    existing_details[(brand.lower(), norm)] = (chipset, frp)

print(f"Existing seed models: {len(existing_models)}")
for b in sorted(existing_by_brand.keys()):
    print(f"  {b.title()}: {len(existing_by_brand[b])}")

# ============================================================
# 3. FRP METHOD RULES BY BRAND
# ============================================================
# Chipset patterns to detect
UNISOC_KEYWORDS = ['unisoc', 'sc9863', 'sc9832', 't603', 't606', 't610', 't612', 't616', 't700', 't760', 't820', 'spreadtrum']
MEDIATEK_KEYWORDS = ['mediatek', 'helio', 'dimensity', 'mt673', 'mt675', 'mt676', 'mt678', 'mt688', 'mt689', 'helio g', 'helio p']
SNAPDRAGON_KEYWORDS = ['snapdragon', 'qualcomm']
EXYNOS_KEYWORDS = ['exynos']
KIRIN_KEYWORDS = ['kirin']
APPLE_KEYWORDS = ['apple', 'a9', 'a10', 'a11', 'a12', 'a13', 'a14', 'a15', 'a16', 'a17', 'a18', 'a19']
TENSOR_KEYWORDS = ['tensor']

BRAND_RULES = {
    'samsung': {
        'default_chipset': 'Exynos/Snapdragon',
        'default_frp': 'Testpoint',
        'model_overrides': {
            # SPD method (Unisoc based)
            'a01': ('Snapdragon 439', 'SPD'),
            'a01 core': ('Exynos 7884B', 'SPD'),
            'a02': ('MediaTek MT6739', 'SPD'),
            'a02s': ('Snapdragon 450', 'SPD'),
            'a03': ('Unisoc SC9863A', 'SPD'),
            'a03 core': ('Unisoc SC9863A', 'SPD'),
            'a03s': ('MediaTek Helio P35', 'SPD'),
            'a04': ('MediaTek Helio G37', 'SPD'),
            'a04 core': ('Unisoc SC9863A', 'SPD'),
            'a04s': ('Snapdragon 680', 'Testpoint'),
            'a04e': ('Unisoc SC9863A', 'SPD'),
            'a05': ('MediaTek Helio G85', 'BROM'),
            'a05s': ('Snapdragon 680', 'Testpoint'),
            'a06': ('MediaTek Helio G85', 'BROM'),
            'a12': ('MediaTek Helio P35', 'SPD'),
            'a12 nacho': ('Exynos 850', 'SPD'),
            'm12': ('Exynos 850', 'SPD'),
            'f12': ('Exynos 850', 'SPD'),
            'a21': ('MediaTek Helio P35', 'SPD'),
            'a21s': ('Exynos 850', 'SPD'),
            'm02': ('Exynos 850', 'SPD'),
            'f02s': ('Snapdragon 450', 'Testpoint'),
            'f04': ('MediaTek Helio P35', 'SPD'),
            'f05': ('MediaTek Helio G85', 'BROM'),
            'f06': ('MediaTek Helio G85', 'BROM'),
            'f13': ('Exynos 850', 'SPD'),
            'f14': ('Exynos 1330', 'Bypass'),
            'f15': ('MediaTek Dimensity 6100+', 'BROM'),
            'f22': ('MediaTek Helio G80', 'BROM'),
            # Bypass (Snapdragon 8 Gen 2+)
            's23 fe': ('Snapdragon 8 Gen 1', 'Bypass'),
            'a54': ('Exynos 1380', 'Bypass'),
            'a55': ('Exynos 1480', 'Bypass'),
            'a35': ('Exynos 1380', 'Bypass'),
            'a34': ('MediaTek Dimensity 1080', 'Bypass'),
            'a25': ('Exynos 1280', 'Bypass'),
            'a24': ('MediaTek Helio G99', 'Bypass'),
            'a15': ('MediaTek Helio G99', 'Bypass'),
            'a14': ('MediaTek Helio G80', 'Bypass'),
            'a13': ('Exynos 850', 'Bypass'),
            'm14': ('Exynos 1330', 'Bypass'),
            'm15': ('MediaTek Dimensity 6100+', 'BROM'),
            'm35': ('Exynos 1380', 'Bypass'),
            'm54': ('Exynos 1380', 'Bypass'),
            'm55': ('Snapdragon 7 Gen 1', 'Bypass'),
            'f54': ('Exynos 1380', 'Bypass'),
            'f55': ('Snapdragon 7 Gen 1', 'Bypass'),
        },
        # A-series with model numbers
        'prefix_rules': [
            (r'^galaxy\s+a0[56]', 'BROM', 'MediaTek Helio G85'),
            (r'^galaxy\s+a0[34]', 'SPD', 'Unisoc/MediaTek'),
            (r'^galaxy\s+a0[12]', 'SPD', 'Exynos/Snapdragon'),
            (r'^galaxy\s+a1[4-6]', 'BROM', 'MediaTek Helio G99'),
            (r'^galaxy\s+a2[45]', 'Bypass', 'Exynos 1280'),
            (r'^galaxy\s+a3[45]', 'Bypass', 'Exynos 1380'),
            (r'^galaxy\s+a5[45]', 'Bypass', 'Exynos 1380/1480'),
            (r'^galaxy\s+m0[56]', 'BROM', 'MediaTek Helio G85'),
            (r'^galaxy\s+f0[56]', 'BROM', 'MediaTek Helio G85'),
        ],
    },
    'xiaomi': {
        'default_chipset': 'Snapdragon/MediaTek',
        'default_frp': 'BROM',
        'model_overrides': {
            'a1': ('Snapdragon 625', 'Testpoint'),
            'a2': ('Snapdragon 625', 'Testpoint'),
            'a3': ('Snapdragon 665', 'Testpoint'),
            'a5': ('Snapdragon 430', 'Testpoint'),
            # Redmi A series (entry level, Unisoc)
            'a1 plus': ('MediaTek Helio A22', 'BROM'),
            'a2 plus': ('MediaTek Helio G36', 'BROM'),
        },
        'prefix_rules': [
            (r'^redmi\s+a\d', 'SPD', 'Unisoc'),
            (r'^redmi\s+[1-6][ac]', 'BROM', 'MediaTek'),
            (r'^redmi\s+note\s+', 'BROM', 'Snapdragon/MediaTek'),
            (r'^redmi\s+\d+', 'BROM', 'MediaTek Helio'),
            (r'^mi\s+\d+', 'BROM', 'Snapdragon'),
            (r'^poco\s+', 'BROM', 'Snapdragon/MediaTek'),
        ],
    },
    'apple': {
        'default_chipset': 'Apple Silicon',
        'default_frp': 'Bypass',
    },
    'huawei': {
        'default_chipset': 'Kirin/Snapdragon',
        'default_frp': 'BROM',
    },
    'tecno': {
        'default_chipset': 'Unisoc/MediaTek',
        'default_frp': 'SPD',
    },
    'infinix': {
        'default_chipset': 'Unisoc/MediaTek',
        'default_frp': 'SPD',
    },
    'motorola': {
        'default_chipset': 'Snapdragon',
        'default_frp': 'Testpoint',
        'prefix_rules': [
            (r'^moto\s+e\d', 'SPD', 'Unisoc/MediaTek' if 'e1' else 'Snapdragon'),
            (r'^moto\s+g\d+', 'BROM', 'MediaTek'),
            (r'^moto\s+g2', 'SPD', 'Unisoc T700'),
        ],
    },
    'lg': {
        'default_chipset': 'MediaTek/Snapdragon',
        'default_frp': 'BROM',
    },
    'google': {
        'default_chipset': 'Tensor',
        'default_frp': 'Bypass',
    },
    'nokia': {
        'default_chipset': 'Snapdragon',
        'default_frp': 'Testpoint',
    },
    'oneplus': {
        'default_chipset': 'Snapdragon',
        'default_frp': 'Testpoint',
    },
    'oppo': {
        'default_chipset': 'Snapdragon/MediaTek',
        'default_frp': 'BROM',
    },
    'vivo': {
        'default_chipset': 'MediaTek',
        'default_frp': 'BROM',
    },
    'realme': {
        'default_chipset': 'MediaTek/Snapdragon',
        'default_frp': 'BROM',
    },
    'alcatel': {
        'default_chipset': 'Unisoc',
        'default_frp': 'SPD',
    },
    'zte': {
        'default_chipset': 'Unisoc',
        'default_frp': 'SPD',
    },
    'blu': {
        'default_chipset': 'MediaTek',
        'default_frp': 'BROM',
    },
    'blackview': {
        'default_chipset': 'MediaTek',
        'default_frp': 'BROM',
    },
    'tcl': {
        'default_chipset': 'MediaTek',
        'default_frp': 'BROM',
    },
    'umidigi': {
        'default_chipset': 'MediaTek',
        'default_frp': 'BROM',
    },
}

# Brands we care about (in order)
TARGET_BRANDS = [
    'Samsung', 'Apple', 'Xiaomi', 'Huawei', 'Tecno', 'Infinix',
    'Motorola', 'LG', 'Google', 'Nokia', 'OnePlus', 'Oppo', 'Vivo',
    'Realme', 'Alcatel', 'ZTE', 'BLU', 'Blackview', 'TCL', 'Umidigi',
    'POCO', 'Krip'
]

# Brand mapping from phonesdata -> seed brand
BRAND_MAP = {
    'xiaomi': 'Xiaomi',
    'samsung': 'Samsung',
    'apple': 'Apple',
    'huawei': 'Huawei',
    'tecno': 'Tecno',
    'infinix': 'Infinix',
    'motorola': 'Motorola',
    'lg': 'LG',
    'google': 'Google',
    'nokia': 'Nokia',
    'oneplus': 'OnePlus',
    'oppo': 'Oppo',
    'vivo': 'Vivo',
    'realme': 'Realme',
    'alcatel': 'Alcatel',
    'zte': 'ZTE',
    'blu': 'BLU',
    'blackview': 'Blackview',
    'tcl': 'TCL',
    'umidigi': 'Umidigi',
    'poco': 'POCO',
}

# Non-phone keywords to filter out
NON_PHONE_KEYWORDS = [
    'watch', 'smartwatch', 'band', 'fitness', 'tab ', 'tablet',
    'ipad', 'tab s', 'tab a', 'tab active',
]

# Cross-brand contamination patterns to detect
def is_valid_model(brand: str, name: str) -> bool:
    """Check if this model is valid for the brand (no cross-brand contamination)."""
    name_lower = name.lower()
    brand_lower = brand.lower()
    
    # Non-phone devices
    for kw in NON_PHONE_KEYWORDS:
        if kw in name_lower:
            return False
    
    # Check for other brand names in this model
    other_brands = ['samsung', 'xiaomi', 'apple', 'huawei', 'honor', 'tecno', 'infinix',
                    'motorola', 'lg ', 'nokia', 'oneplus', 'oppo', 'vivo', 'realme',
                    'alcatel', 'zte', 'blu', 'blackview', 'tcl', 'poco', 'redmi']
    for ob in other_brands:
        ob_clean = ob.replace(' ', '').strip()
        brand_clean = brand_lower.replace(' ', '').strip()
        if ob_clean != brand_clean and ob_clean in name_lower.replace(' ', '').strip():
            return False
    
    # Special: Moto in non-Motorola models
    if 'moto' in name_lower and brand_lower != 'motorola':
        return False
    
    return True
    
    return True

# ============================================================
# 4. HELPER FUNCTIONS
# ============================================================

def normalize_model_name(name: str) -> str:
    """Clean up a model name for comparison."""
    name = re.sub(r'\s+', ' ', name).strip()
    name = re.sub(r'[^\w\s\-\.\/\+\(\)]', '', name)
    return name.strip()

def get_chipset_frp(brand: str, model: str):
    """Determine chipset and FRP method for a model."""
    brand_lower = brand.lower()
    model_lower = model.lower()
    
    rules = BRAND_RULES.get(brand_lower, {})
    
    # Check model_overrides
    best_match_key = None
    best_match_len = 0
    for key in rules.get('model_overrides', {}):
        if key in model_lower or model_lower in key:
            if len(key) > best_match_len:
                best_match_key = key
                best_match_len = len(key)
    
    if best_match_key:
        return rules['model_overrides'][best_match_key]
    
    # Check prefix_rules
    for pattern, frp, chipset in rules.get('prefix_rules', []):
        if re.search(pattern, model_lower):
            return (chipset, frp)
    
    return (rules.get('default_chipset', 'Unknown'), rules.get('default_frp', ''))

def brand_sort_key(brand: str):
    """Sort key for brands."""
    if brand in TARGET_BRANDS:
        return TARGET_BRANDS.index(brand)
    return 999

# ============================================================
# 5. PROCESS PHONEDATA
# ============================================================

# Group phonesdata by brand
phones_by_brand = defaultdict(list)
for p in phonesdata:
    brand = p.get("brand_clean", "").strip()
    if not brand:
        continue
    mapped_brand = BRAND_MAP.get(brand.lower())
    if mapped_brand:
        phones_by_brand[mapped_brand].append(p)

print(f"\nPhonesdata grouped by brand:")
total_phones = 0
for b in sorted(phones_by_brand.keys(), key=brand_sort_key):
    count = len(phones_by_brand[b])
    total_phones += count
    print(f"  {b}: {count}")
print(f"  TOTAL: {total_phones}")

# ============================================================
# 6. FIND MISSING MODELS
# ============================================================

missing_by_brand = defaultdict(list)
already_accounted = set()

for brand in TARGET_BRANDS:
    phones = phones_by_brand.get(brand, [])
    for p in phones:
        name = normalize_model_name(p["name"])
        if not name or len(name) < 2:
            continue
        
        norm = name.lower()
        
        # Filter out non-phone devices and cross-brand contamination
        if not is_valid_model(brand, name):
            continue
        
        # Check if this model already exists in seed
        brand_lower = brand.lower()
        
        # Multiple comparison strategies
        exists = False
        
        # Exact match
        if (brand_lower, norm) in existing_models:
            exists = True
        
        # Check if name contains existing model or vice versa
        if not exists:
            for existing_norm in existing_by_brand.get(brand_lower, set()):
                # One contains the other
                if norm == existing_norm or existing_norm == norm:
                    exists = True
                    break
                # Check if name or existing name is a substring (for cases like "A04" vs "Galaxy A04")
                # Only for meaningful lengths
                if len(norm) >= 4 and len(existing_norm) >= 4:
                    if norm in existing_norm or existing_norm in norm:
                        exists = True
                        break
        
        # Check against models that will be added (to avoid duplicates in output)
        if not exists:
            for entry in missing_by_brand.get(brand, []):
                added_norm = entry[1]
                if norm == added_norm or (len(norm) >= 5 and len(added_norm) >= 5 and 
                    (norm in added_norm or added_norm in norm)):
                    exists = True
                    break
        
        if not exists and (brand_lower, norm) not in already_accounted:
            chipset, frp = get_chipset_frp(brand, name)
            already_accounted.add((brand_lower, norm))
            missing_by_brand[brand].append((p, norm, chipset, frp))

print(f"\n\nMissing models found by brand:")
total_missing = 0
for b in sorted(missing_by_brand.keys(), key=brand_sort_key):
    count = len(missing_by_brand[b])
    total_missing += count
    print(f"  {b}: {count} missing")
print(f"  TOTAL: {total_missing}")

# ============================================================
# 7. GENERATE TYPESCRIPT CODE
# ============================================================

ts_lines = []
ts_lines.append("    // === AUTOGENERATED from phonesdata.com comparison ===")
ts_lines.append(f"    // Total: {total_missing} new models")
ts_lines.append(f"    // Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")

for brand in sorted(missing_by_brand.keys(), key=brand_sort_key):
    entries = missing_by_brand[brand]
    # Sort by model name
    entries.sort(key=lambda x: x[1])
    
    ts_lines.append(f"\n    // === {brand.upper()} - phonesdata.com ({len(entries)} nuevos) ===")
    
    for p, norm, chipset, frp in entries:
        model_name = normalize_model_name(p["name"])
        # Escape single quotes
        model_name_escaped = model_name.replace("'", "\\'")
        chipset_escaped = chipset.replace("'", "\\'")
        
        # Generate TS entry
        if chipset and frp:
            ts_line = f"    m('{brand}', '{model_name_escaped}', '{chipset_escaped}', '{frp}'),"
        elif chipset:
            ts_line = f"    m('{brand}', '{model_name_escaped}', '{chipset_escaped}'),"
        else:
            ts_line = f"    m('{brand}', '{model_name_escaped}'),"
        
        ts_lines.append(ts_line)

# Save TypeScript code
ts_code = "\n".join(ts_lines)
with open("data/missing-models-ts.txt", "w", encoding="utf-8") as f:
    f.write(ts_code)

# ============================================================
# 8. GENERATE REPORT
# ============================================================

report = []
report.append("=" * 60)
report.append("MERGE REPORT - phonesdata.com vs seed-models.ts")
report.append("=" * 60)
report.append(f"Total in phonesdata: {total_phones}")
report.append(f"Total in seed: {len(existing_models)}")
report.append(f"Total missing found: {total_missing}")
report.append("")

for brand in sorted(missing_by_brand.keys(), key=brand_sort_key):
    entries = missing_by_brand[brand]
    report.append(f"\n--- {brand}: {len(entries)} nuevos ---")
    for p, norm, chipset, frp in entries:
        report.append(f"  {p['name']:40s} | Chipset: {chipset:25s} | FRP: {frp}")

# Save report
with open("data/merge-report.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(report))

# Print summary
print("\n\n" + "=" * 60)
print("SUMMARY")
print("=" * 60)
print(f"  TypeScript code: data/missing-models-ts.txt ({len(ts_lines)} lines)")
print(f"  Report:          data/merge-report.txt")
print(f"  New models:      {total_missing}")
print(f"\nRun: copy the contents of data/missing-models-ts.txt")
print(f"     into src/lib/seed-models.ts before the closing ']'")
