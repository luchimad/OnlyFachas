import React from 'react';
import { ZapIcon, SettingsIcon, CameraIcon } from '../components/Icons';
import { RiSwordLine } from 'react-icons/ri';
import { FiTrendingUp, FiCoffee } from 'react-icons/fi';
import { AiOutlineFire } from 'react-icons/ai';
import { HiOutlineEmojiHappy } from 'react-icons/hi';
import { TbMessageQuestion } from 'react-icons/tb';
import AdBanner from '../components/AdBanner';
import { AppMode, AppState } from '../types';

interface WelcomeViewProps {
    setAppMode: (mode: AppMode) => void;
    setAppState: (state: AppState) => void;
    setShowSettings: (show: boolean) => void;
}

const WelcomeView: React.FC<WelcomeViewProps> = ({ setAppMode, setAppState, setShowSettings }) => {
    return (
        <div className="text-center flex flex-col items-center">
            {/* Botones de arriba - principales */}
            <div className="flex flex-col items-center gap-4 w-full max-w-md">
                <button
                    onClick={() => { setAppMode('single'); setAppState('select'); }}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-700/80 to-purple-900/80 hover:from-fuchsia-600/90 hover:to-purple-800/90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-fuchsia-500/25 border-2 border-fuchsia-400 border-opacity-60 w-full justify-center text-base sm:text-lg"
                >
                    <ZapIcon className="w-4 h-4 text-white" />
                    Analizame la facha
                </button>

                <button
                    onClick={() => { setAppMode('battle'); setAppState('battleSelect'); }}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600/80 to-red-950/80 hover:from-red-500/90 hover:to-red-900/90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-red-500/25 border-2 border-red-400 border-opacity-60 w-full justify-center text-base sm:text-lg"
                >
                    <RiSwordLine className="w-4 h-4 text-white" />
                    Facha vs Facha
                </button>
            </div>

            {/* Botones de abajo - Secundarios */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md mt-6">
                <button
                    onClick={() => setAppState('leaderboard')}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/80 to-orange-700/80 hover:from-yellow-400/90 hover:to-orange-600/90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-yellow-500/25 border-2 border-yellow-400 border-opacity-60 w-full justify-center text-base sm:text-lg"
                >
                    <FiTrendingUp className="w-4 h-4 text-white" />
                    Top Fachas
                </button>
            </div>

            {/* Anuncio en página principal */}
            <AdBanner
                slot="7301683867"
                size="medium"
                className="mt-8 mb-4"
            />

            <button
                onClick={() => setShowSettings(true)}
                className="mt-6 text-sm text-violet-400 hover:text-white flex items-center gap-2"
            >
                <SettingsIcon className="w-4 h-4" /> Configurar IA
            </button>

            {/* Descripción de la app */}
            <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 border border-violet-500/30 rounded-lg p-6 mt-6 max-w-2xl mx-auto">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <AiOutlineFire className="w-6 h-6 text-violet-400" />
                        <h3 className="text-xl font-bold neon-text-violet">¿Qué es OnlyFachas?</h3>
                    </div>

                    <div className="space-y-4">
                        <p className="text-violet-300/90 leading-relaxed">
                            OnlyFachas es una aplicación web que usa inteligencia artificial para analizar tu estilo y darte un puntaje de "facha" del 1 al 10.
                        </p>
                        <p className="text-violet-300/90 leading-relaxed">
                            Es un juego para divertirse entre amigos, no un análisis serio ni una medida real de belleza o atractivo.
                            La idea surgió de querer crear algo diferente en el mundo de las apps de entretenimiento.
                        </p>
                        <p className="text-violet-300/90 leading-relaxed">
                            Nuestro algoritmo analiza elementos como la composición de la foto, el estilo de vestimenta, la actitud que transmite la imagen,
                            y otros factores visuales para generar un puntaje objetivo y comentarios divertidos.
                        </p>
                        <p className="text-violet-300/90 leading-relaxed">
                            <span className="text-cyan-400 font-bold">La verdadera facha está en la actitud, no en un número.</span>
                            Solo usá esto como una excusa para pasar un buen rato con tus amigos.
                        </p>
                    </div>
                </div>
            </div>

            {/* Tutorial de uso */}
            <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 border border-cyan-500/30 rounded-lg p-6 mt-6 max-w-3xl mx-auto">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <CameraIcon className="w-6 h-6 text-cyan-400" />
                        <h3 className="text-xl font-bold neon-text-cyan">¿Cómo Funciona?</h3>
                    </div>

                    <p className="text-violet-300/90 leading-relaxed mb-6">
                        Conseguir tu análisis de facha es una boludez. No te pedimos registro, ni datos, ni nada.
                        El proceso es súper simple y está diseñado para que cualquiera pueda usarlo sin complicaciones.
                    </p>

                    <div className="space-y-6 text-left">
                        {/* Paso 1 */}
                        <div className="bg-slate-700/50 p-4 rounded-lg border border-fuchsia-500/30">
                            <div className="flex items-start gap-3">
                                <div className="bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
                                <div>
                                    <h4 className="text-lg font-bold text-fuchsia-300 mb-2">Subí tu Foto (o Sacate una al Toque)</h4>
                                    <p className="text-violet-300/90 leading-relaxed">
                                        Elegí tu mejor ángulo, esa foto que decís "acá la rompí". Puede ser de la galería o usando la cámara de tu celu.
                                        <span className="text-cyan-400 font-bold"> Tranqui, tu foto se borra al instante, no guardamos absolutamente nada.</span>
                                        La app funciona con cualquier tipo de imagen, desde selfies casuales hasta fotos más elaboradas.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Paso 2 */}
                        <div className="bg-slate-700/50 p-4 rounded-lg border border-yellow-500/30">
                            <div className="flex items-start gap-3">
                                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
                                <div>
                                    <h4 className="text-lg font-bold text-yellow-300 mb-2">La IA Hace su Magia</h4>
                                    <p className="text-violet-300/90 leading-relaxed">
                                        Nuestro algoritmo se pone a laburar. En cuestión de segundos, analiza cientos de puntos de la imagen para calcular un puntaje objetivo.
                                        <span className="text-yellow-400 font-bold"> Es pura matemática y cero corazón, así que preparate.</span>
                                        El sistema evalúa aspectos técnicos como iluminación, composición, y elementos visuales que contribuyen a la percepción general.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Paso 3 */}
                        <div className="bg-slate-700/50 p-4 rounded-lg border border-green-500/30">
                            <div className="flex items-start gap-3">
                                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
                                <div>
                                    <h4 className="text-lg font-bold text-green-300 mb-2">¡Listo! Recibí tu Puntaje y los Tips</h4>
                                    <p className="text-violet-300/90 leading-relaxed">
                                        Vas a ver tu puntaje del 1 al 10, un comentario general sin filtro y algunos tips para que la próxima vez rompas la escala.
                                        <span className="text-green-400 font-bold"> ¡Ahora te toca a vos compartirlo y presumir (o llorar)!</span>
                                        Los resultados incluyen tanto el puntaje numérico como comentarios personalizados que pueden ser desde constructivos hasta completamente en joda.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Descripción de modos */}
            <div className="mt-6 max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 border border-violet-500/30 rounded-lg p-6">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <ZapIcon className="w-6 h-6 text-violet-400" />
                        <h4 className="text-lg font-bold neon-text-violet">Modos de Juego</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Análisis Común */}
                        <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 border-fuchsia-500/50 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <CameraIcon className="w-5 h-5 text-fuchsia-400" />
                                <h5 className="text-lg font-bold text-fuchsia-300">Análisis de Facha</h5>
                            </div>
                            <p className="text-violet-300/90 leading-relaxed text-sm mb-3">
                                Subí una foto y obtené tu puntaje personal de facha del 1 al 10.
                                La IA te va a dar comentarios en joda, fortalezas y consejos para mejorar tu estilo.
                                Este modo es ideal para cuando querés saber qué onda tu look actual o simplemente pasar el rato.
                            </p>
                            <p className="text-violet-300/90 leading-relaxed text-sm mb-3">
                                <span className="text-fuchsia-400 font-bold">Perfecto para:</span> Autoconocimiento, comparar con amigos, o simplemente pasar el rato.
                                También es genial para cuando estás probando un look nuevo y querés una segunda opinión (aunque sea de una IA).
                            </p>
                            <p className="text-violet-300/90 leading-relaxed text-sm">
                                <span className="text-fuchsia-400 font-bold">Características:</span> Análisis detallado, tips personalizados, comentarios únicos para cada foto.
                                El algoritmo considera múltiples factores visuales para darte un resultado lo más objetivo posible.
                            </p>
                        </div>

                        {/* Facha vs Facha */}
                        <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 border-red-500/50 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <RiSwordLine className="w-5 h-5 text-red-400" />
                                <h5 className="text-lg font-bold text-red-300">Facha vs Facha</h5>
                            </div>
                            <p className="text-violet-300/90 leading-relaxed text-sm mb-3">
                                La batalla más épica. Subí dos fotos y que la IA decida quién la rompe más.
                                Comentarios en joda, explicaciones del ganador y mucha diversión.
                                Perfecto para resolver debates eternos entre amigos o simplemente ver quién tiene más onda.
                            </p>
                            <p className="text-violet-300/90 leading-relaxed text-sm mb-3">
                                <span className="text-red-400 font-bold">Perfecto para:</span> Competir con amigos, resolver debates, o ver quién tiene más onda.
                                También es ideal para cuando tenés dos fotos que te gustan y no sabés cuál usar en tus redes.
                            </p>
                            <p className="text-violet-300/90 leading-relaxed text-sm">
                                <span className="text-red-400 font-bold">Características:</span> Comparación directa, explicación del ganador, comentarios épicos para ambos.
                                La IA analiza ambas imágenes simultáneamente y te explica por qué una supera a la otra.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mini FAQ */}
            <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 border border-green-500/30 rounded-lg p-6 mt-6 max-w-3xl mx-auto">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <TbMessageQuestion className="w-6 h-6 text-green-400" />
                        <h3 className="text-xl font-bold neon-text-green">Preguntas Frecuentes</h3>
                    </div>

                    <div className="space-y-4 text-left">
                        {/* Pregunta 1 */}
                        <div className="bg-slate-700/50 p-4 rounded-lg border border-green-500/30">
                            <h4 className="text-lg font-bold text-green-300 mb-2">¿Tengo que pagar?</h4>
                            <p className="text-violet-300/90 leading-relaxed text-sm">
                                <span className="text-green-400 font-bold">¡Para nada!</span> OnlyFachas es completamente gratis.
                                No te pedimos tarjeta, ni suscripción, ni nada. Solo subí tu foto y listo.
                            </p>
                        </div>

                        {/* Pregunta 2 */}
                        <div className="bg-slate-700/50 p-4 rounded-lg border border-green-500/30">
                            <h4 className="text-lg font-bold text-green-300 mb-2">¿Posta guardan mis fotos?</h4>
                            <p className="text-violet-300/90 leading-relaxed text-sm">
                                <span className="text-green-400 font-bold">¡NO!</span> Tus fotos se procesan al instante y se borran automáticamente.
                                No las guardamos en ningún servidor, base de datos, ni lugar. Es 100% seguro.
                            </p>
                        </div>

                        {/* Pregunta 3 */}
                        <div className="bg-slate-700/50 p-4 rounded-lg border border-green-500/30">
                            <h4 className="text-lg font-bold text-green-300 mb-2">¿El puntaje es posta?</h4>
                            <p className="text-violet-300/90 leading-relaxed text-sm">
                                <span className="text-green-400 font-bold">Es un juego!</span> Los puntajes son solo para divertirse entre amigos.
                                No es una medida real de belleza ni atractivo. La verdadera facha está en la actitud.
                            </p>
                        </div>

                        {/* Pregunta 4 */}
                        <div className="bg-slate-700/50 p-4 rounded-lg border border-green-500/30">
                            <h4 className="text-lg font-bold text-green-300 mb-2">¿Necesito registrarme?</h4>
                            <p className="text-violet-300/90 leading-relaxed text-sm">
                                <span className="text-green-400 font-bold">¡No!</span> No necesitás cuenta, email, ni datos personales.
                                Solo entrá, subí tu foto y disfrutá. Es así de simple.
                            </p>
                        </div>

                        {/* Pregunta 5 */}
                        <div className="bg-slate-700/50 p-4 rounded-lg border border-green-500/30">
                            <h4 className="text-lg font-bold text-green-300 mb-2">¿Qué tipos de fotos funcionan mejor?</h4>
                            <p className="text-violet-300/90 leading-relaxed text-sm">
                                <span className="text-green-400 font-bold">Cualquier foto!</span> La IA puede analizar desde selfies casuales hasta fotos más elaboradas.
                                Solo asegurate de que se vea bien tu cara y estilo. Evitá fotos muy oscuras o borrosas para mejores resultados.
                            </p>
                        </div>

                        {/* Pregunta 6 */}
                        <div className="bg-slate-700/50 p-4 rounded-lg border border-green-500/30">
                            <h4 className="text-lg font-bold text-green-300 mb-2">¿Los resultados son siempre diferentes?</h4>
                            <p className="text-violet-300/90 leading-relaxed text-sm">
                                <span className="text-green-400 font-bold">¡Exacto!</span> Cada análisis es único. Incluso si subís la misma foto dos veces,
                                es probable que obtengas comentarios diferentes. Esto hace que cada experiencia sea fresca y divertida.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sección de donaciones */}
            <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 border border-yellow-500/30 rounded-lg p-6 mt-6 max-w-2xl mx-auto">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <HiOutlineEmojiHappy className="w-6 h-6 text-yellow-400" />
                        <h3 className="text-xl font-bold neon-text-yellow">¿Te Copó la App? ¡Bancá el Proyecto!</h3>
                    </div>

                    <p className="text-violet-300/90 leading-relaxed mb-6">
                        Mantener OnlyFachas online, rápido y sin anuncios molestos tiene sus costos (la IA nos cobra en dólares 😥).
                        Si te sacamos una sonrisa, podés invitarnos un cafecito para que la joda siga siendo gratis para todos.
                        Cada donación nos ayuda a mantener el servidor funcionando y mejorar la experiencia para todos los usuarios.
                    </p>

                    <a
                        href="https://cafecito.app/onlyfachas"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-slate-500/25 border border-slate-600"
                    >
                        <FiCoffee className="w-4 h-4 text-white" />
                        Invitanos un Cafecito
                    </a>
                </div>
            </div>
        </div>
    );
};

export default WelcomeView;
