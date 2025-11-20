import React from 'react';
import { FiTrendingUp } from 'react-icons/fi';
import { AppState } from '../types';

interface AboutViewProps {
    onReset: () => void;
    setAppState: (state: AppState) => void;
}

const AboutView: React.FC<AboutViewProps> = ({ onReset, setAppState }) => {
    return (
        <div className="w-full max-w-4xl mx-auto text-center">
            <div className="mb-8">
                <div className="text-8xl mb-6">🚀</div>
                <h2 className="text-4xl sm:text-5xl font-bold mb-4 neon-text-fuchsia">
                    Sobre Nosotros
                </h2>
                <p className="text-xl text-violet-300 mb-8">
                    La historia detrás de esta locura
                </p>
            </div>

            <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 border-cyan-500/50 rounded-2xl p-8 mb-8">
                <div className="text-6xl mb-4">💡</div>
                <h3 className="text-2xl font-bold text-cyan-300 mb-4">
                    El Origen
                </h3>
                <p className="text-lg text-violet-300/90 leading-relaxed mb-6">
                    OnlyFachas nació como un experimento medio en broma de un estudiante de ingeniería aeroespacial que quería probar qué tan lejos podía llegar jugando con inteligencia artificial.
                </p>
                <p className="text-lg text-violet-300/90 leading-relaxed mb-6">
                    La idea apareció una noche de estudio entre mates y risas: <span className="text-cyan-400 font-bold">"¿y si hacemos una IA que mida la facha?"</span>.
                </p>
                <p className="text-lg text-violet-300/90 leading-relaxed mb-6">
                    Lo que arrancó como chiste para un par de amigos terminó convirtiéndose en un proyecto que mezcló código, diseño y mucho humor argentino.
                </p>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30 mb-8">
                <h4 className="text-lg font-bold text-violet-200 mb-4">El Despegue</h4>
                <p className="text-violet-300/90 mb-4">
                    Cuando el primer prototipo estuvo listo y se lo mostró a sus amigos, todos se engancharon.
                </p>
                <p className="text-violet-300/90 mb-4">
                    Empezaron a competir por los puntajes, a compartir capturas y a tirar ideas para nuevas funciones.
                </p>
                <p className="text-violet-300/90 mb-4">
                    Ese entusiasmo fue el empujón para darle una vuelta más profesional, abrir el sitio y dejar que cualquiera pueda probar su nivel de facha.
                </p>
            </div>

            <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 border-yellow-500/50 rounded-2xl p-8 mb-8">
                <div className="text-6xl mb-4">⚠️</div>
                <h4 className="text-lg font-bold text-yellow-300 mb-4">Importante</h4>
                <p className="text-lg text-violet-300/90 leading-relaxed mb-4">
                    Es importante aclarar que <span className="text-yellow-400 font-bold">OnlyFachas no es una medida real ni científica de nada</span>.
                </p>
                <p className="text-lg text-violet-300/90 leading-relaxed mb-4">
                    Los puntajes son solo un juego, un análisis de IA pensado para divertirse en juntadas, o para pasar el rato con amigos.
                </p>
                <p className="text-lg text-violet-300/90 leading-relaxed mb-4">
                    La idea es reírse, compartir un momento y no tomarse demasiado en serio la calificación.
                </p>
                <p className="text-lg text-violet-300/90 leading-relaxed mb-4">
                    <span className="text-cyan-400 font-bold">La facha de verdad está en la actitud, no en un número.</span>
                </p>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30 mb-8">
                <h4 className="text-lg font-bold text-violet-200 mb-4">Nuestros Objetivos</h4>
                <p className="text-violet-300/90 mb-4">
                    Hoy OnlyFachas sigue siendo un proyecto independiente, hecho con ganas y mucho humor, pero con objetivos claros:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="bg-slate-700/50 p-4 rounded-lg border border-yellow-500/30">
                        <div className="text-2xl mb-2">🎯</div>
                        <h4 className="font-bold text-cyan-300 mb-2">Experiencia Divertida</h4>
                        <p className="text-sm text-violet-300/80">Ofrecer una experiencia divertida y segura</p>
                    </div>

                    <div className="bg-slate-700/50 p-4 rounded-lg border border-yellow-500/30">
                        <div className="text-2xl mb-2">🔒</div>
                        <h4 className="font-bold text-cyan-300 mb-2">Privacidad Total</h4>
                        <p className="text-sm text-violet-300/80">No guardar fotos ni datos personales</p>
                    </div>

                    <div className="bg-slate-700/50 p-4 rounded-lg border border-yellow-500/30">
                        <div className="text-2xl mb-2">😄</div>
                        <h4 className="font-bold text-cyan-300 mb-2">Humor Criollo</h4>
                        <p className="text-sm text-violet-300/80">Mantener un toque de humor criollo en cada análisis</p>
                    </div>

                    <div className="bg-slate-700/50 p-4 rounded-lg border border-yellow-500/30">
                        <div className="text-2xl mb-2">🎭</div>
                        <h4 className="font-bold text-cyan-300 mb-2">Solo Joda</h4>
                        <p className="text-sm text-violet-300/80">Recordar siempre que esto es solo joda</p>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 border-fuchsia-500/50 rounded-2xl p-8 mb-8">
                <div className="text-6xl mb-4">🤝</div>
                <h4 className="text-lg font-bold text-fuchsia-300 mb-4">Únete a la Comunidad</h4>
                <p className="text-lg text-violet-300/90 leading-relaxed mb-4">
                    Si te divertís usándolo, compartilo con tus amigos y ayudanos a que esta locura siga creciendo.
                </p>
                <p className="text-lg text-violet-300/90 leading-relaxed mb-4">
                    Gracias por ser parte de esta comunidad que sabe que la facha no es solo apariencia: <span className="text-fuchsia-400 font-bold">es actitud y buena onda</span>.
                </p>
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

export default AboutView;
