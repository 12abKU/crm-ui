import os
import asyncio
import winocr
from PIL import Image
import shutil

folder = r"C:\Users\iinve\Pictures\Screenshots"
target_dest = r"d:\Desktop\crm-screenshots\admin_privacy_compliance.png"

async def check_and_replace():
    files = [
        "Screenshot 2026-08-14 103013.png",
        "Screenshot 2026-08-14 103059.png",
        "Screenshot 2026-08-14 103105.png",
        "Screenshot 2026-08-14 103120.png"
    ]
    
    for f in files:
        p = os.path.join(folder, f)
        if os.path.exists(p):
            img = Image.open(p)
            ocr_res = await winocr.recognize_pil(img, 'en')
            text = " ".join([l.text for l in ocr_res.lines])
            print(f"=== {f} ===")
            print(text[:200])
            
            if "Manage Data Principal requests and security incident logging" in text or "Data Requests Data Breaches Recycle Bin" in text:
                print(f"-> FOUND TRUE PRIVACY SCREENSHOT: {f}!")
                shutil.copy2(p, target_dest)
                print(f"-> Overwrote {target_dest} successfully!")

if __name__ == "__main__":
    asyncio.run(check_and_replace())
