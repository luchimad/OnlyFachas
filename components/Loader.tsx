
import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "Dandole comida al hámster...",
  "Calibrando el fachómetro...",
  "Midiendo tu facha...",
  "Chequeando si levantás más que el dólar...",
  "Analizando a ver si por fin detonás...",
  "Ayyy loquitaaaa...",
  "Manija por saber el resultado, ¿no?",
  "Relaja que ya casi termino",
  "Ya casi...",
  "Un cachito mas...",
  
];

const Loader: React.FC = () => {
  const [message, setMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessage(prevMessage => {
        const currentIndex = loadingMessages.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % loadingMessages.length;
        return loadingMessages[nextIndex];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-t-transparent border-fuchsia-500 rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-4 border-t-transparent border-cyan-400 rounded-full animate-spin" style={{ animationDuration: '0.8s' }}></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400 animate-pulse">
                <path d="M12 2a10 10 0 1 0 10 10" />
            </svg>
        </div>
      </div>
      <p className="mt-6 text-lg font-semibold text-violet-300 animate-pulse font-orbitron">
        {message}
      </p>
    </div>
  );
};

export default Loader;
