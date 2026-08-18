import json

with open(r"d:\Desktop\crm-ui\scratch\ocr_full_report.json", "r", encoding="utf-8") as f:
    data = json.load(f)

print("=== BATCH 1: 0-18 ===")
for idx in range(0, 18):
    item = data[idx]
    print(f"[{idx+1:02d}] {item['current_filename']} ({item['width']}x{item['height']}):")
    print(f"     {item['text'][:300]}\n")

print("=== BATCH 2: 18-36 ===")
for idx in range(18, 36):
    item = data[idx]
    print(f"[{idx+1:02d}] {item['current_filename']} ({item['width']}x{item['height']}):")
    print(f"     {item['text'][:300]}\n")

print("=== BATCH 3: 36-54 ===")
for idx in range(36, 54):
    item = data[idx]
    print(f"[{idx+1:02d}] {item['current_filename']} ({item['width']}x{item['height']}):")
    print(f"     {item['text'][:300]}\n")
