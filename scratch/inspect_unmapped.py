import json

with open(r"d:\Desktop\crm-ui\scratch\ocr_full_report.json", "r", encoding="utf-8") as f:
    data = json.load(f)

unmapped_indices = [11, 12, 13, 14, 15, 16, 17, 25, 27, 32, 33, 37, 38, 39, 40]

for idx in unmapped_indices:
    item = data[idx]
    print(f"=== INDEX {idx+1}: {item['current_filename']} ({item['width']}x{item['height']}) ===")
    print(item["text"])
    print("-" * 60)
