import json

with open(r"d:\Desktop\crm-ui\scratch\ocr_full_report.json", "r", encoding="utf-8") as f:
    data = json.load(f)

print(f"Total items: {len(data)}")

# Let's list all 54 items with their full OCR text printed so we can write the exact mapping
for idx, item in enumerate(data):
    name = item["current_filename"]
    w = item["width"]
    h = item["height"]
    t = item["text"]
    print(f"--- INDEX {idx} ---")
    print(f"File: {name} ({w}x{h})")
    print(f"Text: {t}")
