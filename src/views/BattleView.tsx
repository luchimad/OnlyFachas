import React from 'react';
import { FachaBattleResult, AppState } from '../types';
import { CameraIcon, UploadIcon, ZapIcon } from '../components/Icons';
import { getScoreColor } from '../utils/fachaUtils';

interface BattleSelectViewProps {
    imageSrc1: string | null;
    imageSrc2: string | null;
    imageData1: any;
    imageData2: any;
    setActiveBattleSlot: (slot: 1 | 2) => void;
    setAppState: (state: AppState) => void;
    fileInputRef1: React.RefObject<HTMLInputElement>;
    fileInputRef2: React.RefObject<HTMLInputElement>;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, slot: 1 | 2) => void;
    onAnalyze: () => void;
    onReset: () => void;
}

export const BattleSelectView: React.FC<BattleSelectViewProps> = ({
    imageSrc1,
    imageSrc2,
    imageData1,
    imageData2,
    setActiveBattleSlot,
    setAppState,
    fileInputRef1,
    fileInputRef2,
    onImageUpload,
    onAnalyze,
    onReset
}) => {
    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center battle-container">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 neon-text-fuchsia">Facha vs Facha</h2>
            <p className="text-violet-300 mb-8 text-center text-lg max-w-2xl">
                La batalla más épica de la historia. Subí dos fotos y que la IA decida quién la rompe más.
                <span className="text-cyan-400 font-bold"> ¡Spoiler: va a estar re picante!</span>
            </p>

            {/* Aviso informativo */}
            <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 border border-yellow-500/30 rounded-lg p-4 mb-6 max-w-lg mx-auto">
                <div className="flex items-center justify-center gap-2 text-sm text-center">
                    <span className="text-yellow-400">⚠️</span>
                    <span className="text-yellow-300">Al continuar confirmo que tengo 18 años o más y que no subiré contenido inapropiado. OnlyFachas es una aplicación de entretenimiento: las imágenes se procesan automáticamente y no se almacenan.</span>
                </div>
            </div>

            <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12 mb-8">
                {/* Contendiente 1 */}
                <div className="w-full lg:w-1/3 flex flex-col items-center">
                    <div className="w-full h-80 battle-image-container bg-slate-800/50 border-2 border-dashed border-violet-500/50 rounded-xl flex items-center justify-center overflow-hidden relative group hover:border-fuchsia-500/70 transition-all duration-300">
                        {imageSrc1 ? (
                            <div className="relative w-full h-full">
                                <img src={imageSrc1} alt="Contendiente 1" className="w-full h-full object-cover rounded-lg" />
                                <div className="absolute top-2 left-2 bg-fuchsia-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                                    Contendiente 1
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="text-6xl mb-4">🥊</div>
                                <span className="text-violet-400 text-lg font-bold">Contendiente 1</span>
                                <p className="text-violet-300/60 text-sm mt-2">Subí una foto o usa la cámara</p>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={() => { setActiveBattleSlot(1); setAppState('capture'); }}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600/80 to-blue-800/80 hover:from-cyan-500/90 hover:to-blue-700/90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25 border-2 border-cyan-400 border-opacity-60"
                        >
                            <CameraIcon className="w-4 h-4 text-white" />
                            Cámara
                        </button>
                        <button
                            onClick={() => fileInputRef1.current?.click()}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/80 to-pink-800/80 hover:from-purple-500/90 hover:to-pink-700/90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25 border-2 border-purple-400 border-opacity-60"
                        >
                            <UploadIcon className="w-4 h-4 text-white" />
                            Subir
                        </button>
                    </div>
                </div>

                {/* VS Divider */}
                <div className="flex flex-col items-center gap-4">
                    <div className="font-orbitron text-4xl sm:text-5xl lg:text-6xl text-fuchsia-500 animate-pulse battle-vs-text">
                        VS
                    </div>
                    <div className="text-2xl">⚔️</div>
                    <div className="text-violet-300 text-sm text-center max-w-32">
                        La batalla más épica
                    </div>
                </div>

                {/* Contendiente 2 */}
                <div className="w-full lg:w-1/3 flex flex-col items-center">
                    <div className="w-full h-80 battle-image-container bg-slate-800/50 border-2 border-dashed border-violet-500/50 rounded-xl flex items-center justify-center overflow-hidden relative group hover:border-fuchsia-500/70 transition-all duration-300">
                        {imageSrc2 ? (
                            <div className="relative w-full h-full">
                                <img src={imageSrc2} alt="Contendiente 2" className="w-full h-full object-cover rounded-lg" />
                                <div className="absolute top-2 left-2 bg-fuchsia-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                                    Contendiente 2
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="text-6xl mb-4">🥊</div>
                                <span className="text-violet-400 text-lg font-bold">Contendiente 2</span>
                                <p className="text-violet-300/60 text-sm mt-2">Subí una foto o usa la cámara</p>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={() => { setActiveBattleSlot(2); setAppState('capture'); }}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600/80 to-blue-800/80 hover:from-cyan-500/90 hover:to-blue-700/90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25 border-2 border-cyan-400 border-opacity-60"
                        >
                            <CameraIcon className="w-4 h-4 text-white" />
                            Cámara
                        </button>
                        <button
                            onClick={() => fileInputRef2.current?.click()}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/80 to-pink-800/80 hover:from-purple-500/90 hover:to-pink-700/90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25 border-2 border-purple-400 border-opacity-60"
                        >
                            <UploadIcon className="w-4 h-4 text-white" />
                            Subir
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center gap-4">
                <button
                    onClick={onAnalyze}
                    disabled={!imageData1 || !imageData2}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600/80 to-red-950/80 hover:from-red-500/90 hover:to-red-900/90 disabled:from-gray-500/80 disabled:to-gray-700/80 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-red-500/25 border-2 border-red-400 border-opacity-60 text-xl"
                >
                    <ZapIcon className="w-5 h-5 text-white" />
                    🔥 INICIAR BATALLA 🔥
                </button>


                {(!imageData1 || !imageData2) && (
                    <p className="text-violet-300/60 text-sm text-center">
                        {!imageData1 && !imageData2 ? 'Subí las dos fotos para comenzar la batalla' :
                            !imageData1 ? 'Falta la foto del Contendiente 1' : 'Falta la foto del Contendiente 2'}
                    </p>
                )}

                <button onClick={onReset} className="mt-4 text-sm text-violet-400 hover:text-white transition-colors">
                    ← Volver al Menú Principal
                </button>
            </div>

            <input type="file" ref={fileInputRef1} onChange={(e) => onImageUpload(e, 1)} accept="image/*" className="hidden" />
            <input type="file" ref={fileInputRef2} onChange={(e) => onImageUpload(e, 2)} accept="image/*" className="hidden" />
        </div>
    );
};

interface BattleResultViewProps {
    battleResult: FachaBattleResult | null;
    imageSrc1: string | null;
    imageSrc2: string | null;
    onReset: () => void;
}

export const BattleResultView: React.FC<BattleResultViewProps> = ({
    battleResult,
    imageSrc1,
    imageSrc2,
    onReset
}) => {
    if (!battleResult) return null;

    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center text-center battle-container">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8 neon-text-fuchsia">🏆 VEREDICTO FINAL 🏆</h2>

            {/* Battle Results */}
            <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-8 mb-12">
                {[1, 2].map(slot => {
                    const isWinner = battleResult.winner === slot;
                    const imageSrc = slot === 1 ? imageSrc1 : imageSrc2;
                    const score = slot === 1 ? battleResult.score1 : battleResult.score2;
                    const scoreColor = getScoreColor(score);

                    return (
                        <div key={slot} className={`relative w-full lg:w-1/3 flex flex-col items-center transition-all duration-700 ${isWinner ? 'scale-105' : 'scale-100'}`}>
                            {/* Winner Crown */}
                            {isWinner && (
                                <div className="absolute -top-4 z-20 text-6xl animate-bounce">
                                    👑
                                </div>
                            )}

                            {/* Image Container */}
                            <div className={`relative border-4 rounded-2xl overflow-hidden transition-all duration-500 ${isWinner
                                ? 'border-yellow-400 shadow-[0_0_30px_theme(colors.yellow.400)]'
                                : 'border-violet-500'
                                }`}>
                                <img src={imageSrc!} alt={`Contendiente ${slot}`} className="w-full h-80 battle-result-image object-cover" />

                                {/* Score Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                    <div className="text-center">
                                        <span
                                            className={`font-orbitron font-bold text-4xl battle-score ${isWinner ? 'text-yellow-300' : 'text-white'}`}
                                            style={{
                                                textShadow: isWinner ? '0 0 15px #facc15' : '0 0 8px #000',
                                                color: isWinner ? '#facc15' : scoreColor
                                            }}
                                        >
                                            {score.toFixed(1)}
                                        </span>
                                        <p className="text-sm text-gray-300 mt-1">DE FACHA</p>
                                    </div>
                                </div>

                                {/* Winner Badge */}
                                {isWinner && (
                                    <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded-full font-bold text-sm animate-pulse">
                                        🥇 GANADOR
                                    </div>
                                )}
                            </div>

                            {/* Player Info */}
                            <div className="mt-6 text-center">
                                <p className={`text-2xl font-bold ${isWinner ? 'text-yellow-300' : 'text-violet-300'}`}>
                                    {isWinner ? '🏆 CAMPEÓN 🏆' : `Contendiente ${slot}`}
                                </p>
                                {isWinner && (
                                    <p className="text-yellow-400 text-lg mt-2 animate-pulse">
                                        ¡La rompió toda!
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Battle Comment */}
            <div className="w-full max-w-4xl mb-8">
                <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 border-cyan-500/50 rounded-2xl p-6 backdrop-blur-sm battle-comment">
                    <div className="text-4xl mb-4">💬</div>
                    <p className="text-xl md:text-2xl text-cyan-300 italic leading-relaxed">
                        "{battleResult.comment}"
                    </p>
                    <div className="text-cyan-400/60 text-sm mt-4">
                        - La IA después de ver esta batalla épica
                    </div>
                </div>
            </div>

            {/* Winner Explanation */}
            {battleResult.winnerExplanation && battleResult.winnerExplanation.length > 0 && (
                <div className="w-full max-w-4xl mb-8">
                    <div className="bg-gradient-to-r from-yellow-800/60 to-orange-800/60 border-2 border-yellow-500/50 rounded-2xl p-6 backdrop-blur-sm">
                        <div className="text-4xl mb-4">🔥</div>
                        <h3 className="text-2xl md:text-3xl font-bold text-yellow-300 mb-6">
                            ¿Por qué la Persona {battleResult.winner} detona más?
                        </h3>
                        <div className="space-y-4">
                            {battleResult.winnerExplanation.map((explanation, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <p className="text-lg text-yellow-200 leading-relaxed">
                                        {explanation}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={onReset}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-600/80 to-purple-800/80 hover:from-fuchsia-500/90 hover:to-purple-700/90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-fuchsia-500/25 border-2 border-fuchsia-400 border-opacity-60 mt-8"
            >
                <UploadIcon className="w-4 h-4 text-white" />
                Nueva Batalla
            </button>
        </div>
    );
};
