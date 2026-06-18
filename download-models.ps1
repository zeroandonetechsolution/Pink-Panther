# Download face-api.js models and library locally
$baseUrl = "https://github.com/justadudewhohacks/face-api.js/raw/master/weights"
$modelDir = "models"
$jsDir = "js"

# List of models to download
$models = @(
    "tiny_face_detector_model-weights_manifest.json",
    "tiny_face_detector_model-shard1",
    "face_landmark_68_model-weights_manifest.json",
    "face_landmark_68_model-shard1",
    "face_recognition_model-weights_manifest.json",
    "face_recognition_model-shard1",
    "face_recognition_model-shard2"
)

# Download face-api.js library
$faceApiUrl = "https://unpkg.com/face-api.js@0.22.2/dist/face-api.min.js"
$faceApiPath = Join-Path $jsDir "face-api.min.js"

Write-Host "🎀 Downloading Pink Panther face recognition..." -ForegroundColor Magenta

# Download face-api.js library
if (Test-Path $faceApiPath) {
    Write-Host "✅ face-api.min.js already exists" -ForegroundColor Green
} else {
    Write-Host "⬇️ Downloading face-api.min.js..." -ForegroundColor Cyan
    try {
        Invoke-WebRequest -Uri $faceApiUrl -OutFile $faceApiPath -UseBasicParsing
        Write-Host "✅ Downloaded face-api.min.js" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to download face-api.min.js" -ForegroundColor Red
        Write-Host "   Error: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎀 Downloading Pink Panther face recognition models..." -ForegroundColor Magenta

foreach ($model in $models) {
    $url = "$baseUrl/$model"
    $outputPath = Join-Path $modelDir $model
    
    if (Test-Path $outputPath) {
        Write-Host "✅ $model already exists" -ForegroundColor Green
    } else {
        Write-Host "⬇️ Downloading $model..." -ForegroundColor Cyan
        try {
            Invoke-WebRequest -Uri $url -OutFile $outputPath -UseBasicParsing
            Write-Host "✅ Downloaded $model" -ForegroundColor Green
        } catch {
            Write-Host "❌ Failed to download $model" -ForegroundColor Red
            Write-Host "   Error: $_" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "🎉 All models downloaded!" -ForegroundColor Green
Write-Host "🚀 Now open http://localhost:3000 and register your face!" -ForegroundColor Magenta
