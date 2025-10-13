# Problemas de Política de AdSense y Soluciones

## Fecha: 2025-01-13

## Problemas Identificados

### 1. ⚠️ CONTENIDO PARA ADULTOS / INAPROPIADO
**Problema:** El contenido de la app tiene lenguaje subido de tono que puede violar las políticas de AdSense.

**Ejemplos encontrados en los prompts:**
- "picante y subido de tono"
- "cara de culo"
- "minitas"
- "detonar" (jerga sexual)
- Comentarios muy provocativos

**Solución:**
- ✅ Suavizar el lenguaje en los prompts de Gemini
- ✅ Mantener el tono argentino pero menos explícito
- ✅ Cambiar términos problemáticos por alternativas más suaves

### 2. ⚠️ ANUNCIOS EN PANTALLAS SIN CONTENIDO SUFICIENTE
**Problema:** Los anuncios pueden estar apareciendo en páginas con poco contenido o durante estados de carga.

**Ubicaciones actuales:**
1. Después de resultados (línea 948) - ✅ OK (hay contenido)
2. En leaderboard (línea 1317) - ⚠️ REVISAR (puede estar vacío)

**Solución:**
- Solo mostrar anuncios cuando hay contenido real
- No mostrar en leaderboard vacío

### 3. ⚠️ FALTA CONTENIDO TEXTUAL ALREDEDOR DE ANUNCIOS
**Problema:** Google requiere contenido sustancial alrededor de los anuncios.

**Solución:**
- Agregar más texto descriptivo
- Agregar secciones de "Cómo funciona", "FAQ", etc.

### 4. ⚠️ POSIBLE PROBLEMA CON VERIFICACIÓN DE EDAD
**Problema:** El contenido puede ser considerado para mayores de 18 años.

**Solución:**
- Ya tienes verificación de edad ✅
- Asegurarse de que sea visible para Google

## Acciones Requeridas

### Prioridad ALTA:
1. **Suavizar el lenguaje de los prompts** - Mantener argentino pero menos explícito
2. **Agregar más contenido textual** - FAQ, cómo funciona, etc.
3. **Condicionar anuncios** - Solo mostrar cuando hay contenido real

### Prioridad MEDIA:
4. Agregar política de privacidad visible
5. Agregar términos y condiciones visibles
6. Mejorar el footer con información del sitio

### Prioridad BAJA:
7. Agregar más páginas de contenido
8. Blog o sección de consejos de estilo

## Checklist de Políticas de AdSense

- [x] Script de AdSense cargado correctamente
- [x] ads.txt configurado
- [x] Etiqueta "Publicidad" visible
- [x] Anuncios responsive
- [ ] Contenido apropiado para todas las edades
- [ ] Suficiente contenido textual
- [ ] Política de privacidad visible
- [ ] Términos y condiciones visibles
- [ ] No anuncios en páginas vacías

## Recomendaciones Inmediatas

### 1. Modificar el lenguaje (URGENTE)
Cambiar en `services/geminiService.ts`:
- "picante y subido de tono" → "divertido y con onda"
- "cara de culo" → "cara seria"
- "minitas" → "gente"
- "detonar" → "impresionar"

### 2. Condicionar anuncios en leaderboard
Solo mostrar si `leaderboard.length > 0`

### 3. Agregar sección de contenido
Agregar una sección "Cómo funciona" o "FAQ" con contenido textual sustancial.

## Recursos
- [Políticas de AdSense](https://support.google.com/adsense/answer/48182)
- [Contenido para adultos](https://support.google.com/adsense/answer/1348688)
- [Contenido de bajo valor](https://support.google.com/adsense/answer/9335567)

