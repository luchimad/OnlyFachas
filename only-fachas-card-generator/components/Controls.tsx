
import React from 'react';
import UploadIcon from './icons/UploadIcon';
import DownloadIcon from './icons/DownloadIcon';

interface ControlsProps {
  score: string;
  setScore: (score: string) => void;
  rank: string;
  setRank: (rank: string) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  isExporting: boolean;
}

const Controls: React.FC<ControlsProps> = ({
  score,
  setScore,
  rank,
  setRank,
  onImageChange,
  onExport,
  isExporting,
}) => {
  return (
    <div className="w-full max-w-md bg-[#15132b]/80 border border-[#533597] shadow-[0_0_20px_rgba(83,53,151,0.5)] rounded-2xl p-6 lg:p-8 space-y-6 backdrop-blur-sm">
      <h2 className="text-3xl font-bold text-center text-purple-200">Personaliza tu Veredicto</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="image-upload" className="block text-sm font-medium text-purple-300 mb-2">
            1. Sube tu Foto
          </label>
          <label htmlFor="image-upload" className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-purple-500/20 border-2 border-dashed border-purple-400/50 rounded-lg cursor-pointer hover:bg-purple-500/30 transition-colors">
            <UploadIcon className="w-6 h-6 text-purple-300" />
            <span className="text-purple-200 font-semibold">Seleccionar archivo</span>
          </label>
          <input id="image-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={onImageChange} />
        </div>

        <div>
          <label htmlFor="score" className="block text-sm font-medium text-purple-300 mb-2">
            2. Define el Valor de Facha
          </label>
          <input
            id="score"
            type="text"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            maxLength={4}
            className="w-full px-4 py-2 bg-black/30 border border-purple-400/50 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-lime-400 outline-none transition-shadow"
            placeholder="Ej: 8.3"
          />
        </div>

        <div>
          <label htmlFor="rank" className="block text-sm font-medium text-purple-300 mb-2">
            3. Escribe el Rango
          </label>
          <input
            id="rank"
            type="text"
            value={rank}
            onChange={(e) => setRank(e.target.value)}
            maxLength={25}
            className="w-full px-4 py-2 bg-black/30 border border-purple-400/50 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-lime-400 outline-none transition-shadow"
            placeholder="Ej: FACHA PERSONIFICADA"
          />
        </div>
      </div>
      
      <div>
        <button
          onClick={onExport}
          disabled={isExporting}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-lime-400 text-black font-bold rounded-lg hover:bg-lime-300 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Exportando...
            </>
          ) : (
            <>
              <DownloadIcon className="w-6 h-6" />
              Exportar Imagen
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Controls;