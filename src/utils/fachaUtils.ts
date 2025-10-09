/**
 * Utilidades para el análisis de facha
 * Funciones centralizadas para evitar duplicación de código
 */

export const getScoreColor = (s: number): string => {
  if (s <= 3) return '#f97316'; // orange-500
  if (s <= 6) return '#84cc16'; // lime-500
  return '#d946ef'; // fuchsia-500
};

export const getFachaTier = (s: number): string => {
  const tiers: { [key: string]: string[] } = {
    needsWork: ["Necesitás un cambio de look", "Urgente al peluquero", "El placar te pide ayuda"],
    average: ["Estás en el promedio", "Metele un poco más de onda", "Zafás, pero hasta ahí"],
    approved: ["Aprobado, pero con lo justo", "Tenés tu mística", "Vas por buen camino"],
    good: ["Tenés tu onda, se nota", "Fachero, la verdad", "Titular indiscutido"],
    god: ["Fachero Nivel Dios", "Nivel Leyenda", "Estás para re detonar"],
    legend: ["Rompiste el Fachómetro", "La reencarnación de la facha", "El verdadero King"]
  };

  let selectedTier: string[];
  if (s <= 3) selectedTier = tiers.needsWork;
  else if (s <= 5) selectedTier = tiers.average;
  else if (s < 7) selectedTier = tiers.approved;
  else if (s < 8.5) selectedTier = tiers.good;
  else if (s < 10) selectedTier = tiers.god;
  else selectedTier = tiers.legend;

  const hash = Math.floor(s * 1000) % selectedTier.length;
  return selectedTier[hash];
};

export const escapeXml = (unsafe: string): string => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};
