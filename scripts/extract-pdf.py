import pdfplumber
import os

os.makedirs('data', exist_ok=True)

with pdfplumber.open(r'C:\Users\ROBER\Downloads\CELL WORLD PANTALLAS 09-07-2026_.pdf') as pdf:
    all_text = []
    for i, page in enumerate(pdf.pages):
        text = page.extract_text()
        if text:
            all_text.append(f"=== PAGE {i+1} ===\n{text}")

    full_text = '\n'.join(all_text)
    with open('data/raw-pdf-text.txt', 'w', encoding='utf-8') as f:
        f.write(full_text)

    print(f"OK Extracted {len(full_text)} chars from {len(pdf.pages)} pages")
    print("=== FIRST 2000 CHARS ===")
    print(full_text[:2000])
