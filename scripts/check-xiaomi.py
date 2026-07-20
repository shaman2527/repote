"""Check Xiaomi/Redmi/POCO model coverage."""
import re

with open("src/lib/seed-models.ts") as f:
    content = f.read()

xiaomi = re.findall(r"m\('Xiaomi',\s*'([^']+)'", content)
poco = re.findall(r"m\('POCO',\s*'([^']+)'", content)

print(f"=== XIAOMI MODELS ({len(xiaomi)}) ===")
redmi = []
other = []
for m in sorted(xiaomi):
    if "Redmi" in m or "redmi" in m:
        redmi.append(m)
    else:
        other.append(m)

print(f"\n--- Redmi ({len(redmi)}) ---")
for m in redmi:
    print(f"  {m}")

print(f"\n--- Other Xiaomi ({len(other)}) ---")
for m in other:
    print(f"  {m}")

print(f"\n=== POCO MODELS ({len(poco)}) ===")
for m in sorted(poco):
    print(f"  {m}")

# Common models that might be missing
print("\n=== COMMON REDMI MODELS - CHECKING FOR GAPS ===")
common = [
    "Redmi 1", "Redmi 1S", "Redmi 2", "Redmi 2 Prime", "Redmi 3", "Redmi 3S", "Redmi 3S Prime",
    "Redmi 4", "Redmi 4A", "Redmi 4X", "Redmi 5", "Redmi 5A", "Redmi 5 Plus",
    "Redmi 6", "Redmi 6A", "Redmi 6 Pro",
    "Redmi 7", "Redmi 7A",
    "Redmi 8", "Redmi 8A", "Redmi 8A Dual",
    "Redmi 9", "Redmi 9A", "Redmi 9AT", "Redmi 9C", "Redmi 9C NFC", "Redmi 9i",
    "Redmi 9 Power", "Redmi 9 Prime",
    "Redmi 10", "Redmi 10 5G", "Redmi 10A", "Redmi 10C", "Redmi 10 Power",
    "Redmi 11 Prime", "Redmi 12", "Redmi 12 5G", "Redmi 12C",
    "Redmi 13C", "Redmi 13C 5G",
    "Redmi A1", "Redmi A2", "Redmi A3", "Redmi A4", "Redmi A5",
    "Redmi Note 4", "Redmi Note 4G", "Redmi Note 5", "Redmi Note 5 Pro",
    "Redmi Note 6 Pro",
    "Redmi Note 7", "Redmi Note 7 Pro", "Redmi Note 7S",
    "Redmi Note 8", "Redmi Note 8 Pro", "Redmi Note 8T",
    "Redmi Note 9", "Redmi Note 9 4G", "Redmi Note 9 Pro", "Redmi Note 9 Pro Max",
    "Redmi Note 9S", "Redmi Note 9T",
    "Redmi Note 10", "Redmi Note 10 5G", "Redmi Note 10 Pro", "Redmi Note 10S",
    "Redmi Note 11", "Redmi Note 11 4G", "Redmi Note 11 Pro", "Redmi Note 11S",
    "Redmi Note 11T", "Redmi Note 11T Pro",
    "Redmi Note 12", "Redmi Note 12 4G", "Redmi Note 12 Pro", "Redmi Note 12S", "Redmi Note 12T",
    "Redmi Note 13", "Redmi Note 13 4G", "Redmi Note 13 Pro", "Redmi Note 13 Pro+",
    "Redmi Note 14", "Redmi 14C", "Redmi 14R",
    "Redmi K20", "Redmi K20 Pro", "Redmi K30", "Redmi K30 Pro", "Redmi K30S",
    "Redmi K40", "Redmi K40 Pro", "Redmi K40 Pro+",
    "Redmi K50", "Redmi K50 Pro", "Redmi K50 Ultra",
    "Redmi K60", "Redmi K60 Pro", "Redmi K60 Ultra",
    "Redmi K70", "Redmi K70 Pro", "Redmi K70 Ultra",
]

existing_lower = set(m.lower() for m in xiaomi + poco)

import sys
sys.stdout.reconfigure(encoding='utf-8')

print("\nMISSING COMMON MODELS:")
missing = []
for model in common:
    ml = model.lower()
    found = False
    for ex in existing_lower:
        if ml == ex or ml in ex or ex in ml:
            found = True
            break
    if not found:
        missing.append(model)
        print(f"  MISSING: {model}")

print(f"\nTotal missing: {len(missing)}")
