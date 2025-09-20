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
      // Auto-close after 6 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 6000);
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Popup */}
      <div className={`relative z-[10000] transform transition-all duration-300 ${
        isAnimating 
          ? 'scale-100 opacity-100' 
          : 'scale-95 opacity-0'
      }`}>
        <div className="bg-slate-900/90 backdrop-blur-md border-2 border-yellow-500/50 rounded-2xl p-8 shadow-2xl neon-shadow-yellow max-w-md w-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="text-yellow-400 animate-pulse">
                <ConstructionIcon className="w-8 h-8" />
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-yellow-400" />
                <span className="text-sm font-semibold text-yellow-300 uppercase tracking-wider">
                  Work in Progress
                </span>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-violet-400 hover:text-white transition-colors duration-200 hover:scale-110 p-1"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <h3 className="font-bold text-2xl text-yellow-300 mb-3 text-center">
              {title}
            </h3>
            <p className="text-base text-violet-300 leading-relaxed text-center">
              {description}
            </p>
          </div>

          {/* Próximamente message */}
          <div className="bg-slate-800/50 border border-violet-500/30 rounded-lg p-4 text-center">
            <p className="text-sm text-violet-400/80">
              Próximamente... ¡Mantente atento a las novedades!
            </p>
          </div>

          {/* Progress bar */}
          <div className="mt-6 w-full bg-slate-800/50 rounded-full h-2">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkInProgressToast;
