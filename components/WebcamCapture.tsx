import React, { useRef, useEffect, useCallback } from 'react';
import { CameraIcon, XIcon } from './Icons';

interface WebcamCaptureProps {
  onCapture: (dataUrl: string) => void;
  onCancel: () => void;
}



const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing webcam: ", err);
        alert("No se pudo acceder a la cámara. Asegúrate de haber dado permiso en tu navegador.");
        onCancel();
      }
    };

    startWebcam();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [onCancel]);

  const capture = useCallback(() => {
    const canvas = document.createElement('canvas');
    if (videoRef.current) {
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Flip the image horizontally for a mirror effect
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onCapture(dataUrl);
      }
    }
  }, [onCapture]);
  
  const NeonButton: React.FC<{onClick: () => void, children: React.ReactNode}> = ({ onClick, children }) => (
    <button
      onClick={onClick}
      className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-violet-500 to-fuchsia-500 group-hover:from-violet-600 group-hover:to-fuchsia-600 hover:text-white focus:ring-4 focus:outline-none focus:ring-violet-500/50 transition-all duration-300 neon-shadow-fuchsia"
    >
      <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-slate-800/80 rounded-md group-hover:bg-opacity-0 flex items-center gap-2">
        {children}
      </span>
    </button>
  );

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center">
      <div className="w-full border-4 border-violet-500 rounded-lg overflow-hidden mb-6 neon-shadow-purple">
        <video ref={videoRef} autoPlay playsInline className="w-full h-auto" style={{ transform: 'scaleX(-1)' }} />
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