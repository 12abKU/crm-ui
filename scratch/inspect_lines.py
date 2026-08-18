import json

with open(r"d:\Desktop\crm-ui\scratch\ocr_full_report.json", "r", encoding="utf-8") as f:
    data = json.load(f)

print(f"Total items in report: {len(data)}\n")

for idx, item in enumerate(data):
    name = item["current_filename"]
    w = item["width"]
    h = item["height"]
    t = item["text"]
    
    # Analyze text signatures
    print("=" * 80)
    print(f"ITEM [{idx+1:02d}] {name} ({w}x{h}, aspect={item['aspect_ratio']}):")
    lines = [l.strip() for l in t.split(" | ") if l.strip()]
    if not lines:
        lines = [t]
    print("LINES SAMPLE:")
    for l in lines[:10]:
        print(f"  * {l[:100]}")
