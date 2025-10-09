# Script para arreglar el parsing de JSON que viene con formato markdown
Write-Host "🔧 Arreglando parsing de JSON con formato markdown..." -ForegroundColor Cyan

# Leer el archivo actual
$content = Get-Content "services/geminiService.ts" -Raw

# Función para limpiar JSON
$jsonCleanerFunction = @"
// Función para limpiar JSON que viene con formato markdown
const cleanJsonResponse = (text: string): string => {
  // Remover markdown code blocks
  let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  
  // Remover espacios en blanco al inicio y final
  cleaned = cleaned.trim();
  
  // Si aún no es JSON válido, buscar el objeto JSON dentro del texto
  if (!cleaned.startsWith('{')) {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }
  }
  
  return cleaned;
};
"@

# Reemplazar el parsing directo con la función de limpieza
$oldParsing = "    const parsedResult = JSON.parse(text) as FachaResult;"
$newParsing = "    const cleanedText = cleanJsonResponse(text);`n    const parsedResult = JSON.parse(cleanedText) as FachaResult;"

$content = $content -replace [regex]::Escape($oldParsing), $newParsing

# Agregar la función al inicio del archivo después de los imports
$content = $content -replace "(import.*?;)", "`$1`n`n$jsonCleanerFunction"

# Guardar el archivo actualizado
$content | Set-Content "services/geminiService.ts" -Encoding UTF8

Write-Host "✅ Parsing de JSON arreglado exitosamente" -ForegroundColor Green
Write-Host "🔧 Ahora maneja respuestas con formato markdown" -ForegroundColor Yellow
Write-Host "🚀 El servidor se reiniciará automáticamente..." -ForegroundColor Yellow








