import React, { useState } from 'react';

interface DevModeMenuProps {
  isOpen: boolean;
  onClose: () => void;
  forceScore: number | null;
  useMockData: boolean;
  onToggleMockData: () => void;
  onSetForceScore: (score: number | null) => void;
  onReset: () => void;
}

const DevModeMenu: React.FC<DevModeMenuProps> = ({
  isOpen,
  onClose,
  forceScore,
  useMockData,
  onToggleMockData,
  onSetForceScore,
  onReset
}) => {
  const [tempScore, setTempScore] = useState<string>(forceScore?.toString() || '');

  if (!isOpen) return null;

  const handleScoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const score = parseFloat(tempScore);
    if (score >= 1 && score <= 10) {
      onSetForceScore(score);
    } else {
      onSetForceScore(null);
    }
  };

  const handleClearScore = () => {
    setTempScore('');
    onSetForceScore(null);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-violet-500/30 rounded-2xl p-6 max-w-md w-full neon-shadow-purple">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-fuchsia-400 font-orbitron">
            🔧 Dev Mode
          </h2>
          <button
            onClick={onClose}
            className="text-violet-400 hover:text-violet-300 transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* Mock Data Toggle */}
        <div className="mb-6">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-white font-medium">Usar Datos Mock</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={useMockData}
                onChange={onToggleMockData}
                className="sr-only"
              />
              <div className={`w-12 h-6 rounded-full transition-colors ${
                useMockData ? 'bg-fuchsia-500' : 'bg-slate-600'
              }`}>
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  useMockData ? 'translate-x-6' : 'translate-x-0.5'
                } mt-0.5`} />
              </div>
            </div>
          </label>
          <p className="text-violet-400/70 text-sm mt-1">
            Fuerza el uso de respuestas mock en lugar de la API
          </p>
        </div>

        {/* Force Score */}
        <div className="mb-6">
          <label className="block text-white font-medium mb-2">
            Puntaje Forzado
          </label>
          <form onSubmit={handleScoreSubmit} className="flex gap-2">
            <input
              type="number"
              min="1"
              max="10"
              step="0.1"
              value={tempScore}
              onChange={(e) => setTempScore(e.target.value)}
              placeholder="1.0 - 10.0"
              className="flex-1 bg-slate-800 border border-violet-500/30 rounded-lg px-3 py-2 text-white placeholder-violet-400/50 focus:border-fuchsia-500 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Set
            </button>
            <button
              type="button"
              onClick={handleClearScore}
              className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Clear
            </button>
          </form>
          <p className="text-violet-400/70 text-sm mt-1">
            {forceScore ? `Puntaje actual: ${forceScore}` : 'Sin puntaje forzado'}
          </p>
        </div>

        {/* Status */}
        <div className="mb-6 p-3 bg-slate-800/50 rounded-lg">
          <h3 className="text-white font-medium mb-2">Estado Actual:</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-violet-400">Mock Data:</span>
              <span className={useMockData ? 'text-green-400' : 'text-red-400'}>
                {useMockData ? 'Activado' : 'Desactivado'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-violet-400">Puntaje Forzado:</span>
              <span className={forceScore ? 'text-green-400' : 'text-gray-400'}>
                {forceScore ? forceScore.toString() : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <div className="flex gap-3">
          <button
            onClick={onReset}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors font-medium"
          >
            Reset Todo
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-2 px-4 rounded-lg transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-4 p-3 bg-slate-800/30 rounded-lg">
          <p className="text-violet-400/70 text-xs text-center">
            Presiona D-E-V-M-O-D-E para abrir este menú
          </p>
        </div>
      </div>
    </div>
  );
};

export default DevModeMenu;
