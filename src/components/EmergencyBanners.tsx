import React from 'react';

interface MaintenanceBannerProps {
  onClose: () => void;
}

export const MaintenanceBanner: React.FC<MaintenanceBannerProps> = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-gradient-to-br from-red-900/90 to-red-800/90 border-2 border-red-500 rounded-2xl p-8 max-w-md w-full text-center">
      <div className="text-6xl mb-4">🔧</div>
      <h2 className="text-3xl font-bold text-red-200 mb-4">
        Modo Mantenimiento
      </h2>
      <p className="text-red-100 mb-6 leading-relaxed">
        Estamos mejorando la app para darte una experiencia aún mejor. 
        Volvé en unos minutos y vas a ver la diferencia.
      </p>
      <div className="bg-red-800/50 p-4 rounded-lg border border-red-600/50 mb-6">
        <div className="flex items-center justify-center gap-2 text-red-200">
          <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
          <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          <span className="ml-2">Trabajando en mejoras...</span>
        </div>
      </div>
      <button
        onClick={onClose}
        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200"
      >
        Entendido
      </button>
    </div>
  </div>
);

interface RateLimitBannerProps {
  remainingRequests: number;
  maxRequests: number;
  onClose: () => void;
}

export const RateLimitBanner: React.FC<RateLimitBannerProps> = ({ 
  remainingRequests, 
  maxRequests, 
  onClose 
}) => (
  <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-gradient-to-br from-orange-900/90 to-orange-800/90 border-2 border-orange-500 rounded-2xl p-8 max-w-md w-full text-center">
      <div className="text-6xl mb-4">⏰</div>
      <h2 className="text-3xl font-bold text-orange-200 mb-4">
        Límite de Uso Alcanzado
      </h2>
      <p className="text-orange-100 mb-6 leading-relaxed">
        Ya usaste {maxRequests} análisis en la última hora. 
        Esperá un poco para seguir analizando fachas.
      </p>
      <div className="bg-orange-800/50 p-4 rounded-lg border border-orange-600/50 mb-6">
        <div className="text-orange-200 mb-2">
          <span className="font-bold text-orange-300">{remainingRequests}</span> análisis restantes
        </div>
        <div className="w-full bg-orange-700 rounded-full h-2">
          <div 
            className="bg-orange-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(remainingRequests / maxRequests) * 100}%` }}
          ></div>
        </div>
      </div>
      <div className="text-orange-200/80 text-sm mb-6">
        El límite se resetea cada hora para que todos puedan usar la app
      </div>
      <button
        onClick={onClose}
        className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200"
      >
        Entendido
      </button>
    </div>
  </div>
);

interface RequestDelayBannerProps {
  delaySeconds: number;
  onClose: () => void;
}

export const RequestDelayBanner: React.FC<RequestDelayBannerProps> = ({ 
  delaySeconds, 
  onClose 
}) => (
  <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-gradient-to-br from-yellow-900/90 to-yellow-800/90 border-2 border-yellow-500 rounded-2xl p-8 max-w-md w-full text-center">
      <div className="text-6xl mb-4">⏳</div>
      <h2 className="text-3xl font-bold text-yellow-200 mb-4">
        Esperá un Momento
      </h2>
      <p className="text-yellow-100 mb-6 leading-relaxed">
        Para evitar sobrecargar el servidor, hay un delay de {delaySeconds} segundos 
        entre cada análisis. Es solo un ratito.
      </p>
      <div className="bg-yellow-800/50 p-4 rounded-lg border border-yellow-600/50 mb-6">
        <div className="flex items-center justify-center gap-2 text-yellow-200">
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          <span className="ml-2">Procesando...</span>
        </div>
      </div>
      <div className="text-yellow-200/80 text-sm mb-6">
        Esto ayuda a que la app funcione bien para todos
      </div>
      <button
        onClick={onClose}
        className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200"
      >
        Entendido
      </button>
    </div>
  </div>
);
