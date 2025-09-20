# 🚨 Controles de Emergencia - OnlyFachas

Este documento explica cómo usar las variables de entorno para controlar la aplicación en casos de emergencia y evitar sobrecarga del servidor.

## 📋 Variables Disponibles

### 1. **VITE_MAINTENANCE_MODE**
- **Descripción**: Activa el modo de mantenimiento
- **Valores**: `true` | `false`
- **Por defecto**: `false`
- **Efecto**: Cuando está en `true`, muestra un banner de mantenimiento y bloquea toda la funcionalidad

### 2. **VITE_MAX_REQUESTS_PER_HOUR**
- **Descripción**: Límite máximo de análisis por hora por IP
- **Valores**: Número entero (ej: `10`, `20`, `50`)
- **Por defecto**: `10`
- **Efecto**: Controla cuántos análisis puede hacer un usuario en una hora

### 3. **VITE_REQUEST_DELAY**
- **Descripción**: Delay entre requests en segundos
- **Valores**: Número entero (ej: `3`, `5`, `10`)
- **Por defecto**: `3`
- **Efecto**: Tiempo de espera entre cada análisis para evitar sobrecarga

## 🛠️ Configuración en Netlify

### Método 1: Variables de Entorno (Requiere Redeploy)
1. Ve a tu dashboard de Netlify
2. Selecciona tu sitio `onlyfachas-web`
3. Ve a **Site settings** → **Environment variables**
4. Agrega las variables y haz **Redeploy**

### Método 2: Archivo de Configuración (Cambios Inmediatos) ⭐ **RECOMENDADO**
1. Ve a **Deploys** → **Deploy settings** → **Build hooks**
2. Crea un build hook para actualizar solo el archivo de configuración
3. O edita directamente el archivo `public/emergency-config.json`:

```json
{
  "maintenanceMode": true,
  "maxRequestsPerHour": 5,
  "requestDelay": 10,
  "lastUpdated": "2025-01-19T12:00:00.000Z"
}
```

### Método 3: Script Automático
Usa el script incluido para actualizar la configuración:

```bash
# Activar modo mantenimiento
node scripts/update-emergency-config.js --maintenance=true

# Configurar delay de 10 segundos
node scripts/update-emergency-config.js --delay=10

# Limitar a 3 requests por hora
node scripts/update-emergency-config.js --max-requests=3

# Combinar configuraciones
node scripts/update-emergency-config.js --maintenance=false --delay=5 --max-requests=8
```

## 🚨 Casos de Uso de Emergencia

### Sobrecarga del Servidor
```bash
VITE_MAINTENANCE_MODE=true
VITE_REQUEST_DELAY=10
VITE_MAX_REQUESTS_PER_HOUR=5
```

### Problemas con la IA
```bash
VITE_MAINTENANCE_MODE=false
VITE_REQUEST_DELAY=5
VITE_MAX_REQUESTS_PER_HOUR=3
```

### Funcionamiento Normal
```bash
VITE_MAINTENANCE_MODE=false
VITE_REQUEST_DELAY=3
VITE_MAX_REQUESTS_PER_HOUR=10
```

### Alto Tráfico (Modo Restrictivo)
```bash
VITE_MAINTENANCE_MODE=false
VITE_REQUEST_DELAY=8
VITE_MAX_REQUESTS_PER_HOUR=5
```

## 🎯 Cómo Funciona

### Modo Mantenimiento
- Muestra un banner rojo con mensaje de mantenimiento
- Bloquea todas las funcionalidades
- Los usuarios no pueden hacer análisis

### Rate Limiting
- Cuenta los requests por IP en localStorage
- Muestra un banner naranja cuando se alcanza el límite
- Se resetea automáticamente cada hora

### Request Delay
- Muestra un banner amarillo durante el delay
- Aplica el tiempo de espera antes de cada análisis
- Ayuda a distribuir la carga del servidor

## 📊 Monitoreo

### Verificar Estado Actual
1. Abre las herramientas de desarrollador (F12)
2. Ve a **Application** → **Local Storage**
3. Busca `onlyfachas_requests` para ver el historial de requests

### Logs de Netlify
- Ve a **Functions** → **Logs** para ver el uso de la API
- Monitorea los errores y timeouts

## 🔧 Troubleshooting

### La app no responde a los cambios
- Verifica que las variables empiecen con `VITE_`
- Haz un redeploy completo del sitio
- Limpia la caché del navegador

### El rate limiting no funciona
- Verifica que `VITE_MAX_REQUESTS_PER_HOUR` esté configurado
- Los datos se guardan en localStorage del usuario

### El delay no se aplica
- Verifica que `VITE_REQUEST_DELAY` esté en segundos
- El delay solo se aplica si es mayor a 0

## 📈 Recomendaciones

### Para Sitios con Alto Tráfico
- Usa `VITE_MAX_REQUESTS_PER_HOUR=5-10`
- Configura `VITE_REQUEST_DELAY=5-8`
- Monitorea los logs regularmente

### Para Sitios con Tráfico Normal
- Usa `VITE_MAX_REQUESTS_PER_HOUR=10-20`
- Configura `VITE_REQUEST_DELAY=3-5`
- Ajusta según sea necesario

### En Casos de Emergencia
- Activa `VITE_MAINTENANCE_MODE=true` inmediatamente
- Reduce `VITE_MAX_REQUESTS_PER_HOUR` a 1-3
- Aumenta `VITE_REQUEST_DELAY` a 10-15

---

**Nota**: Estos controles están diseñados para ser activados rápidamente desde Netlify sin necesidad de cambios en el código.
