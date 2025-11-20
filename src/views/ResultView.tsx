import React, { useRef } from 'react';
import { FachaResult, StoredFachaResult } from '../types';
import MinimalLoader from '../components/MinimalLoader';
import FachaStats from '../components/FachaStats';
import ShareButton from '../components/ShareButton';
import { getScoreColor, getFachaTier } from '../utils/fachaUtils';
import { CheckCircle2, XCircle, TrophyIcon, RefreshCwIcon } from '../components/Icons';

interface ResultViewProps {
    result: FachaResult | StoredFachaResult | null;
    imageSrc: string | null;
    isFromLeaderboard: boolean;
    isAnalyzing: boolean;
    onBackToLeaderboard: () => void;
    onReset: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({
    result,
    imageSrc,
    isFromLeaderboard,
    isAnalyzing,
    onBackToLeaderboard,
    onReset
}) => {
    const resultContainerRef = useRef<HTMLDivElement>(null);

    if (!result && !isAnalyzing) return null;

    return (
        <div ref={resultContainerRef} className="text-center w-full max-w-6xl mx-auto flex flex-col items-center">
            {/* Image Section - Centered on desktop, full width on mobile */}
            <div className="w-full mb-8">
                <h3 className="text-2xl font-bold mb-4 text-violet-300 text-center">
                    {isFromLeaderboard ? `${(result as StoredFachaResult).name} - Análisis` : 'Tu Foto'}
                </h3>
                <div className="flex justify-center">
                    <img src={imageSrc!} alt={isFromLeaderboard ? `Foto de ${(result as StoredFachaResult).name}` : "Tu foto analizada"} className="rounded-lg border-4 border-violet-500 neon-shadow-purple w-full max-w-md" />
                </div>
                {isFromLeaderboard && (
                    <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-violet-500/30 max-w-md mx-auto">
                        <p className="text-sm text-violet-300">
                            📅 Analizado el {new Date((result as StoredFachaResult).timestamp).toLocaleDateString()}
                        </p>
                    </div>
                )}
            </div>

            {/* Verdict Section - Full width and centered */}
            <div className="w-full flex flex-col items-center">
                <h2 className="text-4xl font-bold mb-8 neon-text-fuchsia">VEREDICTO</h2>

                {/* Score Display - Simple and Clean */}
                <div className="w-full flex flex-col items-center mb-8">
                    {isAnalyzing ? (
                        <MinimalLoader
                            message="Analizando tu facha..."
                            className="py-12"
                        />
                    ) : result && (
                        <div className="flex flex-col items-center">
                            <span
                                className="font-orbitron text-8xl md:text-9xl font-bold transition-all duration-1000"
                                style={{
                                    color: getScoreColor(result.rating),
                                    textShadow: `0 0 20px ${getScoreColor(result.rating)}`
                                }}
                            >
                                {result.rating.toFixed(1)}
                            </span>
                            <p className="text-2xl font-bold text-gray-300 tracking-widest uppercase mt-2">
                                DE FACHA
                            </p>
                            <div className="mt-6 w-full max-w-lg text-center bg-slate-800/60 border-2 rounded-lg p-6"
                                style={{
                                    borderColor: getScoreColor(result.rating),
                                    boxShadow: `0 0 15px ${getScoreColor(result.rating)}40`
                                }}>
                                <p className="text-base uppercase tracking-widest text-violet-300/80 mb-3">
                                    {isFromLeaderboard ? 'Rango de Facha' : 'Tu Rango de Facha'}
                                </p>
                                <p
                                    className="font-orbitron text-2xl font-bold"
                                    style={{ color: getScoreColor(result.rating) }}
                                >
                                    {getFachaTier(result.rating)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {result && (
                    <>
                        <p className="text-lg md:text-xl text-cyan-300 mt-8 p-4 bg-slate-800/50 border border-yellow-500/30 rounded-lg italic w-full">"{result.comment}"</p>
                        <div className="mt-8 w-full flex flex-col md:flex-row gap-6 text-left">
                            <div className="flex-1 bg-slate-800/50 p-4 rounded-lg border border-green-500/30"><h3 className="font-bold text-lg text-green-400 mb-3 flex items-center gap-2"><CheckCircle2 /> {isFromLeaderboard ? 'Puntos fuertes' : 'Tus puntos fuertes'}</h3><ul className="space-y-2 text-green-300/90">{result.fortalezas.map((item, i) => <li key={i} className="flex items-start gap-2"><span className="mt-1">✅</span>{item}</li>)}</ul></div>
                            <div className="flex-1 bg-slate-800/50 p-4 rounded-lg border border-yellow-500/30"><h3 className="font-bold text-lg text-yellow-400 mb-3 flex items-center gap-2"><XCircle /> Para mejorar, pibe</h3><ul className="space-y-2 text-yellow-300/90">{result.consejos.map((item, i) => <li key={i} className="flex items-start gap-2"><span className="mt-1">👉</span>{item}</li>)}</ul></div>
                        </div>
                        <FachaStats rating={result.rating} />
                    </>
                )}

            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
                {isFromLeaderboard ? (
                    <>
                        <button
                            onClick={onBackToLeaderboard}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/80 to-orange-700/80 hover:from-yellow-400/90 hover:to-orange-600/90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-yellow-500/25 border-2 border-yellow-400 border-opacity-60"
                        >
                            <TrophyIcon className="w-4 h-4 text-white" />
                            Volver al Top
                        </button>
                        <button
                            onClick={onReset}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-600/80 to-purple-800/80 hover:from-fuchsia-500/90 hover:to-purple-700/90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-fuchsia-500/25 border-2 border-fuchsia-400 border-opacity-60"
                        >
                            <RefreshCwIcon className="w-4 h-4 text-white" />
                            Nuevo Análisis
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={onReset}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-600/80 to-purple-800/80 hover:from-fuchsia-500/90 hover:to-purple-700/90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-fuchsia-500/25 border-2 border-fuchsia-400 border-opacity-60"
                        >
                            <RefreshCwIcon className="w-4 h-4 text-white" />
                            Otra vez
                        </button>
                        {result && imageSrc && (
                            <ShareButton
                                result={result}
                                imageSrc={imageSrc}
                                className="w-full sm:w-auto"
                            />
                        )}
                    </>
                )}
            </div>

        </div>
    );
};

export default ResultView;
