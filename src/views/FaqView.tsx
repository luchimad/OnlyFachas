import React from 'react';
import { AppState } from '../types';

interface FaqViewProps {
    onReset: () => void;
    setAppState: (state: AppState) => void;
}

const FaqView: React.FC<FaqViewProps> = ({ onReset, setAppState }) => {
    return (
        <div className="w-full max-w-4xl mx-auto text-center">
            <div className="mb-8">
                <div className="text-8xl mb-6">❓</div>
                <h2 className="text-4xl sm:text-5xl font-bold mb-4 neon-text-fuchsia">
                    Preguntas Frecuentes
                </h2>
                <p className="text-xl text-violet-300 mb-8">
                    Todo lo que necesitás saber sobre OnlyFachas
                </p>
            </div>

            <div className="space-y-6 text-left">
                {/* ¿Qué es OnlyFachas? */}
                <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 border-cyan-500/50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-cyan-300 mb-3 flex items-center gap-2">
                        <span className="text-2xl">🤖</span>
                        ¿Qué es OnlyFachas?
                    </h3>
                    <p className="text-violet-300/90 leading-relaxed">
                        OnlyFachas es una app web que usa inteligencia artificial para dar un puntaje de "facha" a una foto.
                    </p>
                    <p className="text-violet-300/90 leading-relaxed mt-2">
                        Es un juego para divertirse, no un análisis serio ni una medida real de belleza o estilo.
                    </p>
                </div>

                {/* ¿Las fotos se guardan? */}
                <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30">
                    <h3 className="text-xl font-bold text-violet-200 mb-3 flex items-center gap-2">
                        <span className="text-2xl">🔒</span>
                        ¿Las fotos se guardan en algún lado?
                    </h3>
                    <p className="text-violet-300/90 leading-relaxed">
                        No. Las imágenes se procesan solo para el análisis y después se descartan.
                    </p>
                    <p className="text-violet-300/90 leading-relaxed mt-2">
                        No almacenamos ni compartimos tus fotos con nadie.
                    </p>
                </div>

                {/* ¿Por qué cambia el puntaje? */}
                <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 border-yellow-500/50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-yellow-300 mb-3 flex items-center gap-2">
                        <span className="text-2xl">📊</span>
                        ¿Por qué a veces el puntaje cambia?
                    </h3>
                    <p className="text-violet-300/90 leading-relaxed">
                        La IA analiza cada foto de manera independiente y puede dar resultados distintos según la luz, el encuadre o la expresión.
                    </p>
                    <p className="text-violet-300/90 leading-relaxed mt-2">
                        Recordá que es solo para divertirse, no hay una "medición exacta".
                    </p>
                </div>

                {/* ¿Puedo usarlo desde el celular? */}
                <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30">
                    <h3 className="text-xl font-bold text-violet-200 mb-3 flex items-center gap-2">
                        <span className="text-2xl">📱</span>
                        ¿Puedo usarlo desde el celular?
                    </h3>
                    <p className="text-violet-300/90 leading-relaxed">
                        Sí. El sitio está pensado para funcionar en celulares, tablets y computadoras.
                    </p>
                    <p className="text-violet-300/90 leading-relaxed mt-2">
                        Podés subir una foto o usar la cámara directamente.
                    </p>
                </div>

                {/* ¿Qué pasa si la IA falla? */}
                <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 border-orange-500/50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-orange-300 mb-3 flex items-center gap-2">
                        <span className="text-2xl">⚠️</span>
                        ¿Qué pasa si la IA falla o está saturada?
                    </h3>
                    <p className="text-violet-300/90 leading-relaxed">
                        Si la IA de Google no responde usamos un sistema de respaldo que devuelve resultados de ejemplo para que la experiencia siga siendo divertida.
                    </p>
                </div>

                {/* ¿Necesito crear cuenta? */}
                <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30">
                    <h3 className="text-xl font-bold text-violet-200 mb-3 flex items-center gap-2">
                        <span className="text-2xl">👤</span>
                        ¿Necesito crear una cuenta?
                    </h3>
                    <p className="text-violet-300/90 leading-relaxed">
                        No. No pedimos registro ni datos personales.
                    </p>
                    <p className="text-violet-300/90 leading-relaxed mt-2">
                        Todo el historial de puntajes queda guardado solo en tu dispositivo.
                    </p>
                </div>

                {/* ¿Es gratis? */}
                <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 border-green-500/50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-green-300 mb-3 flex items-center gap-2">
                        <span className="text-2xl">💰</span>
                        ¿Es gratis?
                    </h3>
                    <p className="text-violet-300/90 leading-relaxed">
                        Sí. OnlyFachas es totalmente gratuito.
                    </p>
                    <p className="text-violet-300/90 leading-relaxed mt-2">
                        Hay anuncios de Google AdSense para cubrir costos de hosting, pero no es necesario pagar nada para usarlo.
                    </p>
                </div>

                {/* ¿Puedo compartir resultados? */}
                <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30">
                    <h3 className="text-xl font-bold text-violet-200 mb-3 flex items-center gap-2">
                        <span className="text-2xl">📤</span>
                        ¿Puedo compartir mis resultados?
                    </h3>
                    <p className="text-violet-300/90 leading-relaxed">
                        Claro. Podés descargar tu análisis como imagen y compartirla en redes sociales o en tus grupos de amigos.
                    </p>
                </div>

                {/* ¿Es apto para menores? */}
                <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 border-blue-500/50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-blue-300 mb-3 flex items-center gap-2">
                        <span className="text-2xl">👶</span>
                        ¿Es apto para menores?
                    </h3>
                    <p className="text-violet-300/90 leading-relaxed">
                        El contenido es humorístico y no contiene material inapropiado, pero recomendamos que los menores lo usen con supervisión adulta para entender que es solo un juego.
                    </p>
                </div>

                {/* ¿Puedo sugerir mejoras? */}
                <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30">
                    <h3 className="text-xl font-bold text-violet-200 mb-3 flex items-center gap-2">
                        <span className="text-2xl">💬</span>
                        ¿Puedo sugerir mejoras o reportar un problema?
                    </h3>
                    <p className="text-violet-300/90 leading-relaxed">
                        Sí. Nos encanta recibir feedback.
                    </p>
                    <p className="text-violet-300/90 leading-relaxed mt-2">
                        Podés escribirnos por Instagram en <a href="https://instagram.com/onlyfachas" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline">@onlyfachas</a> o por email a <span className="text-cyan-400">onlyfachasoficial@gmail.com</span>.
                    </p>
                </div>
            </div>

            {/* Mensaje final */}
            <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 border-fuchsia-500/50 rounded-2xl p-8 mt-8">
                <div className="text-6xl mb-4">🎭</div>
                <h4 className="text-lg font-bold text-fuchsia-300 mb-4">Recordá</h4>
                <p className="text-lg text-violet-300/90 leading-relaxed">
                    OnlyFachas es solo para pasar un buen rato.
                </p>
                <p className="text-lg text-violet-300/90 leading-relaxed mt-2">
                    La verdadera facha está en la actitud y en la buena onda, no en un número.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <button
                    onClick={() => {
                        onReset();
                    }}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/80 to-pink-800/80 hover:from-purple-500/90 hover:to-pink-700/90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25 border-2 border-purple-400 border-opacity-60"
                >
                    🏠 Volver al Inicio
                </button>
                <button
                    onClick={() => setAppState('about')}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600/80 to-blue-800/80 hover:from-cyan-500/90 hover:to-blue-700/90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25 border-2 border-cyan-400 border-opacity-60"
                >
                    📖 Sobre Nosotros
                </button>
            </div>
        </div>
    );
};

export default FaqView;
