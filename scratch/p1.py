import json

with open(r"d:\Desktop\crm-ui\scratch\ocr_full_report.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for idx in range(0, 10):
    item = data[idx]
    print(f"[{idx+1:02d}] {item['current_filename']} ({item['width']}x{item['height']}):")
    print(f"     {item['text'][:350]}\n")
