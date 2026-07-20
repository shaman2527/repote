import json
import re
import uuid

with open('data/screen_catalog.json', 'r', encoding='utf-8') as f:
    screens = json.load(f)

NOISE = {'D', 'L', 'R', 'O', 'W', 'E', 'C', 'DL', 'LD', 'DR', 'RD', 'LR', 'RL',
         'WD', 'LL', 'LE', 'RE', 'RO', 'CO', 'OW', 'EC', 'DLD', 'LLL', 'LLE',
         'REC', 'ERO', 'ROC', 'OCW', 'COW', 'LDL', 'LLR', 'REO', 'ECO', 'OWW',
         'WW', 'ER', 'ERC'}

cleaned = []
seen = set()

for s in screens:
    model = s['model']
    # Remove noise words
    parts = model.split()
    clean_parts = []
    for p in parts:
        p_clean = p.strip('.,/;:')
        if p_clean.upper() in NOISE or p_clean.upper() == '3/4':
            continue
        # Remove trailing/leading noise chars
        p_clean = re.sub(r'^[LDROWCEL]+$', '', p_clean)
        if p_clean:
            clean_parts.append(p_clean)
    
    model = ' '.join(clean_parts).strip()
    model = re.sub(r'\s+', ' ', model).strip()
    
    if not model or len(model) < 2:
        continue
    
    s['model'] = model
    s['id'] = str(uuid.uuid4())
    
    key = (s['brand'], s['model'].lower(), s['screenType'])
    if key not in seen:
        seen.add(key)
        cleaned.append(s)

print(f"Cleaned: {len(screens)} -> {len(cleaned)} unique screens")

# Count by brand
from collections import Counter
brands = Counter(s['brand'] for s in cleaned)
for b, c in brands.most_common():
    print(f"  {b}: {c}")

with open('data/screen_catalog.json', 'w', encoding='utf-8') as f:
    json.dump(cleaned, f, ensure_ascii=False, indent=2)

print("\n=== SAMPLE ===")
for s in cleaned[:20]:
    print(f"  {s['brand']:12s} | {s['model']:40s} | {s['screenType']:25s} | ${s['wholesalePrice']:.2f} / ${s['retailPrice']:.2f} | {s['stockStatus']}")
