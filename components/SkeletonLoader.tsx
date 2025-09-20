import React from 'react';

interface SkeletonLoaderProps {
  type: 'image' | 'text' | 'meter' | 'card';
  className?: string;
}

/**
 * Componente de skeleton loading para mejorar la experiencia de carga
 * Diferentes tipos para diferentes elementos de la UI
 */
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type, className = '' }) => {
  const baseClasses = "animate-pulse bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-[length:200%_100%]";

  const renderSkeleton = () => {
    switch (type) {
      case 'image':
        return (
          <div className={`w-full h-64 rounded-lg ${baseClasses} ${className}`}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-slate-500/50 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
        );

      case 'text':
        return (
          <div className={`space-y-2 ${className}`}>
            <div className={`h-4 rounded ${baseClasses} w-3/4`}></div>
            <div className={`h-4 rounded ${baseClasses} w-1/2`}></div>
            <div className={`h-4 rounded ${baseClasses} w-5/6`}></div>
          </div>
        );

      case 'meter':
        return (
          <div className={`flex flex-col items-center space-y-4 ${className}`}>
            {/* Score skeleton */}
            <div className={`w-32 h-20 rounded-lg ${baseClasses}`}></div>
            
            {/* Meter skeleton */}
            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-slate-500/50"></div>
              <div className="relative w-12 h-64 bg-slate-800/50 rounded-full overflow-hidden border-2 border-slate-600/30">
                <div className={`absolute bottom-0 left-0 w-full h-1/3 ${baseClasses}`}></div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-500/50"></div>
            </div>
            
            {/* Tier skeleton */}
            <div className={`w-64 h-16 rounded-lg ${baseClasses}`}></div>
          </div>
        );

      case 'card':
        return (
          <div className={`p-4 rounded-lg border border-slate-600/30 ${baseClasses} ${className}`}>
            <div className="space-y-3">
              <div className={`h-6 rounded ${baseClasses} w-1/2`}></div>
              <div className={`h-4 rounded ${baseClasses} w-full`}></div>
              <div className={`h-4 rounded ${baseClasses} w-3/4`}></div>
            </div>
          </div>
        );

      default:
        return <div className={`w-full h-8 rounded ${baseClasses} ${className}`}></div>;
    }
  };

  return (
    <div className="relative">
      {renderSkeleton()}
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
    </div>
  );
};

export default SkeletonLoader;
