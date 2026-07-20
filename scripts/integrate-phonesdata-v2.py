"""
Generate seed entries from phonesdata.com scraped data.
Focus on new brands (Oppo, Realme, OnePlus, Vivo) and missing models.
"""
import json, re, os

os.makedirs("data", exist_ok=True)

with open("data/phonesdata-all.json") as f:
    scraped = json.load(f)

# Group by brand
from collections import defaultdict
by_brand = defaultdict(list)
for p in scraped:
    bc = p.get("brand_clean", "")
    if bc:
        by_brand[bc].append(p)

# FRP methods by brand
FRP = {
    "Samsung": ("Snapdragon/Exynos", "Testpoint"), "Xiaomi": ("Snapdragon/MediaTek", "BROM"),
    "Apple": ("Apple", "Bypass"), "Huawei": ("Kirin/Snapdragon", "BROM"),
    "Tecno": ("Unisoc/MediaTek", "SPD"), "Infinix": ("Unisoc/MediaTek", "SPD"),
    "Motorola": ("Snapdragon", "Testpoint"), "LG": ("MediaTek/Snapdragon", "BROM"),
    "Nokia": ("Snapdragon", "Testpoint"), "Google": ("Tensor", "Bypass"),
    "OnePlus": ("Snapdragon", "Testpoint"), "Oppo": ("Snapdragon/MediaTek", "BROM"),
    "Vivo": ("MediaTek", "BROM"), "Realme": ("MediaTek/Snapdragon", "BROM"),
    "Alcatel": ("Unisoc", "SPD"), "ZTE": ("Unisoc", "SPD"),
    "BLU": ("MediaTek", "BROM"), "Blackview": ("MediaTek", "BROM"),
    "TCL": ("MediaTek", "BROM"), "Honor": ("Kirin", "BROM"),
}

# Load existing seed
with open("src/lib/seed-models.ts") as f:
    seed = f.read()
existing = set()
for m in re.finditer(r"m\('([^']+)',\s*'([^']+)'", seed):
    existing.add((m.group(1), re.sub(r'\s+', ' ', m.group(2)).strip().lower()))

# Generate entries for missing models (limit per brand)
new_entries = []
brand_counts = defaultdict(int)

# New brands to add (Oppo, Realme, OnePlus, Vivo - common in Latin America)
target_brands = ["Oppo", "Realme", "OnePlus", "Vivo", "Samsung", "Xiaomi", "Tecno", "Infinix", "Motorola", "Huawei", "Honor", "LG", "Nokia"]

MAX_PER_BRAND = 30  # Limit new entries per brand

for brand in target_brands:
    phones = by_brand.get(brand, [])
    added = 0
    for p in phones:
        name = re.sub(r'\s+', ' ', p["name"]).strip()
        if not name:
            continue
        key = name.lower()
        # Check if exists
        exists = False
        for ex_brand, ex_model in existing:
            if ex_brand.lower() == brand.lower():
                ex_clean = re.sub(r'galaxy\s*|moto\s*|\bmoto\b', '', ex_model).strip()
                nm_clean = re.sub(r'galaxy\s*|moto\s*|\bmoto\b', '', key).strip()
                if key == ex_model or nm_clean == ex_clean:
                    exists = True
                    break
                # Check model numbers
                ex_nums = re.findall(r'[a-z]\d+', ex_clean)
                nm_nums = re.findall(r'[a-z]\d+', nm_clean)
                if ex_nums and nm_nums and ex_nums == nm_nums:
                    exists = True
                    break
                # Brand prefix check
                if brand.lower() == "samsung":
                    if "galaxy" in key and "galaxy" in ex_model:
                        key_no_galaxy = key.replace("galaxy", "").strip()
                        ex_no_galaxy = ex_model.replace("galaxy", "").strip()
                        if key_no_galaxy == ex_no_galaxy:
                            exists = True
                            break

        if not exists and brand_counts[brand] < MAX_PER_BRAND:
            chipset, frp = FRP.get(brand, ("Unknown", ""))
            escaped_name = name.replace("'", "\\'")
            img_url = p.get("img", "").replace("\\", "\\\\").replace("'", "\\'")
            new_entries.append({
                "brand": brand,
                "model": escaped_name,
                "chipset": chipset,
                "frp": frp,
                "img": img_url if "no-image" not in img_url else "",
            })
            brand_counts[brand] += 1
            added += 1

    print(f"  {brand}: +{added} models (total for brand: {brand_counts[brand]})")

print(f"\nTotal new entries: {len(new_entries)}")

# Generate TypeScript
ts_lines = []
current_brand = ""
for e in new_entries:
    if e["brand"] != current_brand:
        current_brand = e["brand"]
        ts_lines.append(f"\n    // === {current_brand} - phonesdata.com === ")
    img = f"'{e['img']}'" if e['img'] else "undefined"
    ts_lines.append(f"    {{ brand: '{e['brand']}', model: '{e['model']}', chipset: '{e['chipset']}', frpMethod: '{e['frp']}', img: {img} as string | undefined }},")

# Save
with open("data/new-entries-phonesdata.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(ts_lines))

print(f"\nSaved to data/new-entries-phonesdata.txt")
print(f"\nSample:")
for l in ts_lines[:10]:
    print(l)
