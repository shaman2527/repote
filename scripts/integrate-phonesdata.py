"""
Integrate phonesdata.com models into seed-models.ts.
Find missing models and add images.
"""
import json, re, os
from collections import defaultdict

# Load scraped data
with open("data/phonesdata-all.json") as f:
    scraped = json.load(f)
print(f"Scraped phones: {len(scraped)}")

# Load current seed models
with open("src/lib/seed-models.ts") as f:
    seed_content = f.read()

# Extract existing model names
existing_models = defaultdict(set)
for m in re.finditer(r"m\('([^']+)',\s*'([^']+)'", seed_content):
    brand = m.group(1)
    model = m.group(2).lower()
    existing_models[brand].add(model)

# Map phonesdata brands to our brand names
BRAND_MAP = {
    "xiaomi": "Xiaomi", "samsung": "Samsung", "apple": "Apple",
    "huawei": "Huawei", "honor": "Huawei", "tecno": "Tecno",
    "infinix": "Infinix", "motorola": "Motorola", "lg": "LG",
    "nokia": "Nokia", "google": "Google", "oneplus": "OnePlus",
    "oppo": "Oppo", "vivo": "Vivo", "realme": "Realme",
    "alcatel": "Alcatel", "zte": "ZTE", "blu": "BLU",
    "blackview": "Blackview", "tcl": "TCL", "lenovo": "Lenovo",
    "meizu": "Meizu", "sony": "Sony", "asus": "Asus",
}

# Cross-reference
missing = []
brand_stats = defaultdict(lambda: {"total": 0, "missing": 0, "new_names": []})

for p in scraped:
    name = p["name"]
    brand_clean = p.get("brand_clean", "")
    if brand_clean in BRAND_MAP.values():
        brand = brand_clean
    else:
        brand_slug = p.get("brand", "").lower()
        brand = BRAND_MAP.get(brand_slug, "Unknown")

    name_lower = name.lower()
    # Normalize
    name_normalized = re.sub(r'\s+', ' ', name_lower).strip()

    # Check if this model exists in our seed
    exists = False
    for existing in existing_models.get(brand, set()):
        # Match if model name is contained in existing or vice versa
        ex_clean = re.sub(r'galaxy\s*', '', existing)
        nm_clean = re.sub(r'galaxy\s*', '', name_normalized)
        if (name_normalized == existing or
            name_normalized in existing or existing in name_normalized or
            nm_clean == ex_clean or ex_clean in nm_clean or nm_clean in ex_clean):
            exists = True
            break

        # Check by extracting the model number
        ex_nums = re.findall(r'[a-z]\d+', ex_clean)
        nm_nums = re.findall(r'[a-z]\d+', nm_clean)
        if ex_nums and nm_nums and ex_nums == nm_nums:
            exists = True
            break

    brand_stats[brand]["total"] += 1
    if not exists:
        brand_stats[brand]["missing"] += 1
        brand_stats[brand]["new_names"].append(name)

# Print stats
for brand, stats in sorted(brand_stats.items(), key=lambda x: -x[1]["missing"]):
    pct = stats["missing"] / stats["total"] * 100 if stats["total"] > 0 else 0
    print(f"  {brand:12s}: {stats['total']:4d} total, {stats['missing']:4d} missing ({pct:.0f}%)")
    if stats["missing"] > 0 and stats["missing"] < 30:
        for n in stats["new_names"][:10]:
            print(f"    - {n}")
        if len(stats["new_names"]) > 10:
            print(f"    ... and {len(stats['new_names'])-10} more")

# Count total missing across known brands
known_brands = {"Samsung", "Xiaomi", "Apple", "Huawei", "Tecno", "Infinix",
                "Motorola", "LG", "Nokia", "Google", "OnePlus", "Oppo",
                "Vivo", "Realme", "Alcatel", "ZTE", "BLU", "Blackview", "TCL"}
total_known_missing = sum(stats["missing"] for b, stats in brand_stats.items() if b in known_brands)
print(f"\nTotal missing across known brands: {total_known_missing}")
