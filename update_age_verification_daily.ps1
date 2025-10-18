# Script para cambiar la verificación de edad a expiración diaria
Write-Host "📅 Actualizando verificación de edad a expiración diaria..." -ForegroundColor Cyan

# Leer el archivo actual
$content = Get-Content "src/hooks/useAgeVerification.ts" -Raw

# Cambiar el comentario y la constante
$content = $content -replace "// La verificación expira después de 30 días", "// La verificación expira al final del día actual"
$content = $content -replace "const VERIFICATION_EXPIRY_DAYS = 30;", "// Ya no usamos días fijos, calculamos hasta el final del día"

# Actualizar la función confirmAge para calcular hasta el final del día
$oldConfirmAge = "  const confirmAge = useCallback(() => {`n    try {`n      const now = new Date();`n      const expiryDate = new Date(now.getTime() + (VERIFICATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000));`n      `n      localStorage.setItem(AGE_VERIFICATION_KEY, 'true');`n      localStorage.setItem(AGE_VERIFICATION_EXPIRY_KEY, expiryDate.toISOString());`n      `n      setIsAgeConfirmed(true);`n      console.log('Verificación de edad confirmada hasta:', expiryDate.toLocaleDateString());`n    } catch (error) {`n      console.error('Error al guardar verificación de edad:', error);`n      // Aún así confirmar para la sesión actual`n      setIsAgeConfirmed(true);`n    }`n  }, []);"

$newConfirmAge = "  const confirmAge = useCallback(() => {`n    try {`n      const now = new Date();`n      // Calcular hasta el final del día actual (23:59:59)`n      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);`n      `n      localStorage.setItem(AGE_VERIFICATION_KEY, 'true');`n      localStorage.setItem(AGE_VERIFICATION_EXPIRY_KEY, endOfDay.toISOString());`n      `n      setIsAgeConfirmed(true);`n      console.log('Verificación de edad confirmada hasta el final del día:', endOfDay.toLocaleDateString());`n    } catch (error) {`n      console.error('Error al guardar verificación de edad:', error);`n      // Aún así confirmar para la sesión actual`n      setIsAgeConfirmed(true);`n    }`n  }, []);"

$content = $content -replace [regex]::Escape($oldConfirmAge), $newConfirmAge

# Actualizar el comentario del hook
$content = $content -replace "- Solo se ejecuta una vez por sesión", "- Solo se ejecuta una vez por día"
$content = $content -replace "- Persiste en localStorage con expiración", "- Persiste hasta el final del día actual"

# Guardar el archivo actualizado
$content | Set-Content "src/hooks/useAgeVerification.ts" -Encoding UTF8

Write-Host "✅ Verificación de edad actualizada a expiración diaria" -ForegroundColor Green
Write-Host "📅 Ahora el cartel aparecerá solo una vez por día" -ForegroundColor Yellow
Write-Host "🚀 El servidor se reiniciará automáticamente..." -ForegroundColor Yellow














