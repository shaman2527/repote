"""
Full merge: add ALL remaining phonesdata models to seed.
Skips: watches, tablets, cross-brand contamination.
"""
import json, re
from collections import defaultdict

with open("data/phonesdata-all.json") as f:
    phonesdata = json.load(f)

with open("src/lib/seed-models.ts", encoding="utf-8") as f:
    seed_content = f.read()

with open("src/data/phone-images.json") as f:
    phone_images = json.load(f)

# --- Existing models ---
existing_models = set()
for line in seed_content.split("\n"):
    if line.strip().startswith("m("):
        parts = re.findall(r"'([^']*)'", line)
        if len(parts) >= 2:
            norm = re.sub(r'\s+', ' ', parts[1]).strip().lower()
            existing_models.add((parts[0].lower(), norm))

print(f"Existing seed models: {len(existing_models)}")

# --- Brand mapping ---
BRAND_MAP = {
    "xiaomi": "Xiaomi", "samsung": "Samsung", "apple": "Apple",
    "huawei": "Huawei", "tecno": "Tecno", "infinix": "Infinix",
    "motorola": "Motorola", "lg": "LG", "google": "Google",
    "nokia": "Nokia", "oneplus": "OnePlus", "oppo": "Oppo",
    "vivo": "Vivo", "realme": "Realme", "alcatel": "Alcatel",
    "zte": "ZTE", "blu": "BLU", "blackview": "Blackview",
    "tcl": "TCL", "umidigi": "Umidigi",
}

FRP_BY_BRAND = {
    "Samsung": ("Exynos/Snapdragon", "Testpoint"),
    "Xiaomi": ("Snapdragon/MediaTek", "BROM"),
    "Apple": ("Apple Silicon", "Bypass"),
    "Huawei": ("Kirin/Snapdragon", "BROM"),
    "Tecno": ("Unisoc/MediaTek", "SPD"),
    "Infinix": ("Unisoc/MediaTek", "SPD"),
    "Motorola": ("Snapdragon", "Testpoint"),
    "LG": ("MediaTek/Snapdragon", "BROM"),
    "Google": ("Tensor", "Bypass"),
    "Nokia": ("Unisoc/MediaTek", "SPD"),
    "OnePlus": ("Snapdragon", "Testpoint"),
    "Oppo": ("Snapdragon/MediaTek", "BROM"),
    "Vivo": ("MediaTek/Snapdragon", "BROM"),
    "Realme": ("MediaTek/Snapdragon", "BROM"),
    "Alcatel": ("Unisoc", "SPD"),
    "ZTE": ("Unisoc", "SPD"),
    "BLU": ("MediaTek Helio", "BROM"),
    "Blackview": ("MediaTek Helio", "BROM"),
    "TCL": ("MediaTek Helio", "BROM"),
    "Umidigi": ("MediaTek Helio", "BROM"),
}

NON_PHONE = ["watch", "smartwatch", "band", "fitness", "tab ", "tablet", "ipad"]

OTHER_BRANDS = [
    "samsung", "xiaomi", "apple", "huawei", "honor", "tecno", "infinix",
    "motorola", "lg", "nokia", "oneplus", "oppo", "vivo", "realme",
    "alcatel", "zte", "blu", "blackview", "tcl", "poco", "redmi", "mi",
]

def is_valid_phone(brand_lower, name_lower):
    name_clean = name_lower.replace(" ", "")
    for kw in NON_PHONE:
        if kw in name_lower:
            return False
    if re.search(r'(?:^|\s)pad(?:\s|\d|$)', name_lower):
        return False
    for ob in OTHER_BRANDS:
        if ob != brand_lower and ob in name_clean:
            return False
    return True

# --- Find new models ---
new_by_brand = defaultdict(list)
for p in phonesdata:
    brand_raw = p.get("brand_clean", "").strip().lower()
    mapped = BRAND_MAP.get(brand_raw)
    if not mapped:
        continue
    
    name = re.sub(r'\s+', ' ', p["name"]).strip()
    if not name or len(name) < 2:
        continue
    
    norm = name.lower()
    key = (mapped.lower(), norm)
    if key in existing_models:
        continue
    
    if not is_valid_phone(mapped.lower(), norm):
        continue
    
    img_key = f"{mapped.lower()}|{norm}"
    has_img = img_key in phone_images
    chipset, frp = FRP_BY_BRAND.get(mapped, ("Unknown", ""))
    new_by_brand[mapped].append((name, chipset, frp, has_img))

# --- Generate TS code ---
total_new = sum(len(v) for v in new_by_brand.values())
phones_with_img = sum(sum(1 for x in v if x[3]) for v in new_by_brand.values())

ts_lines = []
ts_lines.append("")
ts_lines.append(f"    // === PHONESDATA - remaining ({total_new} nuevos, {phones_with_img} con imagen) ===")

for brand in sorted(new_by_brand.keys()):
    entries = sorted(new_by_brand[brand])
    ts_lines.append(f"\n    // {brand.upper()} ({len(entries)} nuevos)")
    for name, chipset, frp, has_img in entries:
        name_escaped = name.replace("'", "\\'")
        ts_lines.append(f"    m('{brand}', '{name_escaped}', '{chipset}', '{frp}'),")

ts_code = "\n".join(ts_lines)
with open("data/remaining-phonesdata-ts.txt", "w", encoding="utf-8") as f:
    f.write(ts_code)

# --- Summary ---
print(f"\nTotal new models to add: {total_new}")
print(f"With images in phone-images.json: {phones_with_img}")
print(f"\nBy brand:")
for brand in sorted(new_by_brand.keys()):
    entries = new_by_brand[brand]
    with_img = sum(1 for x in entries if x[3])
    print(f"  {brand}: {len(entries)} ({with_img} img)")
print(f"\nTS code saved to data/remaining-phonesdata-ts.txt")
print(f"Insert into seed-models.ts before the trailing ']'")
