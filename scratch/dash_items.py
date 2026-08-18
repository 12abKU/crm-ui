import json

with open(r"d:\Desktop\crm-ui\scratch\ocr_full_report.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for idx in range(11, 18):
    item = data[idx]
    print(f"=== DASHBOARD ITEM {idx+1} ===")
    print(f"File: {item['current_filename']}")
    # print lines that mention Summary, Deals, Bottlenecks, Contacts, Activities, Revenue, Team
    print(item["text"])
    print("-" * 60)
