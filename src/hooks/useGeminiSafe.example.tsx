import React, { useRef } from 'react';
import { useGeminiSafe } from './useGeminiSafe';

/**
 * Ejemplo de uso del hook useGeminiSafe
 * Este componente muestra cómo implementar el hook en una aplicación React
 */
const GeminiSafeExample: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Configuración del hook con rate limit de 15 segundos
  const { data, error, isFallback, isLoading, analyzeImage } = useGeminiSafe({
    rateLimitSeconds: 15, // 15 segundos entre requests
    // apiKey se toma automáticamente de import.meta.env.VITE_API_KEY
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await analyzeImage(file);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-white">
        Ejemplo de useGeminiSafe
      </h2>
      
      {/* Input de archivo */}
      <div className="mb-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isLoading}
          className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-500 file:text-white hover:file:bg-violet-600 disabled:opacity-50"
        />
      </div>

      {/* Estado de carga */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
          <p className="mt-2 text-violet-300">Analizando imagen...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-4">
          <p className="text-red-300 font-semibold">Error:</p>
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Indicador de fallback */}
      {isFallback && (
        <div className="bg-yellow-900/50 border border-yellow-500 rounded-lg p-4 mb-4">
          <p className="text-yellow-300 font-semibold">⚠️ Modo Fallback</p>
          <p className="text-yellow-200">
            La API no está disponible, mostrando datos de ejemplo.
          </p>
        </div>
      )}

      {/* Resultados */}
      {data && (
        <div className="bg-slate-800/50 border border-violet-500 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">
            Resultado del Análisis
          </h3>
          
          {/* Puntaje */}
          <div className="mb-4">
            <p className="text-sm text-violet-300 mb-1">Puntaje de Facha:</p>
            <div className="text-4xl font-bold text-fuchsia-400">
              {data.puntaje}/10
            </div>
          </div>

          {/* Comentarios */}
          <div className="mb-4">
            <p className="text-sm text-violet-300 mb-2">Comentarios:</p>
            <ul className="space-y-1">
              {data.comentarios.map((comentario, index) => (
                <li key={index} className="text-violet-200 text-sm">
                  • {comentario}
                </li>
              ))}
            </ul>
          </div>

          {/* Fortalezas */}
          <div className="mb-4">
            <p className="text-sm text-green-300 mb-2">Fortalezas:</p>
            <ul className="space-y-1">
              {data.fortalezas.map((fortaleza, index) => (
                <li key={index} className="text-green-200 text-sm">
                  ✅ {fortaleza}
                </li>
              ))}
            </ul>
          </div>

          {/* Consejos */}
          <div>
            <p className="text-sm text-yellow-300 mb-2">Consejos:</p>
            <ul className="space-y-1">
              {data.consejos.map((consejo, index) => (
                <li key={index} className="text-yellow-200 text-sm">
                  💡 {consejo}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Botón para limpiar */}
      {data && (
        <button
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
            // Resetear el estado del hook se haría desde el componente padre
          }}
          className="mt-4 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
        >
          Probar con otra imagen
        </button>
      )}
    </div>
  );
};

export default GeminiSafeExample;
