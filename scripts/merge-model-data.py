"""
Merge all model data sources:
1. PhoneSpecsAPI (already in seed-models.ts)
2. CELL WORLD screens (screen_catalog.json)
3. Add missing models based on common Venezuela repair knowledge

Also adds FRP methods to ALL models based on their chipset/brand.
"""

import json
import re
import os

os.makedirs("data", exist_ok=True)

# Load current seed models
seed_path = "src/lib/seed-models.ts"
with open(seed_path, "r", encoding="utf-8") as f:
    seed_content = f.read()

# Extract existing models from seed
existing_models = set()
for match in re.finditer(r"m\('([^']+)', '([^']+)'", seed_content):
    brand = match.group(1)
    model = match.group(2)
    existing_models.add((brand, model.lower()))

print(f"Existing models in seed: {len(existing_models)}")

# Load screen catalog
try:
    with open("data/screen_catalog.json", "r", encoding="utf-8") as f:
        screens = json.load(f)
    print(f"Screens in catalog: {len(screens)}")
except:
    with open("src/data/screen_catalog.json", "r", encoding="utf-8") as f:
        screens = json.load(f)
    print(f"Screens in catalog: {len(screens)}")

# Find models in screens but not in seed
BRAND_MAP = {
    'Samsung': 'Samsung', 'Apple': 'Apple', 'Xiaomi': 'Xiaomi', 'Huawei': 'Huawei',
    'Google': 'Google', 'Nokia': 'Nokia', 'Tecno': 'Tecno', 'Infinix': 'Infinix',
    'Motorola': 'Motorola', 'LG': 'LG', 'Alcatel': 'Alcatel', 'ZTE': 'ZTE',
    'BLU': 'BLU', 'Vivo': 'Vivo', 'TCL': 'TCL', 'Blackview': 'Blackview',
    'Umidigi': 'Umidigi', 'POCO': 'POCO', 'Krip': 'Krip',
}

screen_models = set()
for s in screens:
    brand = s.get('brand', '')
    model = s.get('model', '')
    if brand and model:
        # Clean model name (remove noise from PDF)
        model_clean = re.sub(r'\s+', ' ', model).strip()
        if len(model_clean) > 2:
            mapped_brand = BRAND_MAP.get(brand, brand)
            screen_models.add((mapped_brand, model_clean.lower()))

print(f"Models in screen catalog: {len(screen_models)}")

# Find missing models from screens
missing = screen_models - existing_models
print(f"\nMissing models from screen catalog: {len(missing)}")

# Group by brand
from collections import defaultdict
missing_by_brand = defaultdict(list)
for brand, model in sorted(missing):
    missing_by_brand[brand].append(model)

for brand, models in sorted(missing_by_brand.items()):
    print(f"\n  {brand} ({len(models)} missing):")
    for m in models[:20]:
        print(f"    {m}")
    if len(models) > 20:
        print(f"    ... and {len(models) - 20} more")

# Generate new seed entries for missing models
# with appropriate FRP methods based on brand
FRP_BY_BRAND = {
    'Samsung': ('Exynos/Snapdragon', 'Testpoint'),
    'Xiaomi': ('MediaTek/Snapdragon', 'BROM'),
    'Huawei': ('Kirin', 'BROM'),
    'Google': ('Tensor', 'Bypass'),
    'Nokia': ('Snapdragon', 'Testpoint'),
    'Tecno': ('Unisoc/MediaTek', 'SPD'),
    'Infinix': ('Unisoc/MediaTek', 'SPD'),
    'Motorola': ('Snapdragon', 'Testpoint'),
    'LG': ('MediaTek', 'BROM'),
    'Alcatel': ('Unisoc', 'SPD'),
    'ZTE': ('Unisoc', 'SPD'),
    'BLU': ('MediaTek', 'BROM'),
    'Vivo': ('MediaTek', 'BROM'),
    'TCL': ('MediaTek', 'BROM'),
    'Blackview': ('MediaTek', 'BROM'),
    'Umidigi': ('MediaTek', 'BROM'),
    'POCO': ('MediaTek', 'BROM'),
    'Krip': ('MediaTek', 'BROM'),
    'Apple': ('Apple', 'Bypass'),
}

new_entries = []
seen = set()
for brand, model in sorted(missing):
    key = (brand, model)
    if key not in seen:
        seen.add(key)
        chipset, frp = FRP_BY_BRAND.get(brand, ('Unknown', ''))
        new_entries.append((brand, model.title(), chipset, frp))

print(f"\n{'=' * 60}")
print(f"New entries to add: {len(new_entries)}")
print(f"{'=' * 60}")

# Generate the entries text
output_lines = []
for brand, model, chipset, frp in new_entries:
    output_lines.append(f"    m('{brand}', '{model}', '{chipset}', '{frp}'),")

print("\nCopy these lines into seed-models.ts:")
print("\n".join(output_lines[:50]))
if len(output_lines) > 50:
    print(f"... ({len(output_lines) - 50} more)")

# Save to file
with open("data/missing-models.txt", "w", encoding="utf-8") as f:
    f.write("\n".join([f"{b}\t{m}\t{c}\t{f}" for b, m, c, f in new_entries]))
print(f"\nSaved to data/missing-models.txt")
