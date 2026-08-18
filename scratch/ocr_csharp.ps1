$code = @"
using System;
using System.IO;
using System.Threading.Tasks;
using Windows.Graphics.Imaging;
using Windows.Media.Ocr;
using Windows.Storage;

public class OcrHelper
{
    private OcrEngine engine;

    public OcrHelper()
    {
        engine = OcrEngine.TryCreateFromUserProfileLanguages();
    }

    public async Task<string> RecognizeAsync(string filePath)
    {
        StorageFile file = await StorageFile.GetFileFromPathAsync(filePath);
        using (var stream = await file.OpenAsync(FileAccessMode.Read))
        {
            BitmapDecoder decoder = await BitmapDecoder.CreateAsync(stream);
            SoftwareBitmap bitmap = await decoder.GetSoftwareBitmapAsync();
            OcrResult result = await engine.RecognizeAsync(bitmap);
            return result.Text;
        }
    }
}
"@

Add-Type -TypeDefinition $code -Language CSharp -ReferencedAssemblies "System.Runtime.WindowsRuntime"

$ocr = [OcrHelper]::new()

$folder = "d:\Desktop\crm-screenshots"
$files = Get-ChildItem -Path $folder -Filter "*.png" | Where-Object { $_.Name -notlike "Screenshot*" }

foreach ($file in $files) {
    try {
        $text = $ocr.RecognizeAsync($file.FullName).GetAwaiter().GetResult()
        Write-Output "FILE: $($file.Name)"
        Write-Output "TEXT: $text"
        Write-Output "========================================"
    } catch {
        Write-Output "ERROR on $($file.Name): $_"
    }
}
