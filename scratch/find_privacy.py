import json

with open(r"d:\Desktop\crm-ui\scratch\ocr_full_report.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for idx, item in enumerate(data):
    t = item["text"]
    if "Privacy" in t or "Compliance" in t or "Consent" in t or "Audit" in t:
        print(f"[{idx+1:02d}] {item['current_filename']}: {t[:250]}\n")
