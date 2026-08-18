import os
import asyncio
import winocr
from PIL import Image

folder = r"d:\Desktop\crm-screenshots"

async def scan_all():
    files = [f for f in os.listdir(folder) if f.endswith(".png") and not f.startswith("Screenshot")]
    files.sort()
    
    results = []
    for f in files:
        path = os.path.join(folder, f)
        img = Image.open(path)
        w, h = img.size
        
        # Run OCR
        try:
            ocr_res = await winocr.recognize_pil(img, 'en')
            text = " ".join([line.text for line in ocr_res.lines])
        except Exception as e:
            text = f"OCR Error: {e}"
            
        results.append({
            "filename": f,
            "dimensions": f"{w}x{h}",
            "text_sample": text[:300]
        })
        
    for r in results:
        print(f"=== {r['filename']} ({r['dimensions']}) ===")
        print(f"TEXT: {r['text_sample']}\n")

if __name__ == "__main__":
    asyncio.run(scan_all())
