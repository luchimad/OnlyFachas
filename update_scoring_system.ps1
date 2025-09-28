# Script para actualizar el sistema de puntuación a números más específicos
Write-Host "🎯 Actualizando sistema de puntuación para números más específicos..." -ForegroundColor Cyan

# Leer el archivo actual
$content = Get-Content "services/geminiService.ts" -Raw

# Actualizar el prompt para especificar números más precisos
$oldPrompt = "PASO 2: Sé optimista y generoso con las notas, pero no regales. Busca lo positivo en cada persona. Si alguien tiene buena actitud, estilo interesante, o algo que lo destaque, dale una nota alta (7-9). Solo da notas bajas (1-4) si realmente hay problemas serios de presentación. La mayoría de personas deberían estar entre 6-8.5."

$newPrompt = "PASO 2: Sé optimista y generoso con las notas, pero no regales. Busca lo positivo en cada persona. Si alguien tiene buena actitud, estilo interesante, o algo que lo destaque, dale una nota alta (7.0-9.9). Solo da notas bajas (1.0-4.9) si realmente hay problemas serios de presentación. La mayoría de personas deberían estar entre 6.0-8.9.

IMPORTANTE: Usa números específicos con decimales (ej: 7.1, 7.3, 7.7, 8.2, 8.6, etc.) en lugar de números redondos (7.0, 7.5, 8.0). Esto hace que los puntajes sean más únicos y precisos."

$content = $content -replace [regex]::Escape($oldPrompt), $newPrompt

# Actualizar la instrucción de rating
$oldRating = "rating: número del 1 al 10 (sé optimista pero justo)"
$newRating = "rating: número del 1.0 al 10.0 con decimales específicos (ej: 7.1, 7.3, 7.7, 8.2, 8.6) - sé optimista pero justo"

$content = $content -replace [regex]::Escape($oldRating), $newRating

# Guardar el archivo actualizado
$content | Set-Content "services/geminiService.ts" -Encoding UTF8

Write-Host "✅ Sistema de puntuación actualizado exitosamente" -ForegroundColor Green
Write-Host "🎯 Ahora generará puntajes como 7.1, 7.3, 7.7, 8.2, etc." -ForegroundColor Yellow
Write-Host "🚀 El servidor se reiniciará automáticamente..." -ForegroundColor Yellow

