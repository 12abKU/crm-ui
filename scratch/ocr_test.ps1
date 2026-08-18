Add-Type -AssemblyName System.Drawing
[Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime] | Out-Null
[Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType = WindowsRuntime] | Out-Null
[Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime] | Out-Null

$lang = [Windows.Globalization.Language]::new("en-US")
$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage($lang)

if (-not $engine) {
    $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
}

Write-Output "Engine created: $($engine.RecognizerLanguage.LanguageTag)"

$folder = "d:\Desktop\crm-screenshots"
$files = Get-ChildItem -Path $folder -Filter "*.png" | Where-Object { $_.Name -notlike "Screenshot*" }

foreach ($file in $files) {
    try {
        $asyncOp = [Windows.Storage.StorageFile]::GetFileFromPathAsync($file.FullName)
        $storageFile = $asyncOp.GetAwaiter().GetResult()
        
        $streamOp = $storageFile.OpenAsync([Windows.Storage.FileAccessMode]::Read)
        $stream = $streamOp.GetAwaiter().GetResult()
        
        $decOp = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)
        $decoder = $decOp.GetAwaiter().GetResult()
        
        $bmpOp = $decoder.GetSoftwareBitmapAsync()
        $bitmap = $bmpOp.GetAwaiter().GetResult()
        
        $ocrOp = $engine.RecognizeAsync($bitmap)
        $result = $ocrOp.GetAwaiter().GetResult()
        
        $text = ($result.Lines | ForEach-Object { $_.Text }) -join " | "
        Write-Output "FILE: $($file.Name)"
        Write-Output "TEXT: $text"
        Write-Output "---"
    } catch {
        Write-Output "ERROR on $($file.Name): $_"
    }
}
