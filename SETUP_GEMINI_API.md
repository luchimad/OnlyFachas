# Configuración de la API de Gemini

## Problema Actual
La aplicación está funcionando en **modo demo** porque no tienes configurada la API key de Google Gemini. Esto significa que:

- ✅ La aplicación funciona normalmente
- ✅ Usa datos mock (simulados) para los análisis
- ❌ No hace análisis reales con IA

## Solución: Configurar API Key

### Paso 1: Obtener API Key de Gemini

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz click en "Create API Key"
4. Copia la API key generada

### Paso 2: Configurar Variables de Entorno

1. **Copia el archivo de ejemplo:**
   ```bash
   cp env.example .env
   ```

2. **Edita el archivo `.env`:**
   ```env
   # Reemplaza 'your_gemini_api_key_here' con tu API key real
   VITE_API_KEY=tu_api_key_aqui
   
   # Mantén las otras configuraciones
   VITE_MAINTENANCE_MODE=false
   VITE_MAX_REQUESTS_PER_HOUR=10
   VITE_REQUEST_DELAY=3
   ```

3. **Reinicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

### Paso 3: Verificar Configuración

1. Abre la aplicación en el navegador
2. Abre DevTools (F12) → Console
3. Deberías ver:
   - ✅ `"Using real Gemini API"` (en lugar de mock data)
   - ❌ Ya no debería aparecer `"Using mock data - API_KEY not configured"`

## Configuración Adicional (Opcional)

### Límites y Controles
```env
# Límite de requests por hora por usuario
VITE_MAX_REQUESTS_PER_HOUR=10

# Delay entre requests (segundos)
VITE_REQUEST_DELAY=3

# Modo de mantenimiento
VITE_MAINTENANCE_MODE=false
```

### Configuración Avanzada
```env
# Timeout para requests (milisegundos)
VITE_AI_TIMEOUT=30000

# Intentos de reintento
VITE_AI_RETRY_ATTEMPTS=2

# Modo fallback automático
VITE_AI_FALLBACK_MODE=true

# Tamaño máximo de imagen (bytes)
VITE_MAX_IMAGE_SIZE=5242880
```

## Troubleshooting

### Error: "API key not valid"
- Verifica que copiaste la API key correctamente
- Asegúrate de que no hay espacios extra
- Reinicia el servidor después de cambiar el .env

### Error: "Quota exceeded"
- Has alcanzado el límite de requests de Gemini
- Espera hasta el próximo período de facturación
- Considera aumentar los límites en Google Cloud Console

### Error: "Network error"
- Verifica tu conexión a internet
- La API de Gemini podría estar temporalmente fuera de servicio

## Estado Actual

**Sin API Key:** Modo demo con datos simulados
**Con API Key:** Análisis reales con IA de Gemini

## Costos

- Gemini API tiene un tier gratuito generoso
- Para uso personal/desarrollo, generalmente es gratis
- Revisa los precios en [Google AI Pricing](https://ai.google.dev/pricing)

## Seguridad

- ⚠️ **NUNCA** subas el archivo `.env` a Git
- ⚠️ **NUNCA** compartas tu API key públicamente
- ✅ El archivo `.env` ya está en `.gitignore`

