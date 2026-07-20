"""Analyze screen catalog for compatibility matching."""
import json, re

with open("src/data/screen_catalog.json") as f:
    data = json.load(f)

print(f"Total screens: {len(data)}")

# Samsung examples
sam = [s for s in data if s["brand"] == "Samsung"]
print(f"\nSamsung screens: {len(sam)}")
print("\nSample Samsung screens:")
for s in sam[:15]:
    print(f"  {s['model']:45s} {s['screenType']:25s} ${s['retailPrice']:.2f}")

# Xiaomi/Redmi
xiaomi = [s for s in data if s["brand"] == "Xiaomi"]
redmi_screens = [s for s in xiaomi if "Redmi" in s["model"] or "redmi" in s["model"].lower()]
print(f"\nXiaomi screens: {len(xiaomi)}, Redmi screens: {len(redmi_screens)}")
for s in redmi_screens[:10]:
    print(f"  {s['model']:45s} {s['screenType']:25s} ${s['retailPrice']:.2f}")

# Count by brand
from collections import Counter
brands = Counter(s["brand"] for s in data)
print(f"\nScreens by brand:")
for b, c in brands.most_common():
    print(f"  {b}: {c}")
