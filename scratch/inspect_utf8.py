import json

with open(r"d:\Desktop\crm-ui\scratch\ocr_full_report.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Let's inspect each item and see its text in detail
for idx, item in enumerate(data):
    name = item["current_filename"]
    w = item["width"]
    h = item["height"]
    t = item["text"].replace("\n", " ")
    print(f"[{idx+1:02d}] {name} ({w}x{h}): {t[:350]}\n")
