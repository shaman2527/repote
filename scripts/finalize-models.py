"""
Generate comprehensive seed-models.ts with ALL available models.
Combines PhoneSpecsAPI data + CELL WORLD screens + Venezuela common models.
"""

import re, os, json

os.makedirs("data", exist_ok=True)

# Load current seed
with open("src/lib/seed-models.ts", "r") as f:
    current = f.read()

# Extract existing (brand, model) pairs
existing = set()
for m in re.finditer(r"m\('([^']+)',\s*'([^']+)'", current):
    existing.add((m.group(1), m.group(2).lower()))

print(f"Existing in seed: {len(existing)}")

# PhoneSpecsAPI model data - all models organized by brand
PHONESPECSA_MODELS = {
    'Samsung': [
        'Galaxy S23 Ultra', 'Galaxy S23', 'Galaxy S23+', 'Galaxy S22 Ultra', 'Galaxy S22', 'Galaxy S22+',
        'Galaxy S21 Ultra', 'Galaxy S21', 'Galaxy S21+', 'Galaxy S20 Ultra', 'Galaxy S20', 'Galaxy S20+', 'Galaxy S20 FE',
        'Galaxy S10', 'Galaxy S10+', 'Galaxy S9+', 'Galaxy S9', 'Galaxy S8+', 'Galaxy S8', 'Galaxy S7 Edge', 'Galaxy S7',
        'Galaxy S6 Edge+', 'Galaxy S6 Edge', 'Galaxy S6', 'Galaxy S5', 'Galaxy S4', 'Galaxy S III', 'Galaxy S II', 'Galaxy S',
        'Galaxy A54 5G', 'Galaxy A34 5G', 'Galaxy A24 4G', 'Galaxy A24', 'Galaxy A14 5G', 'Galaxy A14',
        'Galaxy A05s', 'Galaxy A05', 'Galaxy A04s', 'Galaxy A04e', 'Galaxy A04',
        'Galaxy A13', 'Galaxy A13 5G', 'Galaxy A23', 'Galaxy A23 5G', 'Galaxy A33 5G', 'Galaxy A53 5G', 'Galaxy A73 5G',
        'Galaxy A02', 'Galaxy A03', 'Galaxy A03s', 'Galaxy A12', 'Galaxy A12 Nacho',
        'Galaxy A71 5G', 'Galaxy A71', 'Galaxy A51 5G', 'Galaxy A51', 'Galaxy A42 5G', 'Galaxy A41',
        'Galaxy A31', 'Galaxy A21s', 'Galaxy A21', 'Galaxy A11', 'Galaxy A02s', 'Galaxy A01 Core', 'Galaxy A01',
        'Galaxy A10', 'Galaxy A10e', 'Galaxy A10s', 'Galaxy A20', 'Galaxy A20e', 'Galaxy A20s',
        'Galaxy A30', 'Galaxy A30s', 'Galaxy A40', 'Galaxy A50', 'Galaxy A50s', 'Galaxy A60',
        'Galaxy A70', 'Galaxy A70s', 'Galaxy A80', 'Galaxy A90 5G', 'Galaxy A6 (2018)', 'Galaxy A6+ (2018)',
        'Galaxy A7 (2018)', 'Galaxy A8 (2018)', 'Galaxy A8+ (2018)', 'Galaxy A8 Star (2018)', 'Galaxy A9 (2018)',
        'Galaxy A3 (2017)', 'Galaxy A5 (2017)', 'Galaxy A7 (2017)', 'Galaxy A3 (2016)', 'Galaxy A5 (2016)', 'Galaxy A7 (2016)',
        'Galaxy A8 (2016)', 'Galaxy A9 (2016)', 'Galaxy A9 Pro (2016)', 'Galaxy A52',
        'Galaxy Z Flip', 'Galaxy Z Flip 5G', 'Galaxy Z Flip 3', 'Galaxy Z Flip 4', 'Galaxy Z Flip 5', 'Galaxy Z Flip 6',
        'Galaxy Fold', 'Galaxy Z Fold 2', 'Galaxy Z Fold 3', 'Galaxy Z Fold 4', 'Galaxy Z Fold 5', 'Galaxy Z Fold 6',
        'Galaxy Note', 'Galaxy Note II', 'Galaxy Note 3', 'Galaxy Note 4', 'Galaxy Note 5', 'Galaxy Note 8',
        'Galaxy Note 9', 'Galaxy Note 10', 'Galaxy Note 10+', 'Galaxy Note 20', 'Galaxy Note 20 Ultra',
        'Galaxy M10', 'Galaxy M20', 'Galaxy M30', 'Galaxy M31', 'Galaxy M02',
        'Galaxy M12', 'Galaxy M32', 'Galaxy M33 5G', 'Galaxy M04', 'Galaxy M14 5G', 'Galaxy M34 5G', 'Galaxy M54 5G', 'Galaxy M55 5G',
    ],
    'Apple': [
        'iPhone', 'iPhone 3G', 'iPhone 3GS', 'iPhone 4', 'iPhone 4S',
        'iPhone 5', 'iPhone 5C', 'iPhone 5S', 'iPhone 6', 'iPhone 6 Plus',
        'iPhone 6S', 'iPhone 6S Plus', 'iPhone SE (1st generation)',
        'iPhone 7', 'iPhone 7 Plus', 'iPhone 8', 'iPhone 8 Plus', 'iPhone X',
        'iPhone XR', 'iPhone XS', 'iPhone XS Max',
        'iPhone 11', 'iPhone 11 Pro', 'iPhone 11 Pro Max', 'iPhone SE (2nd generation)',
        'iPhone 12 mini', 'iPhone 12', 'iPhone 12 Pro', 'iPhone 12 Pro Max',
        'iPhone 13', 'iPhone 13 Pro', 'iPhone 13 Pro Max',
        'iPhone 14', 'iPhone 14 Pro', 'iPhone 14 Pro Max',
        'iPhone 15', 'iPhone 15 Pro', 'iPhone 15 Pro Max',
        'iPhone 16', 'iPhone 16 Pro', 'iPhone 16 Pro Max',
        'iPhone 17', 'iPhone 17 Pro', 'iPhone 17 Pro Max',
    ],
    'Xiaomi': [
        'Xiaomi 14', 'Xiaomi 14 Pro', 'Xiaomi 14 Ultra',
        'Xiaomi 13', 'Xiaomi 13 Pro', 'Xiaomi 13 Ultra', 'Xiaomi 13 Lite',
        'Xiaomi 12T', 'Xiaomi 12T Pro',
        'Xiaomi 15', 'Xiaomi 15 Pro', 'Xiaomi 15 Ultra', 'Xiaomi 15S Pro', 'Xiaomi 15T', 'Xiaomi 15T Pro',
        'Xiaomi 17', 'Xiaomi 17 Pro', 'Xiaomi 17 Pro Max', 'Xiaomi 17 Ultra',
        'Mi 10', 'Mi 10 Pro', 'Mi 10 Ultra', 'Mi 10T', 'Mi 10T Pro', 'Mi 10i',
        'Mi 11', 'Mi 11 Pro', 'Mi 11 Ultra', 'Mi 11 Lite', 'Mi 11X', 'Mi 11X Pro',
        'Mi 10T Lite', 'Mi 12X',
        'Mi Note 2', 'Mi Note 3', 'Mi MIX', 'Mi MIX 2', 'Mi MIX 2S', 'Mi MIX 3',
        'Mi A1', 'Mi A2', 'Mi A3',
        'Mi MIX Fold 2', 'Mi MIX Fold 3',
        'Civi 1', 'Civi 2', 'Civi 3',
        'Redmi K20', 'Redmi K20 Pro', 'Redmi K40', 'Redmi K40 Pro', 'Redmi K40 Pro+',
        'Redmi K50', 'Redmi K50 Pro', 'Redmi K50 Ultra',
        'Redmi K70', 'Redmi K70 Pro', 'Redmi K70 Ultra',
        'Redmi Note 8', 'Redmi Note 8 Pro', 'Redmi Note 9S', 'Redmi Note 9T',
        'Redmi Note 10', 'Redmi Note 10 Pro', 'Redmi Note 10S',
        'Redmi Note 11', 'Redmi Note 11 Pro', 'Redmi Note 11S',
        'Redmi Note 12', 'Redmi Note 12 Pro', 'Redmi Note 12T', 'Redmi Note 12 Pro Speed', 'Redmi Note 12S',
        'Redmi Note 13', 'Redmi Note 13 Pro', 'Redmi Note 13 Pro+',
        'Redmi Note 15', 'Redmi Note 15 5G', 'Redmi Note 15 Pro', 'Redmi Note 15 Pro+', 'Redmi Note 15 Pro 4G',
        'Redmi 9', 'Redmi 9A', 'Redmi 9 Power',
        'Redmi 9C', 'Redmi 10A', 'Redmi 12C',
        'POCO F1', 'POCO F2 Pro',
        'POCO X7', 'POCO X7 Pro',
        'POCO F8 Pro', 'POCO F8 Ultra',
    ],
    'Huawei': [
        'P60 Pro', 'P50 Pro', 'P50', 'P40 Pro', 'P40', 'P40 Pro+',
        'P30 Pro', 'P30', 'P20 Pro', 'P20', 'P10 Plus', 'P10',
        'P9 Plus', 'P9', 'P8', 'P Smart', 'P Smart+', 'P Smart 2019', 'P Smart Pro', 'P Smart Z',
        'Mate 60 Pro', 'Mate 60', 'Mate 60 Pro+', 'Mate 50 Pro', 'Mate 50',
        'Mate 40 Pro', 'Mate 40 Pro+', 'Mate 30 Pro', 'Mate 30',
        'Mate 20 Pro', 'Mate 20', 'Mate 10 Pro', 'Mate 10', 'Mate 9', 'Mate S', 'Mate 7',
        'Pura 70', 'Pura 70 Pro', 'Pura 70 Ultra',
        'Nova 9', 'Nova 8', 'Nova 8i',
        'Honor 90', 'Honor 70', 'Honor 50', 'Honor 20 Lite', 'Honor 10 Lite',
        'Honor 9X', 'Honor 9A', 'Honor 9S', 'Honor 8S', 'Honor 8A', 'Honor 8C',
        'Honor Play', 'Honor Play 9A',
        'Y9a', 'Y9 (2019)', 'Y9 (2018)', 'Y9 Prime (2019)',
        'Y7 (2019)', 'Y7 (2018)', 'Y7 Prime (2019)',
        'Y6 (2018)', 'Y6 (2017)', 'Y6 Pro (2019)',
        'Y5 (2018)', 'Y5 (2017)', 'Y5 Prime (2018)',
        'Y3 (2017)',
    ],
    'Google': [
        'Pixel 8 Pro', 'Pixel 8', 'Pixel 7 Pro', 'Pixel 7', 'Pixel 7a',
        'Pixel 6 Pro', 'Pixel 6', 'Pixel 6a', 'Pixel 5a 5G', 'Pixel 5',
        'Pixel 4a 5G', 'Pixel 4a', 'Pixel 4 XL', 'Pixel 4',
        'Pixel 3a XL', 'Pixel 3a', 'Pixel 3 XL', 'Pixel 3',
        'Pixel 2 XL', 'Pixel 2', 'Pixel XL', 'Pixel',
        'Pixel 5a',
    ],
    'Nokia': [
        'Nokia G42 5G', 'Nokia G310 5G', 'Nokia C12 Pro', 'Nokia X50',
        'Nokia G60 5G', 'Nokia X30 5G', 'Nokia G21', 'Nokia G11',
        'Nokia X10', 'Nokia C30', 'Nokia G20', 'Nokia G50',
        'Nokia XR20', 'Nokia 3.4', 'Nokia 5.3', 'Nokia 8.3 5G',
        'Nokia 2.3', 'Nokia 7.2', 'Nokia 4.2', 'Nokia 9 PureView',
        'Nokia 6.1', 'Nokia 8 Sirocco', 'Nokia 7 Plus', 'Nokia 8',
        'Nokia 6', 'Nokia 5', 'Nokia 3',
        'Nokia 3310 (2017)', 'Nokia 3210 4G (2024)',
    ],
}

# Count models to add
phonepsecsa_all = []
for brand, models in PHONESPECSA_MODELS.items():
    for model in models:
        key = model.lower()
        if (brand, key) not in existing:
            phonepsecsa_all.append((brand, model))

print(f"PhoneSpecsAPI models to add: {len(phonepsecsa_all)}")

# Add screen catalog brands that are NOT in PhoneSpecsAPI
EXTRA_BRAND_MODELS = {
    'Tecno': ['Spark 4', 'Spark 5', 'Spark 5 Pro', 'Spark 6', 'Spark 6 Air', 'Spark 7', 'Spark 7T', 'Spark 8', 'Spark 8C', 'Spark 8P',
              'Spark 9', 'Spark 9 Pro', 'Spark 10', 'Spark 10 Pro', 'Spark 20', 'Spark 20 Pro',
              'Spark Go', 'Spark Go 2020', 'Spark Go 2021', 'Spark Go 2022', 'Spark Go 2023', 'Spark Go 2024', 'Spark Go 1',
              'Camon 12', 'Camon 12 Air', 'Camon 15', 'Camon 15 Air', 'Camon 16', 'Camon 16 Pro', 'Camon 16 S',
              'Camon 17', 'Camon 17 Pro', 'Camon 17P', 'Camon 18', 'Camon 18P', 'Camon 19', 'Camon 19 Pro',
              'Camon 20', 'Camon 20 Pro', 'Camon 20 Premier',
              'Camon 30', 'Camon 30 Pro', 'Camon 30 Premier', 'Camon 30S',
              'Pova', 'Pova 2', 'Pova 3', 'Pova 4', 'Pova 5', 'Pova 6',
              'Pop 6', 'Pop 7', 'Pop 1F', 'Pop 2F',
              ],
    'Infinix': ['Hot 8', 'Hot 9', 'Hot 9 Play', 'Hot 10', 'Hot 10 Lite', 'Hot 10S',
                'Hot 11', 'Hot 11S', 'Hot 12', 'Hot 12i', 'Hot 20', 'Hot 20i', 'Hot 20S', 'Hot 20Wi',
                'Hot 30', 'Hot 30i', 'Hot 40', 'Hot 40 Pro', 'Hot 50i',
                'Note 7', 'Note 7 Lite', 'Note 8', 'Note 8i', 'Note 10', 'Note 11', 'Note 12',
                'Note 30', 'Note 40', 'Note 40 Pro',
                'Smart 5', 'Smart 5 Pro', 'Smart 6', 'Smart 7', 'Smart 8',
                'Zero 5', 'Zero 6', 'Zero 8', 'Zero X', 'Zero X Pro', 'Zero 20', 'Zero 30',
                ],
    'Motorola': ['Moto E4', 'Moto E4 Plus', 'Moto E5', 'Moto E5 Play', 'Moto E5 Plus',
                 'Moto E6', 'Moto E6 Play', 'Moto E6 Plus', 'Moto E6i', 'Moto E6S',
                 'Moto E7', 'Moto E7 Plus', 'Moto E7 Power',
                 'Moto E13', 'Moto E14', 'Moto E22', 'Moto E22i', 'Moto E30', 'Moto E32', 'Moto E40',
                 'Moto G4', 'Moto G4 Plus', 'Moto G5', 'Moto G5 Plus', 'Moto G6', 'Moto G6 Plus',
                 'Moto G7', 'Moto G7 Plus', 'Moto G7 Power',
                 'Moto G8', 'Moto G8 Plus', 'Moto G8 Power',
                 'Moto G9', 'Moto G9 Plus', 'Moto G9 Play',
                 'Moto G10', 'Moto G20', 'Moto G22', 'Moto G30', 'Moto G31', 'Moto G32',
                 'Moto G41', 'Moto G42', 'Moto G50', 'Moto G51', 'Moto G52', 'Moto G53', 'Moto G54',
                 'Moto G60', 'Moto G71', 'Moto G73', 'Moto G84', 'Moto G100',
                 'Moto Edge', 'Moto Edge+', 'Moto Edge 20', 'Moto Edge 30', 'Moto Edge 40', 'Moto Edge 50 Pro',
                 'Moto Edge Neo', 'Moto Edge Lite', 'Moto Edge Fusion',
                 ],
    'LG': ['K4 (2017)', 'K8 (2017)', 'K10 (2017)', 'K11', 'K12+', 'K20 (2019)', 'K22', 'K31', 'K40', 'K40S',
           'K41S', 'K42', 'K50', 'K50S', 'K51S', 'K52', 'K61', 'K62', 'K71',
           'Q6', 'Q7', 'Q60', 'Q70', 'Q710',
           'Stylo 4', 'Stylo 5', 'Stylo 6',
           'Velvet', 'Wing', 'V60 ThinQ', 'G8 ThinQ', 'G7 ThinQ',
           ],
    'Alcatel': ['1 (2021)', '1B (2020)', '1B (2022)', '1V (2019)', '1V (2020)', '1V (2021)', '1X (2019)',
                '1S (2019)', '1S (2020)', '1S (2021)', '1SE (2020)', '3C (2019)', '3L (2021)', '3X (2018)', '3X (2019)', '3X (2020)',
                ],
    'ZTE': ['Blade A3', 'Blade A3 Lite', 'Blade A5', 'Blade A7', 'Blade A7S', 'Blade A31', 'Blade A31 Lite',
            'Blade A33', 'Blade A34', 'Blade A35', 'Blade A35E', 'Blade A53', 'Blade A54', 'Blade A71', 'Blade A72', 'Blade A73',
            'Blade L8', 'Blade L130',
            'Nubia Focus', 'Nubia Focus 5G', 'Nubia Focus Pro', 'Nubia Neo', 'Nubia Neo 5G', 'Nubia Music',
            ],
    'BLU': ['G50', 'G50 Plus', 'G51 Plus', 'G53', 'G60', 'G61', 'G61 Plus', 'G70', 'G71 Plus',
            'G73', 'G8', 'G80', 'G90', 'G91', 'G91 Pro', 'G91S', 'S91',
            ],
    'Vivo': ['Y11', 'Y11S', 'Y15S', 'Y16', 'Y17', 'Y20', 'Y20i', 'Y21', 'Y21S', 'Y22',
             'Y30', 'Y33S', 'Y50', 'Y51', 'Y53S', 'Y71', 'Y83', 'Y85', 'Y93',
             'X6', 'V70',
             ],
    'TCL': ['10 SE', '20 E', '20 L', '20 SE', '30 SE', '40 SE', 'L10 Lite'],
    'Blackview': ['A70', 'A80', 'A80 Plus', 'A90', 'A90 Plus', 'A100', 'BV5100', 'BV6600'],
    'Umidigi': ['A5 Pro', 'A7', 'A7 Pro', 'A9', 'A9 Pro', 'A11', 'A11 Pro Max', 'A11S',
                'Bison', 'Bison GT', 'Bison X10', 'Bison X10 Pro', 'Power', 'Power 5', 'Power 5S',
                ],
    'Krip': ['K55', 'K57', 'K5M', 'K6', 'K6B', 'K68'],
}

extra_to_add = []
for brand, models in EXTRA_BRAND_MODELS.items():
    for model in models:
        key = model.lower()
        if (brand, key) not in existing:
            extra_to_add.append((brand, model))

print(f"Extra brand models to add: {len(extra_to_add)}")

# Generate new entries
all_new = phonepsecsa_all + extra_to_add

# FRP methods by brand
FRP_MAP = {
    'Samsung': ('Exynos/Snapdragon', 'Testpoint'),
    'Apple': ('Apple Silicon', 'Bypass'),
    'Xiaomi': ('Snapdragon/MediaTek', 'BROM'),
    'Huawei': ('Kirin/Snapdragon', 'BROM'),
    'Google': ('Tensor', 'Bypass'),
    'Nokia': ('Snapdragon', 'Testpoint'),
    'Tecno': ('Unisoc/MediaTek', 'SPD'),
    'Infinix': ('Unisoc/MediaTek', 'SPD'),
    'Motorola': ('Snapdragon', 'Testpoint'),
    'LG': ('MediaTek/Snapdragon', 'BROM'),
    'Alcatel': ('Unisoc', 'SPD'),
    'ZTE': ('Unisoc', 'SPD'),
    'BLU': ('MediaTek', 'BROM'),
    'Vivo': ('MediaTek', 'BROM'),
    'TCL': ('MediaTek', 'BROM'),
    'Blackview': ('MediaTek', 'BROM'),
    'Umidigi': ('MediaTek', 'BROM'),
    'POCO': ('MediaTek', 'BROM'),
    'Krip': ('MediaTek', 'BROM'),
}

# Generate entries text
new_entries = []
for brand, model in all_new:
    chipset, frp = FRP_MAP.get(brand, ('Unknown', ''))
    # Escape single quotes in model names
    model_escaped = model.replace("'", "\\'")
    new_entries.append(f"    m('{brand}', '{model_escaped}', '{chipset}', '{frp}'),")

print(f"\nTotal new entries to add: {len(new_entries)}")
print(f"\n{'=' * 60}")
print("NEW ENTRIES TO ADD TO seed-models.ts:")
print(f"{'=' * 60}\n")

# Write to file
with open("data/new-seed-entries.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(new_entries))

# Print summary
print(f"First 30 entries:")
for e in new_entries[:30]:
    print(f"  {e}")
print(f"\nTotal: {len(new_entries)} entries")
print(f"\nFile saved to data/new-seed-entries.txt")
print(f"\nTo add to seed-models.ts:")
print(f"  1. Open src/lib/seed-models.ts")
print(f"  2. Find the closing ']' at the end of the return array")
print(f"  3. Paste the contents of data/new-seed-entries.txt before the ']'")
