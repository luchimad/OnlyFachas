import React from 'react';
import { Volume2Icon, VolumeXIcon } from './Icons';

interface SoundToggleButtonProps {
  isEnabled: boolean;
  onToggle: () => void;
  className?: string;
}

/**
 * Botón para toggle de sonidos con iconos animados
 */
const SoundToggleButton: React.FC<SoundToggleButtonProps> = ({ 
  isEnabled, 
  onToggle, 
  className = '' 
}) => {
  return (
    <button
      onClick={onToggle}
      className={`
        relative p-3 rounded-lg border-2 transition-all duration-300 ease-out
        ${isEnabled 
          ? 'border-violet-500/50 bg-violet-500/20 text-violet-300 hover:border-violet-400 hover:bg-violet-500/30' 
          : 'border-slate-600/50 bg-slate-800/50 text-slate-400 hover:border-slate-500 hover:bg-slate-700/50'
        }
        hover:scale-105 active:scale-95
        ${className}
      `}
      title={isEnabled ? 'Desactivar sonidos' : 'Activar sonidos'}
    >
      <div className="relative">
        {isEnabled ? (
          <Volume2Icon className="w-5 h-5 transition-all duration-300" />
        ) : (
          <VolumeXIcon className="w-5 h-5 transition-all duration-300" />
        )}
        
        {/* Ripple effect */}
        <div className={`
          absolute inset-0 rounded-lg transition-all duration-300
          ${isEnabled ? 'bg-violet-400/20' : 'bg-slate-400/20'}
        `}></div>
      </div>
      
      {/* Status indicator */}
      <div className={`
        absolute -top-1 -right-1 w-3 h-3 rounded-full transition-all duration-300
        ${isEnabled ? 'bg-green-400 shadow-green-400/50' : 'bg-slate-500'}
        ${isEnabled ? 'shadow-lg' : ''}
      `}></div>
    </button>
  );
};

export default SoundToggleButton;
