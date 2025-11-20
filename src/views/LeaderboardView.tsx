import React from 'react';
import { StoredFachaResult } from '../types';
import { TrophyIcon, Trash2Icon } from '../components/Icons';
import { getScoreColor } from '../utils/fachaUtils';

interface LeaderboardViewProps {
    leaderboard: StoredFachaResult[];
    handleLeaderboardResultClick: (entry: StoredFachaResult) => void;
    onReset: () => void;
    clearLeaderboard: () => void;
    clearAllLocalStorage: () => void;
}

const LeaderboardView: React.FC<LeaderboardViewProps> = ({
    leaderboard,
    handleLeaderboardResultClick,
    onReset,
    clearLeaderboard,
    clearAllLocalStorage
}) => {
    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 neon-text-fuchsia flex items-center gap-2 sm:gap-3">
                <TrophyIcon className="w-8 h-8 sm:w-10 sm:h-10" /> Top Fachas
            </h2>
            {leaderboard.length > 0 ? (
                <div className="w-full space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    {leaderboard.map((entry, index) => (
                        <div
                            key={entry.id}
                            onClick={() => handleLeaderboardResultClick(entry)}
                            className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-lg border border-violet-500/20 w-full transition-all hover:bg-slate-800 hover:border-fuchsia-500 cursor-pointer hover:scale-[1.02] active:scale-[0.98] group"
                            title="Tocá para ver el análisis completo"
                        >
                            <span className="font-orbitron text-2xl font-bold text-fuchsia-400 w-12 text-center">#{index + 1}</span>
                            <img src={entry.imageSrc} alt={entry.name} className="w-16 h-16 rounded-full object-cover border-2 border-violet-400 group-hover:border-fuchsia-400 transition-colors" />
                            <div className="flex-grow">
                                <p className="font-bold text-lg text-white truncate group-hover:text-fuchsia-300 transition-colors">{entry.name}</p>
                                <p className="text-sm text-violet-300 group-hover:text-violet-200 transition-colors">Clasificó el {new Date(entry.timestamp).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-orbitron text-3xl font-bold group-hover:scale-110 transition-transform" style={{ color: getScoreColor(entry.rating), textShadow: `0 0 8px ${getScoreColor(entry.rating)}` }}>
                                    {entry.rating.toFixed(1)}
                                </p>
                                <p className="text-xs text-violet-400 uppercase group-hover:text-violet-200 transition-colors">de Facha</p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-fuchsia-400 text-sm font-bold">
                                👆 Ver análisis
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-violet-300 text-lg text-center mt-8">
                    Todavía no hay nadie en el top. ¡Sé el primero en medir tu facha!
                </p>
            )}

            <div className="mt-8 flex items-center gap-6">
                <button
                    onClick={onReset}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-600/80 to-gray-800/80 hover:from-gray-500/90 hover:to-gray-700/90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-gray-500/25 border-2 border-gray-400 border-opacity-60"
                >
                    Menú Principal
                </button>
                {leaderboard.length > 0 && (
                    <button
                        onClick={clearLeaderboard}
                        className="flex items-center gap-2 text-red-400 hover:text-red-300 hover:scale-105 transition-transform"
                    >
                        <Trash2Icon /> Borrar Top
                    </button>
                )}
                <button
                    onClick={clearAllLocalStorage}
                    className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 hover:scale-105 transition-transform text-sm"
                    title="Limpiar todos los datos guardados (útil si hay problemas de almacenamiento)"
                >
                    <Trash2Icon /> Limpiar Datos
                </button>
            </div>
        </div>
    );
};

export default LeaderboardView;
