import React from 'react';
import { ConstructionIcon, ClockIcon } from './Icons';

interface WorkInProgressProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  estimatedTime?: string;
  onBack?: () => void;
}

const WorkInProgress: React.FC<WorkInProgressProps> = ({ 
  title, 
  description, 
  icon = <ConstructionIcon />,
  estimatedTime,
  onBack
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <div className="bg-slate-900/80 backdrop-blur-sm border-2 border-yellow-500/50 rounded-2xl p-8 neon-shadow-yellow">
        {/* Icono animado */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="text-6xl animate-pulse text-yellow-400">
              {icon}
            </div>
            <div className="absolute -top-2 -right-2 text-2xl animate-bounce">
              ⚡
            </div>
          </div>
        </div>

        {/* Título */}
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-yellow-300">
          {title}
        </h2>

        {/* Descripción */}
        <p className="text-lg text-violet-300 mb-6 leading-relaxed">
          {description}
        </p>

        {/* Badge de Work in Progress */}
        <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/50 rounded-full px-4 py-2 mb-6">
          <ClockIcon className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-semibold text-yellow-300 uppercase tracking-wider">
            Work in Progress
          </span>
        </div>

        {/* Tiempo estimado si se proporciona */}
        {estimatedTime && (
          <div className="bg-slate-800/50 border border-violet-500/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-violet-400/80 mb-1">Tiempo estimado de lanzamiento:</p>
            <p className="font-orbitron text-lg font-bold text-cyan-400">
              {estimatedTime}
            </p>
          </div>
        )}

        {/* Efectos visuales */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/10 to-transparent animate-pulse"></div>
          <div className="relative text-sm text-violet-400/60 italic">
            "La facha perfecta se está cocinando..."
          </div>
        </div>

        {/* Botón Volver */}
        {onBack && (
          <div className="mt-8">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition-colors duration-300 hover:scale-105"
            >
              Volver al Menú
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkInProgress;
