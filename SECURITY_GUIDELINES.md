# 🔒 Guías de Seguridad - OnlyFachas

## ⚠️ IMPORTANTE: NUNCA EXPONER API KEYS

### ❌ NUNCA HAGAS ESTO:
- ❌ No subas archivos con API keys reales
- ❌ No incluyas API keys en documentación
- ❌ No commitees archivos .env
- ❌ No uses API keys en archivos de ejemplo

### ✅ SIEMPRE HAZ ESTO:
- ✅ Usa variables de entorno (.env)
- ✅ Usa archivos .env.example para documentar
- ✅ Verifica .gitignore antes de commit
- ✅ Usa placeholders en documentación

## 🛡️ Configuración Segura

### Variables de Entorno
```bash
# .env (NUNCA commitees este archivo)
VITE_API_KEY=tu_api_key_real_aqui
VITE_MAINTENANCE_MODE=false
VITE_MAX_REQUESTS_PER_HOUR=10
VITE_REQUEST_DELAY=3
```

### Archivo de Ejemplo
```bash
# .env.example (SÍ commitees este archivo)
VITE_API_KEY=your_gemini_api_key_here
VITE_MAINTENANCE_MODE=false
VITE_MAX_REQUESTS_PER_HOUR=10
VITE_REQUEST_DELAY=3
```

## 🔍 Verificación Pre-Commit

Antes de hacer commit, verifica:
1. No hay API keys en archivos .md
2. No hay archivos .env en el commit
3. No hay secretos en documentación
4. .gitignore está actualizado

## 🚨 Si Expones una API Key

1. **INMEDIATAMENTE:**
   - Elimina el archivo del repositorio
   - Revoca la API key en Google Console
   - Genera una nueva API key
   - Actualiza todas las referencias

2. **Luego:**
   - Haz commit de la eliminación
   - Push inmediatamente
   - Verifica que no queden rastros

## 📝 Documentación Segura

Para documentar configuraciones:
- Usa placeholders: `VITE_API_KEY=your_api_key_here`
- No incluyas keys reales
- Usa archivos .env.example
- Documenta el proceso, no los valores

---
**Recuerda: La seguridad es responsabilidad de todos. Una API key expuesta puede costar dinero y comprometer la aplicación.**
