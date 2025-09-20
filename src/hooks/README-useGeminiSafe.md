# useGeminiSafe Hook

Un hook personalizado de React + TypeScript que proporciona una capa de seguridad para las requests a la API de Gemini, incluyendo rate limiting y fallback automático.

## 🚀 Características

- **Rate Limiting**: Limita las requests a 1 cada X segundos (configurable)
- **Fallback Seguro**: Devuelve datos mock cuando la API falla
- **Tipado Fuerte**: Interfaces TypeScript completas
- **Manejo de Errores**: Gestión robusta de errores de API
- **Persistencia**: Usa localStorage para mantener el rate limiting

## 📦 Instalación

El hook está listo para usar en proyectos React 18 + Vite + TypeScript.

## 🔧 Uso Básico

```tsx
import { useGeminiSafe } from './hooks/useGeminiSafe';

const MyComponent = () => {
  const { data, error, isFallback, isLoading, analyzeImage } = useGeminiSafe();

  const handleFileUpload = async (file: File) => {
    await analyzeImage(file);
  };

  return (
    <div>
      {isLoading && <p>Analizando...</p>}
      {error && <p>Error: {error}</p>}
      {isFallback && <p>⚠️ Usando datos de ejemplo</p>}
      {data && (
        <div>
          <h3>Puntaje: {data.puntaje}/10</h3>
          <p>Comentarios: {data.comentarios.join(', ')}</p>
        </div>
      )}
    </div>
  );
};
```

## ⚙️ Configuración Avanzada

```tsx
const { data, error, isFallback, isLoading, analyzeImage } = useGeminiSafe({
  rateLimitSeconds: 15, // 15 segundos entre requests
  apiKey: 'tu-api-key' // Opcional, por defecto usa VITE_API_KEY
});
```

## 📋 API

### Parámetros de Configuración

```typescript
interface UseGeminiSafeConfig {
  rateLimitSeconds?: number; // Default: 10
  apiKey?: string; // Default: import.meta.env.VITE_API_KEY
}
```

### Valor de Retorno

```typescript
interface UseGeminiSafeReturn {
  data: GeminiAnalysisResult | null;
  error: string | null;
  isFallback: boolean;
  isLoading: boolean;
  analyzeImage: (file: File) => Promise<void>;
}
```

### Estructura de Datos

```typescript
interface GeminiAnalysisResult {
  puntaje: number; // 1-10
  comentarios: string[]; // 3 comentarios en lunfardo argentino
  fortalezas: string[]; // 3 fortalezas
  consejos: string[]; // 3 consejos de mejora
}
```

## 🛡️ Rate Limiting

- **Por defecto**: 1 request cada 10 segundos
- **Configurable**: Cambia `rateLimitSeconds` en la configuración
- **Persistente**: Se mantiene entre sesiones del navegador
- **Error específico**: Devuelve "RATE_LIMIT" con tiempo restante

## 🔄 Fallback Automático

Cuando la API falla (timeout, 4xx/5xx, quota exceeded):

- **Datos mock**: Puntaje aleatorio entre 6-9
- **Comentarios**: Array de comentarios en lunfardo argentino
- **Fortalezas/Consejos**: Arrays de sugerencias genéricas
- **Warning en consola**: Log del motivo del fallback
- **Flag isFallback**: `true` para mostrar indicador en UI

## 🎯 Casos de Uso

### Análisis de Imágenes con IA
```tsx
const { analyzeImage, data, isFallback } = useGeminiSafe();

const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    await analyzeImage(file);
  }
};
```

### Con Configuración Personalizada
```tsx
const { analyzeImage } = useGeminiSafe({
  rateLimitSeconds: 30, // 30 segundos entre requests
  apiKey: process.env.REACT_APP_GEMINI_KEY
});
```

### Manejo de Estados
```tsx
const { data, error, isFallback, isLoading } = useGeminiSafe();

if (isLoading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
if (isFallback) return <FallbackWarning />;
if (data) return <Results data={data} />;
```

## 🔧 Variables de Entorno

Asegúrate de tener configurada tu API key de Gemini:

```env
VITE_API_KEY=tu_api_key_de_google_gemini
```

## 🚨 Manejo de Errores

El hook maneja automáticamente:

- **Rate Limiting**: Error "RATE_LIMIT" con tiempo restante
- **API Errors**: 4xx/5xx responses
- **Quota Exceeded**: Error 429
- **Network Issues**: Timeouts y errores de conexión
- **Invalid Responses**: Respuestas malformadas de la API

## 📝 Notas Importantes

- **localStorage**: Requerido para el rate limiting
- **File API**: Requerido para el manejo de archivos
- **Fetch API**: Usado para las requests HTTP
- **Base64**: Las imágenes se convierten automáticamente
- **MIME Types**: Se detectan automáticamente del archivo

## 🎨 Ejemplo Completo

Ver `useGeminiSafe.example.tsx` para un ejemplo completo de implementación con UI.

## 🤝 Contribuir

Este hook es parte del proyecto OnlyFachas. Para contribuir:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Implementa tus cambios
4. Abre un Pull Request

---

**Desarrollado con ❤️ para OnlyFachas**
