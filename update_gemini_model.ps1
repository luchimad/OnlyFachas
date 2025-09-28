# Script para actualizar el modelo de Gemini a 2.5 Flash-Lite
Write-Host "🔄 Actualizando modelo de Gemini a 2.5 Flash-Lite..." -ForegroundColor Cyan

# Leer el archivo actual
$content = Get-Content "services/geminiService.ts" -Raw

# Reemplazar todas las instancias del modelo
$content = $content -replace '"gemini-1\.5-flash"', '"gemini-2.5-flash-lite"'

# Actualizar el comentario también
$content = $content -replace 'Instrucción especial optimista para Gemini 1\.5', 'Instrucción especial optimista para Gemini 2.5'

# Guardar el archivo actualizado
$content | Set-Content "services/geminiService.ts" -Encoding UTF8

Write-Host "✅ Modelo actualizado exitosamente a gemini-2.5-flash-lite" -ForegroundColor Green
Write-Host "🚀 El servidor se reiniciará automáticamente..." -ForegroundColor Yellow

