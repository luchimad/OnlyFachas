import React from 'react';

interface MinimalLoaderProps {
  message?: string;
  className?: string;
}

/**
 * Componente de carga minimalista y elegante
 * Diseño simple con animación suave
 */
const MinimalLoader: React.FC<MinimalLoaderProps> = ({ 
  message = "Analizando...", 
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {/* Mensaje */}
      <div className="text-center">
        <p className="text-violet-300 text-sm font-medium">{message}</p>
        <div className="flex justify-center space-x-1 mt-2">
          <div className="w-1 h-1 bg-violet-400 rounded-full animate-pulse"></div>
          <div className="w-1 h-1 bg-violet-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-1 h-1 bg-violet-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default MinimalLoader;
