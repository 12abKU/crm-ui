import json

with open(r"d:\Desktop\crm-ui\scratch\ocr_full_report.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for idx in range(0, 24):
    t = data[idx]["text"].replace("\n", " ")
    name = data[idx]["current_filename"]
    w = data[idx]["width"]
    h = data[idx]["height"]
    print(f"[{idx+1:02d}] {name} ({w}x{h}):")
    print(f"     {t[:220]}")
