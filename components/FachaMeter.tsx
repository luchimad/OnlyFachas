import React, { useEffect, useState } from 'react';

// Componente para generar las chispas
const Sparks: React.FC = () => {
  const SPARK_COUNT = 10;
  const sparks = Array.from({ length: SPARK_COUNT });

  return (
    <div className="absolute inset-0 w-full h-full">
      {sparks.map((_, i) => {
        const style = {
          '--spark-angle': `${(360 / SPARK_COUNT) * i}deg`,
          '--spark-delay': `${Math.random() * 0.3}s`,
        } as React.CSSProperties;

        return <div key={i} className="spark" style={style} />;
      })}
    </div>
  );
};

interface FachaMeterProps {
  score: number;
}

const getFachaTier = (s: number): string => {
    const tiers: { [key: string]: string[] } = {
        needsWork: ["Necesitás un cambio de look", "Urgente al peluquero", "El placar te pide ayuda"],
        average: ["Estás en el promedio", "Metele un poco más de onda", "Zafás, pero hasta ahí"],
        approved: ["Aprobado, pero con lo justo", "Tenés tu mística", "Vas por buen camino"],
        good: ["Tenés tu onda, se nota", "Fachero, la verdad", "Titular indiscutido"],
        god: ["Fachero Nivel Dios", "Nivel Leyenda", "Estás detonado mal"],
        legend: ["Rompiste el Fachómetro", "La reencarnación de la facha", "El verdadero King"]
    };

    let selectedTier: string[];
    if (s <= 3) selectedTier = tiers.needsWork;
    else if (s <= 5) selectedTier = tiers.average;
    else if (s < 7) selectedTier = tiers.approved;
    else if (s < 8.5) selectedTier = tiers.good;
    else if (s < 10) selectedTier = tiers.god;
    else selectedTier = tiers.legend;

    // Usar un hash del score para que siempre devuelva el mismo resultado
    const hash = Math.floor(s * 1000) % selectedTier.length;
    return selectedTier[hash];
};


const FachaMeter: React.FC<FachaMeterProps> = ({ score }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    // Validar que el score sea un número válido
    if (typeof score !== 'number' || isNaN(score) || score < 0) {
      console.error('Invalid score received:', score);
      return;
    }

    setAnimationComplete(false);
    setAnimatedScore(0); // Resetear a 0 antes de animar
    
    let animationFrameId: number;
    const startTime = Date.now();
    const duration = 2000; // Aumentar duración para mejor efecto

    const animate = () => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Easing más suave
      const easedProgress = 1 - Math.pow(1 - progress, 4);
      const currentScore = easedProgress * score;
      
      setAnimatedScore(currentScore);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setAnimatedScore(score);
        setAnimationComplete(true);
      }
    };

    // Pequeño delay para que se vea el reset
    setTimeout(() => {
      animationFrameId = requestAnimationFrame(animate);
    }, 100);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [score]);

  const normalizedScore = Math.max(0, Math.min(10, animatedScore));
  const percentage = Math.max(0, Math.min(100, (normalizedScore / 10) * 100));
  
  const showSparks = animationComplete && score >= 7;
  
  // Asegurar que siempre haya un mínimo visible
  const minPercentage = Math.max(2, percentage);

  const getMeterGradient = (s: number) => {
    if (s <= 3) return 'from-red-500 to-orange-500';
    if (s <= 6) return 'from-yellow-400 to-lime-500';
    return 'from-cyan-400 to-fuchsia-500';
  };
  
  const getTextColor = (s: number) => {
    if (s <= 3) return '#f97316'; // orange-500
    if (s <= 6) return '#84cc16'; // lime-500
    return '#d946ef'; // fuchsia-500
  }
  
  const meterGradient = getMeterGradient(score); // Usar score final para color consistente
  const textColor = getTextColor(score);
  
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full">
        {/* Puntaje y Tier */}
        <div className="relative text-center mb-4 md:mb-0">
          {showSparks && <Sparks />}
          <span 
              className="font-orbitron text-7xl md:text-8xl font-bold transition-all duration-300" 
              style={{ color: textColor, textShadow: `0 0 8px ${textColor}, 0 0 16px ${textColor}` }}
          >
            {normalizedScore.toFixed(1)}
          </span>
          <p className="font-bold text-gray-300 tracking-widest uppercase">DE FACHA</p>
        </div>

        {/* Medidor Vertical */}
        <div className="flex flex-col items-center space-y-2">
          <span 
            className={`text-3xl transition-transform duration-500 ${showSparks ? 'scale-150 animate-pulse' : 'scale-100'}`} 
            role="img" 
            aria-label="Fuego"
          >
            🔥
          </span>
          <div className="relative w-12 h-64 bg-slate-800/50 rounded-full overflow-hidden border-2 border-violet-500/30 neon-shadow-purple">
              <div 
                  className={`absolute bottom-0 left-0 w-full bg-gradient-to-t ${meterGradient} transition-all duration-1000 ease-out`}
                  style={{ 
                    height: `${minPercentage}%`,
                    minHeight: '4px' // Mínimo visible
                  }}
              ></div>
              {/* Indicador de nivel actual */}
              <div 
                className="absolute left-0 w-full h-1 bg-white/30 rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  bottom: `${minPercentage}%`,
                  transform: 'translateY(50%)'
                }}
              ></div>
          </div>
          <span className="text-3xl" role="img" aria-label="Calavera">💀</span>
        </div>
      </div>
      
      {/* Apartado Especial para el Rango */}
      <div className={`mt-8 w-full max-w-md text-center bg-slate-800/60 border-2 rounded-lg p-4 transition-all duration-700 ease-out ${animationComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
           style={{ borderColor: textColor, boxShadow: `0 0 15px ${textColor}`}}>
          <p className="text-sm uppercase tracking-widest text-violet-300/80 mb-1">Tu Rango de Facha</p>
          <p 
            className="font-orbitron text-3xl font-bold transition-all duration-300" 
            style={{ color: textColor }}
          >
            {animationComplete ? getFachaTier(score) : '...'}
          </p>
      </div>
    </div>
  );
};

export default FachaMeter;