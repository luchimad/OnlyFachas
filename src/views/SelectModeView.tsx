import React, { RefObject } from 'react';
import { CameraIcon, UploadIcon } from '../components/Icons';
import { AppMode, AppState } from '../types';

interface SelectModeViewProps {
    appMode: AppMode;
    setAppState: (state: AppState) => void;
    fileInputRef: RefObject<HTMLInputElement>;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, slot: 'single' | 1 | 2) => void;
    reset: () => void;
}

const SelectModeView: React.FC<SelectModeViewProps> = ({
    appMode,
    setAppState,
    fileInputRef,
    handleImageUpload,
    reset,
}) => {
    return (
        <div className="text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 neon-text-fuchsia">
                {appMode === 'enhance' ? 'Convertite en GigaChad' : '¿Qué onda tu facha?'}
            </h2>
            <p className="text-violet-300 mb-8 max-w-md mx-auto">
                {appMode === 'enhance' ? 'Subí tu mejor foto y dejá que la IA te transforme en una leyenda.' : 'Subí una foto o tirá una selfie para que nuestra IA te diga si tenés pinta. De una, sin vueltas.'}
            </p>

            {/* Aviso informativo */}
            <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 border border-yellow-500/30 rounded-lg p-4 mb-6 max-w-lg mx-auto">
                <div className="flex items-center justify-center gap-2 text-sm text-center">
                    <span className="text-yellow-400">⚠️</span>
                    <span className="text-yellow-300">Al continuar confirmo que tengo 18 años o más y que no subiré contenido inapropiado. OnlyFachas es una aplicación de entretenimiento: las imágenes se procesan automáticamente y no se almacenan.</span>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <button
                    onClick={() => { setAppState('capture'); }}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600/80 to-blue-800/80 hover:from-cyan-500/90 hover:to-blue-700/90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25 border-2 border-cyan-400 border-opacity-60"
                >
                    <CameraIcon className="w-4 h-4 text-white" />
                    Activar Cámara
                </button>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600/80 to-green-800/80 hover:from-green-500/90 hover:to-green-700/90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-green-500/25 border-2 border-green-400 border-opacity-60"
                >
                    <UploadIcon className="w-4 h-4 text-white" />
                    Subir Foto
                </button>
            </div>


            <button
                onClick={() => {
                    reset();
                }}
                className="mt-6 text-sm text-violet-400 hover:text-white transition-colors duration-200"
            >
                Volver
            </button>
            <input type="file" ref={fileInputRef} onChange={(e) => handleImageUpload(e, 'single')} accept="image/*" className="hidden" />
        </div>
    );
};

export default SelectModeView;
