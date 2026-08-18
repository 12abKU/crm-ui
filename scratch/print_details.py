import json

with open(r"d:\Desktop\crm-ui\scratch\ocr_full_report.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for idx, item in enumerate(data):
    name = item["current_filename"]
    w = item["width"]
    h = item["height"]
    t = item["text"]
    print(f"=== [{idx+1}] {name} ({w}x{h}) ===")
    # Print first 500 chars
    print(t[:500])
    print("-" * 60)
