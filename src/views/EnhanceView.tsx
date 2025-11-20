import React from 'react';
import { FachaEnhanceResult, AppState } from '../types';
import { RefreshCwIcon } from '../components/Icons';

interface EnhanceViewProps {
    enhancedResult: FachaEnhanceResult | null;
    imageSrc: string | null;
    setEnhancedResult: (result: FachaEnhanceResult | null) => void;
    setImageData: (data: any) => void;
    setImageSrc: (src: string | null) => void;
    setAppState: (state: AppState) => void;
    onReset: () => void;
}

const EnhanceView: React.FC<EnhanceViewProps> = ({
    enhancedResult,
    imageSrc,
    setEnhancedResult,
    setImageData,
    setImageSrc,
    setAppState,
    onReset
}) => {
    if (!enhancedResult) return null;

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 neon-text-fuchsia">¡Mirá lo que sos ahora!</h2>
            <div className="w-full flex flex-col md:flex-row items-start justify-center gap-8 mb-8">
                <div className="w-full md:w-1/2 flex flex-col items-center">
                    <h3 className="text-2xl font-bold mb-4 text-violet-300">Antes</h3>
                    <img src={imageSrc!} alt="Foto original" className="rounded-lg border-4 border-violet-500 w-full" />
                </div>
                <div className="w-full md:w-1/2 flex flex-col items-center">
                    <h3 className="text-2xl font-bold mb-4 text-cyan-400">Después (GigaChad)</h3>
                    <img
                        src={`data:${enhancedResult.newImageMimeType};base64,${enhancedResult.newImageBase64}`}
                        alt="Foto mejorada"
                        className="rounded-lg border-4 border-cyan-400 neon-shadow-fuchsia w-full"
                    />
                </div>
            </div>
            <p className="text-lg md:text-xl text-cyan-300 mt-4 p-4 bg-slate-800/50 border border-yellow-500/30 rounded-lg italic w-full">
                "{enhancedResult.comment}"
            </p>
            <div className="flex gap-4 mt-8">
                <button
                    onClick={() => { setEnhancedResult(null); setImageData(null); setImageSrc(null); setAppState('select'); }}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-600/80 to-purple-800/80 hover:from-fuchsia-500/90 hover:to-purple-700/90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-fuchsia-500/25 border-2 border-fuchsia-400 border-opacity-60"
                >
                    <RefreshCwIcon className="w-4 h-4 text-white" />
                    Probar con otra
                </button>
                <button
                    onClick={onReset}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-600/80 to-gray-800/80 hover:from-gray-500/90 hover:to-gray-700/90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-gray-500/25 border-2 border-gray-400 border-opacity-60"
                >
                    Menú Principal
                </button>
            </div>
        </div>
    );
};

export default EnhanceView;
