import json

with open(r"d:\Desktop\crm-ui\scratch\ocr_full_report.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for idx, item in enumerate(data):
    print(f"[{idx+1}] File: {item['current_filename']} | Size: {item['width']}x{item['height']} | Ratio: {item['aspect_ratio']}")
    print(f"    Text: {item['text'][:250]}...\n")
