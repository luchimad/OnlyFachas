import React from 'react';
import { FachaEnhanceResult, AppState } from '../types';
import { RefreshCwIcon } from '../components/Icons';
import { getScoreColor } from '../utils/fachaUtils';

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
  onReset,
}) => {
  if (!enhancedResult) return null;

  const gigachadScore = enhancedResult.gigachadScore ?? 8;
  const scoreColor = getScoreColor(gigachadScore);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 neon-text-fuchsia">
        🔥 Plan GigaChad
      </h2>

      {/* Photo + potential score */}
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-6 w-full justify-center">
        {imageSrc && (
          <div className="flex flex-col items-center">
            <img
              src={imageSrc}
              alt="Tu foto"
              className="rounded-lg border-4 border-violet-500 w-40 h-40 object-cover"
            />
            <p className="text-sm text-violet-400 mt-2">Ahora</p>
          </div>
        )}

        <div className="flex flex-col items-center gap-2">
          <div className="text-7xl">⚡</div>
          <p className="text-violet-300 text-sm font-bold uppercase tracking-widest">Potencial GigaChad</p>
          <span
            className="font-orbitron text-6xl font-bold"
            style={{ color: scoreColor, textShadow: `0 0 15px ${scoreColor}` }}
          >
            {gigachadScore.toFixed(1)}
          </span>
        </div>
      </div>

      {/* AI comment */}
      <div className="w-full bg-slate-800/60 border border-fuchsia-500/40 rounded-xl p-5 mb-6">
        <p className="text-lg text-cyan-300 italic leading-relaxed">
          "{enhancedResult.comment}"
        </p>
      </div>

      {/* Recommendations */}
      {enhancedResult.recommendations && enhancedResult.recommendations.length > 0 && (
        <div className="w-full mb-6">
          <h3 className="text-xl font-bold text-violet-300 mb-4">
            🎯 Tus 5 pasos para detonar
          </h3>
          <div className="space-y-3">
            {enhancedResult.recommendations.map((rec, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-slate-800/50 border border-violet-500/20 rounded-lg p-4 text-left"
              >
                <span
                  className="font-orbitron text-xl font-bold shrink-0"
                  style={{ color: scoreColor }}
                >
                  {i + 1}
                </span>
                <p className="text-violet-200 leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4 mt-2">
        <button
          onClick={() => {
            setEnhancedResult(null);
            setImageData(null);
            setImageSrc(null);
            setAppState('select');
          }}
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
