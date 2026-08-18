import json

with open(r"d:\Desktop\crm-ui\scratch\ocr_full_report.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for idx, item in enumerate(data):
    print(f"=== INDEX {idx+1} ===")
    print(f"Current Name: {item['current_filename']}")
    print(f"Size: {item['width']}x{item['height']}")
    print(f"Text: {item['text']}")
    print("=" * 80)
