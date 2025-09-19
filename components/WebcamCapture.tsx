import React, { useRef, useEffect, useCallback } from 'react';
import { CameraIcon, XIcon } from './Icons';

interface WebcamCaptureProps {
  onCapture: (dataUrl: string) => void;
  onCancel: () => void;
}

// --- Sound Effect ---
const shutterSoundData = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAmAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIwARTR4AAAAAAAAAAAAAADh4ZUVsY25IajdnLzVUSmJHSnZlRzZ6eWJWVzZaVlR0ZlA4PQBCbGF6ZXIgdjAuOS4yAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7QJgAAMPgZn6BSwAABOAAANIAAAEGVVGljTg091aishgQAACAgIABARiQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7QJgAE0B2b4KscgAARCAAABgAAAARFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/9k=';
const playSound = (audioSrc: string) => {
  try {
    const audio = new Audio(audioSrc);
    audio.volume = 0.5;
    audio.play().catch(e => console.error("Audio playback failed:", e));
  } catch (e) {
    console.error("Could not play audio:", e);
  }
};


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
    playSound(shutterSoundData);
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
      className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800"
    >
      <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0 flex items-center gap-2">
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