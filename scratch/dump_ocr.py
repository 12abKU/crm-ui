import os
import asyncio
import json
import winocr
from PIL import Image

folder = r"d:\Desktop\crm-screenshots"

async def scan_and_save():
    files = [f for f in os.listdir(folder) if f.endswith(".png") and not f.startswith("Screenshot")]
    files.sort()
    
    data = []
    for f in files:
        path = os.path.join(folder, f)
        img = Image.open(path)
        w, h = img.size
        
        try:
            ocr_res = await winocr.recognize_pil(img, 'en')
            text = " ".join([line.text for line in ocr_res.lines])
        except Exception as e:
            text = f"OCR Error: {e}"
            
        data.append({
            "current_filename": f,
            "width": w,
            "height": h,
            "aspect_ratio": round(w / h, 3),
            "text": text
        })
        
    with open(r"d:\Desktop\crm-ui\scratch\ocr_full_report.json", "w", encoding="utf-8") as out:
        json.dump(data, out, indent=2)
        
    print("Full OCR report saved to ocr_full_report.json")

if __name__ == "__main__":
    asyncio.run(scan_and_save())
