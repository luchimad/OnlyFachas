import React from 'react';

interface ShareTemplateProps {
  imageSrc: string;
  score: number;
  fachaTier?: string;
  className?: string;
}

const ShareTemplate: React.FC<ShareTemplateProps> = ({ 
  imageSrc, 
  score, 
  className = '' 
}) => {
  const getScoreColor = (rating: number) => {
    if (rating >= 8.5) return '#10b981'; // verde brillante
    if (rating >= 7.0) return '#3b82f6'; // azul
    if (rating >= 5.5) return '#f59e0b'; // amarillo
    if (rating >= 4.0) return '#f97316'; // naranja
    return '#ef4444'; // rojo
  };

  const scoreColor = getScoreColor(score);

  return (
    <div className={`w-[1080px] h-[1080px] relative overflow-hidden ${className}`}>
      {/* Fondo con patrón de grilla oscuro */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Patrón de grilla sutil */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Logo OnlyFachas en la parte superior */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
        <h1 className="text-6xl font-bold text-fuchsia-400 font-orbitron text-center">
          <span className="drop-shadow-[0_0_20px_rgba(244,114,182,0.8)]">
            OnlyFachas
          </span>
        </h1>
      </div>

      {/* Foto del usuario centrada */}
      <div className="absolute top-32 left-1/2 transform -translate-x-1/2">
        <div className="w-96 h-96 bg-white rounded-2xl p-4 shadow-2xl">
          <img 
            src={imageSrc} 
            alt="Foto del usuario" 
            className="w-full h-full object-contain rounded-xl"
            crossOrigin="anonymous"
            onError={(e) => {
              // Fallback si hay problemas de CORS
              const target = e.target as HTMLImageElement;
              target.removeAttribute('crossorigin');
            }}
          />
        </div>
      </div>

      {/* Panel del puntaje con glassmorphism */}
      <div className="absolute top-96 left-1/2 transform -translate-x-1/2 mt-8">
        <div 
          className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl"
          style={{
            boxShadow: `0 0 30px ${scoreColor}40, inset 0 1px 0 rgba(255,255,255,0.2)`
          }}
        >
          {/* Texto "Veredicto" */}
          <div className="text-center mb-4">
            <span className="text-2xl font-bold text-white font-orbitron">
              Veredicto
            </span>
          </div>

          {/* Puntaje grande */}
          <div className="text-center">
            <span 
              className="text-8xl font-bold font-orbitron"
              style={{ 
                color: scoreColor,
                textShadow: `0 0 30px ${scoreColor}80`
              }}
            >
              {score.toFixed(1)}
            </span>
          </div>

          {/* Texto "de facha" */}
          <div className="text-center mt-2">
            <span className="text-xl font-semibold text-white/90">
              de facha
            </span>
          </div>
        </div>
      </div>

      {/* Rango de facha en la parte inferior */}
      <div className="absolute bottom-8 left-8">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
          <span className="text-lg font-semibold text-violet-300">
            Rango de Facha
          </span>
        </div>
      </div>

      {/* Efectos de neón adicionales */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Líneas de neón en las esquinas */}
        <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-fuchsia-400/50 rounded-tl-lg"></div>
        <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-fuchsia-400/50 rounded-tr-lg"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-fuchsia-400/50 rounded-bl-lg"></div>
        <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-fuchsia-400/50 rounded-br-lg"></div>
      </div>
    </div>
  );
};

export default ShareTemplate;
