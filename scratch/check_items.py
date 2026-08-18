import json

with open(r"d:\Desktop\crm-ui\scratch\ocr_full_report.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for idx in [33, 34, 35, 39]:
    item = data[idx]
    print(f"=== [{idx+1}] {item['current_filename']} ===")
    print(item["text"])
    print("=" * 80)
