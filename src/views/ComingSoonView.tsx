import React from 'react';
import { FiTrendingUp } from 'react-icons/fi';
import { AppState } from '../types';

interface ComingSoonViewProps {
    onReset: () => void;
    setAppState: (state: AppState) => void;
}

const ComingSoonView: React.FC<ComingSoonViewProps> = ({ onReset, setAppState }) => {
    return (
        <div className="w-full max-w-4xl mx-auto text-center">
            <div className="mb-8">
                <div className="text-8xl mb-6">🚀</div>
                <h2 className="text-4xl sm:text-5xl font-bold mb-4 neon-text-fuchsia">
                    ¡Próximamente!
                </h2>
                <p className="text-xl text-violet-300 mb-8">
                    Estamos cocinando algo épico para vos
                </p>
            </div>

            <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 border-cyan-500/50 rounded-2xl p-8 mb-8">
                <div className="text-6xl mb-4">✨</div>
                <h3 className="text-2xl font-bold text-cyan-300 mb-4">
                    Aumentá tu Facha
                </h3>
                <p className="text-lg text-violet-300/90 leading-relaxed mb-6">
                    Estamos trabajando en una funcionalidad épica que va a transformar tu foto en una versión
                    <span className="text-cyan-400 font-bold"> GigaChad</span>.
                    La IA está aprendiendo a ser más zarpada que nunca.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                    <div className="bg-slate-700/50 p-4 rounded-lg border border-yellow-500/30">
                        <div className="text-2xl mb-2">🎨</div>
                        <h4 className="font-bold text-cyan-300 mb-2">Transformación Total</h4>
                        <p className="text-sm text-violet-300/80">Tu foto se convierte en una obra de arte de la facha</p>
                    </div>

                    <div className="bg-slate-700/50 p-4 rounded-lg border border-yellow-500/30">
                        <div className="text-2xl mb-2">🤖</div>
                        <h4 className="font-bold text-cyan-300 mb-2">IA Avanzada</h4>
                        <p className="text-sm text-violet-300/80">Algoritmos de última generación para resultados épicos</p>
                    </div>

                    <div className="bg-slate-700/50 p-4 rounded-lg border border-yellow-500/30">
                        <div className="text-2xl mb-2">🔥</div>
                        <h4 className="font-bold text-cyan-300 mb-2">Resultados Zarpados</h4>
                        <p className="text-sm text-violet-300/80">Prepárate para quedar detonado con el resultado</p>
                    </div>
                </div>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30 mb-8">
                <h4 className="text-lg font-bold text-violet-200 mb-4">¿Cuándo estará listo?</h4>
                <p className="text-violet-300/90 mb-4">
                    Estamos trabajando a full para traerte esta funcionalidad lo antes posible.
                    Mientras tanto, disfrutá del análisis de facha y las batallas épicas.
                </p>
                <div className="flex items-center justify-center gap-2 text-cyan-400">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    <span className="ml-2 text-sm">En desarrollo...</span>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                    onClick={() => {
                        onReset();
                    }}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/80 to-pink-800/80 hover:from-purple-500/90 hover:to-pink-700/90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25 border-2 border-purple-400 border-opacity-60"
                >
                    🏠 Volver al Inicio
                </button>
                <button
                    onClick={() => setAppState('leaderboard')}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/80 to-orange-700/80 hover:from-yellow-400/90 hover:to-orange-600/90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-yellow-500/25 border-2 border-yellow-400 border-opacity-60"
                >
                    <FiTrendingUp className="w-4 h-4 text-white" />
                    Ver Top Fachas
                </button>
            </div>
        </div>
    );
};

export default ComingSoonView;
