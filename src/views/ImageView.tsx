import React from 'react';
import { ZapIcon, RefreshCwIcon } from '../components/Icons';
import MinimalLoader from '../components/MinimalLoader';

interface ImageViewProps {
    imageSrc: string | null;
    showSkeleton: boolean;
    name: string;
    setName: (name: string) => void;
    analyzeFacha: () => void;
    reset: () => void;
}

const ImageView: React.FC<ImageViewProps> = ({
    imageSrc,
    showSkeleton,
    name,
    setName,
    analyzeFacha,
    reset,
}) => {
    return (
        <div className="w-full max-w-lg mx-auto text-center">
            <div className="mb-6 border-4 border-violet-500 rounded-lg overflow-hidden neon-shadow-purple">
                {showSkeleton ? (
                    <div className="w-full h-64 flex items-center justify-center bg-slate-800/50">
                        <MinimalLoader message="Procesando imagen..." />
                    </div>
                ) : (
                    <img src={imageSrc!} alt="User upload" className="w-full h-auto object-cover" />
                )}
            </div>
            <div className="w-full mb-4">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre o apodo para el Top"
                    className="w-full px-4 py-3 bg-slate-800/70 border-2 border-violet-500/50 rounded-lg text-white placeholder-violet-300/60 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition-all text-center"
                    aria-label="Ingresa tu nombre"
                    maxLength={30}
                />
            </div>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <button
                    onClick={analyzeFacha}
                    disabled={!name.trim()}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-700/80 to-purple-900/80 hover:from-fuchsia-600/90 hover:to-purple-800/90 disabled:from-gray-500/80 disabled:to-gray-700/80 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-fuchsia-500/25 border-2 border-fuchsia-400 border-opacity-60 w-full sm:w-auto"
                >
                    <ZapIcon className="w-4 h-4 text-white" />
                    Medir Facha
                </button>
                <button
                    onClick={() => {
                        reset();
                    }}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-600/80 to-gray-800/80 hover:from-gray-500/90 hover:to-gray-700/90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-gray-500/25 border-2 border-gray-400 border-opacity-60 w-full sm:w-auto"
                >
                    <RefreshCwIcon className="w-4 h-4 text-white" />
                    Probar de Nuevo
                </button>
            </div>
        </div>
    );
};

export default ImageView;
