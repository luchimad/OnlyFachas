import React, { useRef, useEffect, useCallback } from 'react';
import { CameraIcon, XIcon } from './Icons';

interface WebcamCaptureProps {
  onCapture: (dataUrl: string) => void;
  onCancel: () => void;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    const startWebcam = async () => {
      try {
        // Configuración básica que funciona en todos los dispositivos
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user' 
          } 
        });
        
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().then(() => {
            setIsLoading(false);
            setError(null);
          }).catch(() => {
            setIsLoading(false);
            setError(null);
          });
        }
      } catch (err: any) {
        console.error("Error accessing webcam: ", err);
        
        let errorMessage = "No se pudo acceder a la cámara.";
        
        if (err.name === 'NotAllowedError') {
          errorMessage = "Permiso de cámara denegado. Por favor, permite el acceso a la cámara.";
        } else if (err.name === 'NotFoundError') {
          errorMessage = "No se encontró ninguna cámara en tu dispositivo.";
        } else if (err.name === 'NotReadableError') {
          errorMessage = "La cámara está siendo usada por otra aplicación.";
        } else if (err.name === 'SecurityError') {
          errorMessage = "Error de seguridad. Asegúrate de que la página esté servida por HTTPS.";
        }
        
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    startWebcam();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capture = useCallback(() => {
    if (!videoRef.current) {
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      onCapture(dataUrl);
    }
  }, [onCapture]);
  
  const NeonButton: React.FC<{onClick: () => void, children: React.ReactNode, className?: string, disabled?: boolean}> = ({ onClick, children, className = '', disabled = false }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-violet-500 to-fuchsia-500 transition-all duration-300 neon-shadow-fuchsia ${
        disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'group-hover:from-violet-600 group-hover:to-fuchsia-600 hover:text-white focus:ring-4 focus:outline-none focus:ring-violet-500/50'
      } ${className}`}
    >
      <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-slate-800/80 rounded-md group-hover:bg-opacity-0 flex items-center gap-2">
        {children}
      </span>
    </button>
  );

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center">
      <div className="w-full border-4 border-violet-500 rounded-lg overflow-hidden mb-6 neon-shadow-purple">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-auto" 
          style={{ transform: 'scaleX(-1)' }} 
        />
      </div>
      <div className="flex gap-4">
        <NeonButton onClick={capture}>
          <CameraIcon /> Tomar Foto
        </NeonButton>
        <NeonButton onClick={onCancel}>
          <XIcon /> Cancelar
        </NeonButton>
      </div>
    </div>
  );
};

export default WebcamCapture;