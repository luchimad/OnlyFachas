import React from 'react';
import { AudioSettings } from '../components/AudioSettings';
import { AiMode } from '../types';

interface SettingsViewProps {
    musicEnabled: boolean;
    effectsEnabled: boolean;
    musicVolume: number;
    effectsVolume: number;
    setMusicEnabled: (enabled: boolean) => void;
    setEffectsEnabled: (enabled: boolean) => void;
    setMusicVolume: (volume: number) => void;
    setEffectsVolume: (volume: number) => void;
    aiMode: AiMode;
    setAiMode: (mode: AiMode) => void;
    setShowSettings: (show: boolean) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({
    musicEnabled,
    effectsEnabled,
    musicVolume,
    effectsVolume,
    setMusicEnabled,
    setEffectsEnabled,
    setMusicVolume,
    setEffectsVolume,
    aiMode,
    setAiMode,
    setShowSettings,
}) => {
    return (
        <div className="w-full max-w-md mx-auto text-center space-y-8">
            {/* Configuración de Audio */}
            <AudioSettings
                musicEnabled={musicEnabled}
                effectsEnabled={effectsEnabled}
                musicVolume={musicVolume}
                effectsVolume={effectsVolume}
                setMusicEnabled={setMusicEnabled}
                setEffectsEnabled={setEffectsEnabled}
                setMusicVolume={setMusicVolume}
                setEffectsVolume={setEffectsVolume}
            />

            {/* Configuración de IA */}
            <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 neon-text-fuchsia">Modelo de IA</h2>
                <p className="text-violet-300 mb-8">Elegí qué tan zarpada querés que sea la IA.</p>
                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => setAiMode('rapido')}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${aiMode === 'rapido' ? 'border-fuchsia-500 bg-fuchsia-500/10 neon-shadow-fuchsia' : 'border-violet-500/30 bg-slate-800/50 hover:bg-violet-500/10'}`}
                    >
                        <h3 className="font-bold text-lg text-white">Rápido y Furioso</h3>
                        <p className="text-sm text-violet-300">Respuestas al toque. Ideal para ansiosos.</p>
                    </button>
                    <button
                        onClick={() => setAiMode('creativo')}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${aiMode === 'creativo' ? 'border-fuchsia-500 bg-fuchsia-500/10 neon-shadow-fuchsia' : 'border-violet-500/30 bg-slate-800/50 hover:bg-violet-500/10'}`}
                    >
                        <h3 className="font-bold text-lg text-white">Modo Creativo</h3>
                        <p className="text-sm text-violet-300">Análisis más zarpado y original. Puede tardar un toque más.</p>
                    </button>
                </div>
            </div>

            <button
                onClick={() => setShowSettings(false)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-600/80 to-gray-800/80 hover:from-gray-500/90 hover:to-gray-700/90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-gray-500/25 border-2 border-gray-400 border-opacity-60 mt-8"
            >
                Volver
            </button>
        </div>
    );
};

export default SettingsView;
