import React from 'react';
import { SunIcon, MoonIcon } from './Icons';

interface ThemeToggleButtonProps {
  isDark: boolean;
  onToggle: () => void;
  className?: string;
}

/**
 * Botón para toggle de tema dark/light con animación suave
 */
const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({ 
  isDark, 
  onToggle, 
  className = '' 
}) => {
  return (
    <button
      onClick={onToggle}
      className={`
        relative p-3 rounded-lg border-2 transition-all duration-500 ease-out
        ${isDark 
          ? 'border-violet-500/50 bg-violet-500/20 text-violet-300 hover:border-violet-400 hover:bg-violet-500/30' 
          : 'border-yellow-500/50 bg-yellow-500/20 text-yellow-300 hover:border-yellow-400 hover:bg-yellow-500/30'
        }
        hover:scale-105 active:scale-95
        ${className}
      `}
      title={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
    >
      <div className="relative overflow-hidden">
        {/* Icon container with smooth transition */}
        <div className={`
          transition-all duration-500 ease-out
          ${isDark ? 'transform rotate-0' : 'transform rotate-180'}
        `}>
          {isDark ? (
            <MoonIcon className="w-5 h-5 transition-all duration-300" />
          ) : (
            <SunIcon className="w-5 h-5 transition-all duration-300" />
          )}
        </div>
        
        {/* Background glow effect */}
        <div className={`
          absolute inset-0 rounded-lg transition-all duration-500
          ${isDark ? 'bg-violet-400/10' : 'bg-yellow-400/10'}
        `}></div>
      </div>
      
      {/* Theme indicator */}
      <div className={`
        absolute -top-1 -right-1 w-3 h-3 rounded-full transition-all duration-500
        ${isDark ? 'bg-violet-400 shadow-violet-400/50' : 'bg-yellow-400 shadow-yellow-400/50'}
        shadow-lg
      `}></div>
    </button>
  );
};

export default ThemeToggleButton;
