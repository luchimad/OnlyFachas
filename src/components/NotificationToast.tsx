import React, { useEffect, useState } from 'react';
import { XIcon, AlertTriangleIcon, ClockIcon, InfoIcon } from './Icons';

interface NotificationToastProps {
  isVisible: boolean;
  onClose: () => void;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  duration?: number; // Auto-close duration in ms, 0 = no auto-close
}

/**
 * Componente de notificación toast para mostrar mensajes al usuario
 * Soporta diferentes tipos: error, warning, info, success
 * Incluye auto-close opcional y animaciones suaves
 */
const NotificationToast: React.FC<NotificationToastProps> = ({
  isVisible,
  onClose,
  type,
  title,
  message,
  duration = 5000
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      
      // Auto-close después del tiempo especificado
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, duration]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300); // Esperar a que termine la animación
  };

  if (!isVisible) return null;

  // Configuración de colores y iconos según el tipo
  const getTypeConfig = () => {
    switch (type) {
      case 'error':
        return {
          bgColor: 'bg-red-900/90',
          borderColor: 'border-red-500/50',
          iconColor: 'text-red-400',
          icon: AlertTriangleIcon,
          titleColor: 'text-red-300'
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-900/90',
          borderColor: 'border-yellow-500/50',
          iconColor: 'text-yellow-400',
          icon: ClockIcon,
          titleColor: 'text-yellow-300'
        };
      case 'info':
        return {
          bgColor: 'bg-blue-900/90',
          borderColor: 'border-blue-500/50',
          iconColor: 'text-blue-400',
          icon: InfoIcon,
          titleColor: 'text-blue-300'
        };
      case 'success':
        return {
          bgColor: 'bg-green-900/90',
          borderColor: 'border-green-500/50',
          iconColor: 'text-green-400',
          icon: InfoIcon,
          titleColor: 'text-green-300'
        };
      default:
        return {
          bgColor: 'bg-slate-900/90',
          borderColor: 'border-violet-500/50',
          iconColor: 'text-violet-400',
          icon: InfoIcon,
          titleColor: 'text-violet-300'
        };
    }
  };

  const config = getTypeConfig();
  const IconComponent = config.icon;

  return (
    <div className="fixed top-4 right-4 z-[10000] max-w-sm w-full">
      <div className={`transform transition-all duration-300 ${
        isAnimating 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
      }`}>
        <div className={`${config.bgColor} backdrop-blur-md border-2 ${config.borderColor} rounded-lg p-4 shadow-2xl`}>
          {/* Header con icono y botón de cerrar */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`${config.iconColor} animate-pulse`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <h3 className={`font-bold text-sm ${config.titleColor}`}>
                {title}
              </h3>
            </div>
            <button
              onClick={handleClose}
              className="text-violet-400 hover:text-white transition-colors duration-200 hover:scale-110 p-1"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Mensaje */}
          <p className="text-sm text-violet-200 leading-relaxed">
            {message}
          </p>

          {/* Barra de progreso para auto-close */}
          {duration > 0 && (
            <div className="mt-3 w-full bg-slate-800/50 rounded-full h-1">
              <div 
                className="bg-gradient-to-r from-violet-400 to-fuchsia-500 h-1 rounded-full animate-pulse"
                style={{
                  animation: `shrink ${duration}ms linear forwards`
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* CSS para la animación de la barra de progreso */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
        `
      }} />
    </div>
  );
};

export default NotificationToast;
