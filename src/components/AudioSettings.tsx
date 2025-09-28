import React from 'react';
import { FiVolume2, FiVolumeX, FiMusic, FiMic } from 'react-icons/fi';

interface AudioSettingsProps {
  musicEnabled: boolean;
  effectsEnabled: boolean;
  musicVolume: number;
  effectsVolume: number;
  setMusicEnabled: (enabled: boolean) => void;
  setEffectsEnabled: (enabled: boolean) => void;
  setMusicVolume: (volume: number) => void;
  setEffectsVolume: (volume: number) => void;
}

/**
 * Componente para configuración avanzada de audio
 * Permite controlar música y efectos por separado con sliders de volumen
 */
export const AudioSettings: React.FC<AudioSettingsProps> = ({
  musicEnabled,
  effectsEnabled,
  musicVolume,
  effectsVolume,
  setMusicEnabled,
  setEffectsEnabled,
  setMusicVolume,
  setEffectsVolume
}) => {
  return (
    <div className="bg-slate-800/80 border border-violet-500/30 rounded-lg p-4 max-w-md mx-auto">
      <h3 className="text-lg font-bold text-violet-300 mb-4 text-center">
        🎵 Configuración de Audio
      </h3>
      
      <div className="space-y-4">
        {/* Control de Música */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiMusic className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">Música de Fondo</span>
            </div>
            <button
              onClick={() => setMusicEnabled(!musicEnabled)}
              className={`p-1 rounded transition-colors ${
                musicEnabled 
                  ? 'bg-blue-500/20 text-blue-300' 
                  : 'bg-slate-700/50 text-slate-500'
              }`}
            >
              {musicEnabled ? <FiVolume2 className="w-4 h-4" /> : <FiVolumeX className="w-4 h-4" />}
            </button>
          </div>
          
          {musicEnabled && (
            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={musicVolume}
                onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-blue"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${musicVolume * 100}%, #374151 ${musicVolume * 100}%, #374151 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>0%</span>
                <span className="text-blue-300 font-medium">{Math.round(musicVolume * 100)}%</span>
                <span>100%</span>
              </div>
            </div>
          )}
        </div>

        {/* Control de Efectos */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiMic className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-300">Efectos de Voz</span>
            </div>
            <button
              onClick={() => setEffectsEnabled(!effectsEnabled)}
              className={`p-1 rounded transition-colors ${
                effectsEnabled 
                  ? 'bg-green-500/20 text-green-300' 
                  : 'bg-slate-700/50 text-slate-500'
              }`}
            >
              {effectsEnabled ? <FiVolume2 className="w-4 h-4" /> : <FiVolumeX className="w-4 h-4" />}
            </button>
          </div>
          
          {effectsEnabled && (
            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={effectsVolume}
                onChange={(e) => setEffectsVolume(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-green"
                style={{
                  background: `linear-gradient(to right, #10b981 0%, #10b981 ${effectsVolume * 100}%, #374151 ${effectsVolume * 100}%, #374151 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>0%</span>
                <span className="text-green-300 font-medium">{Math.round(effectsVolume * 100)}%</span>
                <span>100%</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-slate-700/50">
        <p className="text-xs text-slate-400 text-center">
          💡 Los controles se guardan automáticamente
        </p>
      </div>
    </div>
  );
};

