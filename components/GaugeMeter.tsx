import React, { useEffect, useState } from 'react';

interface GaugeMeterProps {
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

  const hash = Math.floor(s * 1000) % selectedTier.length;
  return selectedTier[hash];
};

const getGaugeColor = (score: number) => {
  if (score <= 3) return {
    primary: '#ef4444', // red-500
    secondary: '#f97316', // orange-500
    glow: '#ef4444'
  };
  if (score <= 6) return {
    primary: '#eab308', // yellow-500
    secondary: '#84cc16', // lime-500
    glow: '#eab308'
  };
  return {
    primary: '#06b6d4', // cyan-500
    secondary: '#d946ef', // fuchsia-500
    glow: '#06b6d4'
  };
};

const GaugeMeter: React.FC<GaugeMeterProps> = ({ score }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    if (typeof score !== 'number' || isNaN(score) || score < 0) {
      console.error('Invalid score received:', score);
      return;
    }

    setAnimationComplete(false);
    setAnimatedScore(0);
    
    let animationFrameId: number;
    const startTime = Date.now();
    const duration = 2500; // Animación más larga para el gauge

    const animate = () => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Easing suave con bounce al final
      const easedProgress = progress < 0.8 
        ? 1 - Math.pow(1 - progress, 3)
        : 1 - Math.pow(1 - progress, 2) + Math.sin((progress - 0.8) * 5 * Math.PI) * 0.1;
      
      const currentScore = easedProgress * score;
      setAnimatedScore(currentScore);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setAnimatedScore(score);
        setAnimationComplete(true);
      }
    };

    setTimeout(() => {
      animationFrameId = requestAnimationFrame(animate);
    }, 200);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [score]);

  const normalizedScore = Math.max(0, Math.min(10, animatedScore));
  const percentage = (normalizedScore / 10) * 100;
  const colors = getGaugeColor(score);
  
  // Ángulo del gauge (de -135° a 135°)
  const angle = -135 + (percentage / 100) * 270;
  const radians = (angle * Math.PI) / 180;

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="relative w-80 h-80 flex items-center justify-center">
        {/* Gauge Background */}
        <div className="absolute inset-0">
          <svg width="320" height="320" viewBox="0 0 320 320" className="w-full h-full">
            {/* Background Arc */}
            <path
              d="M 160 40 A 120 120 0 0 1 40 160 A 120 120 0 0 1 160 280 A 120 120 0 0 1 280 160 A 120 120 0 0 1 160 40"
              fill="none"
              stroke="rgba(148, 163, 184, 0.2)"
              strokeWidth="8"
              strokeLinecap="round"
            />
            
            {/* Animated Progress Arc */}
            <path
              d="M 160 40 A 120 120 0 0 1 40 160 A 120 120 0 0 1 160 280 A 120 120 0 0 1 280 160 A 120 120 0 0 1 160 40"
              fill="none"
              stroke={`url(#gaugeGradient-${Math.floor(score)})`}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray="565.48"
              strokeDashoffset={565.48 - (565.48 * percentage) / 100}
              className="transition-all duration-2000 ease-out"
              style={{
                filter: `drop-shadow(0 0 8px ${colors.glow}) drop-shadow(0 0 16px ${colors.glow})`,
              }}
            />
            
            {/* Gradient Definition */}
            <defs>
              <linearGradient id={`gaugeGradient-${Math.floor(score)}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={colors.primary} />
                <stop offset="50%" stopColor={colors.secondary} />
                <stop offset="100%" stopColor={colors.primary} />
              </linearGradient>
            </defs>
            
            {/* Center Circle */}
            <circle
              cx="160"
              cy="160"
              r="8"
              fill={colors.primary}
              className="transition-all duration-1000"
              style={{
                filter: `drop-shadow(0 0 4px ${colors.glow})`,
              }}
            />
            
            {/* Needle */}
            <line
              x1="160"
              y1="160"
              x2={160 + 100 * Math.cos(radians)}
              y2={160 + 100 * Math.sin(radians)}
              stroke={colors.primary}
              strokeWidth="4"
              strokeLinecap="round"
              className="transition-all duration-2000 ease-out"
              style={{
                filter: `drop-shadow(0 0 4px ${colors.glow})`,
              }}
            />
            
            {/* Needle Tip */}
            <circle
              cx={160 + 100 * Math.cos(radians)}
              cy={160 + 100 * Math.sin(radians)}
              r="4"
              fill={colors.primary}
              className="transition-all duration-2000 ease-out"
              style={{
                filter: `drop-shadow(0 0 6px ${colors.glow})`,
              }}
            />
          </svg>
        </div>

        {/* Score Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center">
            <span 
              className="font-orbitron text-6xl font-bold transition-all duration-1000"
              style={{ 
                color: colors.primary,
                textShadow: `0 0 10px ${colors.glow}, 0 0 20px ${colors.glow}`,
                transform: animationComplete ? 'scale(1.1)' : 'scale(1)'
              }}
            >
              {normalizedScore.toFixed(1)}
            </span>
            <p 
              className="font-bold text-gray-300 tracking-widest uppercase text-sm mt-2"
              style={{ color: colors.secondary }}
            >
              DE FACHA
            </p>
          </div>
        </div>

        {/* Glow Effect */}
        <div 
          className="absolute inset-0 rounded-full opacity-30 blur-xl transition-all duration-1000"
          style={{
            background: `radial-gradient(circle, ${colors.glow}20 0%, transparent 70%)`,
            transform: animationComplete ? 'scale(1.2)' : 'scale(1)'
          }}
        />
      </div>

      {/* Tier Display */}
      <div 
        className={`mt-8 w-full max-w-md text-center bg-slate-800/60 border-2 rounded-lg p-6 transition-all duration-1000 ease-out ${
          animationComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{ 
          borderColor: colors.primary, 
          boxShadow: `0 0 20px ${colors.glow}40, inset 0 0 20px ${colors.glow}20` 
        }}
      >
        <p className="text-sm uppercase tracking-widest text-violet-300/80 mb-2">
          Tu Rango de Facha
        </p>
        <p 
          className="font-orbitron text-2xl font-bold transition-all duration-500"
          style={{ color: colors.primary }}
        >
          {animationComplete ? getFachaTier(score) : '...'}
        </p>
      </div>

      {/* Decorative Elements */}
      <div className="mt-6 flex items-center space-x-4">
        <span 
          className={`text-3xl transition-all duration-1000 ${
            animationComplete && score >= 7 ? 'animate-pulse scale-110' : 'scale-100'
          }`}
          role="img" 
          aria-label="Fuego"
        >
          🔥
        </span>
        <span 
          className={`text-2xl transition-all duration-1000 ${
            animationComplete && score >= 8 ? 'animate-bounce' : ''
          }`}
          role="img" 
          aria-label="Estrella"
        >
          ⭐
        </span>
        <span 
          className={`text-3xl transition-all duration-1000 ${
            animationComplete && score >= 9 ? 'animate-pulse scale-110' : 'scale-100'
          }`}
          role="img" 
          aria-label="Calavera"
        >
          💀
        </span>
      </div>
    </div>
  );
};

export default GaugeMeter;
