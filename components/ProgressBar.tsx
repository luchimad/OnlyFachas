import React, { useEffect, useState } from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
  duration?: number; // Duración total en ms
  showPercentage?: boolean;
  animated?: boolean;
  className?: string;
}

/**
 * Componente de barra de progreso con animación suave
 * Soporta diferentes estilos y animaciones
 */
const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  duration = 2000, 
  showPercentage = true, 
  animated = true,
  className = '' 
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!animated) {
      setAnimatedProgress(progress);
      return;
    }

    setIsAnimating(true);
    const startTime = Date.now();
    const startProgress = animatedProgress;
    const progressDiff = progress - startProgress;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easedProgress = 1 - Math.pow(1 - progressRatio, 3);
      const currentProgress = startProgress + (progressDiff * easedProgress);
      
      setAnimatedProgress(currentProgress);

      if (progressRatio < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimatedProgress(progress);
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [progress, duration, animated]);

  const clampedProgress = Math.max(0, Math.min(100, animatedProgress));

  return (
    <div className={`w-full ${className}`}>
      {/* Progress bar container */}
      <div className="relative w-full h-3 bg-slate-800/50 rounded-full overflow-hidden border border-slate-600/30">
        {/* Progress fill */}
        <div 
          className={`h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 transition-all duration-300 ease-out ${
            isAnimating ? 'animate-pulse' : ''
          }`}
          style={{ 
            width: `${clampedProgress}%`,
            background: `linear-gradient(90deg, 
              #8b5cf6 0%, 
              #d946ef ${clampedProgress * 0.3}%, 
              #06b6d4 ${clampedProgress * 0.7}%, 
              #8b5cf6 100%)`
          }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
        </div>
        
        {/* Glow effect */}
        <div 
          className="absolute top-0 h-full bg-gradient-to-r from-violet-400/50 to-fuchsia-400/50 blur-sm transition-all duration-300"
          style={{ width: `${clampedProgress}%` }}
        ></div>
      </div>

      {/* Percentage display */}
      {showPercentage && (
        <div className="flex justify-between items-center mt-2 text-sm">
          <span className="text-slate-400">Progreso</span>
          <span className="text-violet-300 font-mono font-bold">
            {Math.round(clampedProgress)}%
          </span>
        </div>
      )}

      {/* Status text */}
      <div className="mt-1 text-center">
        <span className="text-xs text-slate-500">
          {clampedProgress < 25 && "Iniciando análisis..."}
          {clampedProgress >= 25 && clampedProgress < 50 && "Procesando imagen..."}
          {clampedProgress >= 50 && clampedProgress < 75 && "Analizando facha..."}
          {clampedProgress >= 75 && clampedProgress < 100 && "Generando resultado..."}
          {clampedProgress >= 100 && "¡Completado!"}
        </span>
      </div>
    </div>
  );
};

export default ProgressBar;
