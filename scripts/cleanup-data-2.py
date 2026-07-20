import json

with open('data/screen_catalog.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

bad = [s for s in data if s['wholesalePrice'] > 1000 or s['retailPrice'] > 1000]
print(f'Entries with bad prices (>1000): {len(bad)}')
for b in bad:
    print(f'  {b["brand"]} {b["model"]} W${b["wholesalePrice"]} R${b["retailPrice"]}')

data = [s for s in data if s['wholesalePrice'] < 500 and s['retailPrice'] < 500]
print(f'After cleanup: {len(data)} screens')

with open('data/screen_catalog.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
