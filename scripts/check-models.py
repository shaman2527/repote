"""Check Samsung models in seed data."""
import re

with open("src/lib/seed-models.ts", "r") as f:
    content = f.read()

samsung = re.findall(r"m\('Samsung',\s*'([^']+)'", content)
print(f"Total Samsung models: {len(samsung)}")

# A series
a_series = sorted([m for m in samsung if "Galaxy A" in m])
print(f"\n=== A SERIES ({len(a_series)}) ===")
for m in a_series:
    print(f"  {m}")

# Note series  
notes = sorted([m for m in samsung if "Note" in m])
print(f"\n=== NOTE SERIES ({len(notes)}) ===")
for m in notes:
    print(f"  {m}")

# S series
s_series = sorted([m for m in samsung if "Galaxy S" in m and "Galaxy A" not in m and "Galaxy J" not in m])
print(f"\n=== S SERIES ({len(s_series)}) ===")
for m in s_series:
    print(f"  {m}")

# J series
j_series = sorted([m for m in samsung if "Galaxy J" in m])
print(f"\n=== J SERIES ({len(j_series)}) ===")
for m in j_series:
    print(f"  {m}")

# M series
m_series = sorted([m for m in samsung if "Galaxy M" in m])
print(f"\n=== M SERIES ({len(m_series)}) ===")
for m in m_series:
    print(f"  {m}")

# Z/Fold
z_series = sorted([m for m in samsung if "Z" in m.split() or "Fold" in m])
print(f"\n=== Z/FOLD ({len(z_series)}) ===")
for m in z_series:
    print(f"  {m}")

# Check for duplicate or wrong brands (like POCO under Xiaomi)
print("\n=== BRAND COUNTS ===")
brands = {}
for match in re.finditer(r"m\('([^']+)'", content):
    b = match.group(1)
    brands[b] = brands.get(b, 0) + 1
for b, c in sorted(brands.items(), key=lambda x: -x[1]):
    print(f"  {b}: {c}")
