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




