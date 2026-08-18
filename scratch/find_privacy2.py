import json

with open(r"d:\Desktop\crm-ui\scratch\ocr_full_report.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for idx, item in enumerate(data):
    t = item["text"]
    if "Consent" in t or "Data Request" in t or "GDPR" in t or "Data Protection" in t or "Breach" in t or "Erasure" in t or "Export" in t or "DSR" in t:
        print(f"[{idx+1:02d}] {item['current_filename']}: {t[:250]}\n")
