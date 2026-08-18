import json

with open(r"d:\Desktop\crm-ui\scratch\ocr_full_report.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for idx in range(len(data)):
    item = data[idx]
    name = item["current_filename"]
    w = item["width"]
    h = item["height"]
    t = item["text"].replace("\n", " ")
    print(f"ITEM {idx+1:02d} | FILE: {name:38s} | SIZE: {w}x{h}")
    # Extract important UI headers
    print(f"   FULL_TEXT: {t[:400]}\n")
