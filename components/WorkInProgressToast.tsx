import React, { useEffect, useState } from 'react';
import { ConstructionIcon, ClockIcon, XIcon } from './Icons';

interface WorkInProgressToastProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  description: string;
}

const WorkInProgressToast: React.FC<WorkInProgressToastProps> = ({ 
  isVisible, 
  onClose, 
  title, 
  description 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation to complete
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className={`transform transition-all duration-300 ${
        isAnimating 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
      }`}>
        <div className="bg-slate-900/95 backdrop-blur-sm border-2 border-yellow-500/50 rounded-xl p-4 shadow-2xl neon-shadow-yellow">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="text-yellow-400 animate-pulse">
                <ConstructionIcon className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-semibold text-yellow-300 uppercase tracking-wider">
                  Work in Progress
                </span>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-violet-400 hover:text-white transition-colors duration-200 hover:scale-110"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-3">
            <h3 className="font-bold text-lg text-yellow-300 mb-1">
              {title}
            </h3>
            <p className="text-sm text-violet-300 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Instagram CTA */}
          <div className="bg-slate-800/50 border border-violet-500/30 rounded-lg p-3">
            <p className="text-xs text-violet-400/80 mb-2">
              Próximamente... ¡Seguinos en Instagram para estar al tanto de las novedades!
            </p>
            <a
              href="https://instagram.com/luchimad"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-pink-400 hover:text-pink-300 transition-colors duration-200 hover:scale-105"
            >
              <span>📸</span>
              @luchimad
            </a>
          </div>

          {/* Progress bar */}
          <div className="mt-3 w-full bg-slate-800/50 rounded-full h-1">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-1 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkInProgressToast;
