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
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % loadingMessages.length;
      setMessage(loadingMessages[currentIndex]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
      {/* Main spinner container */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-6">
        {/* Outer spinning ring */}
        <div className="absolute inset-0 border-4 border-t-transparent border-fuchsia-500 rounded-full animate-spin"></div>
        {/* Inner spinning ring */}
        <div 
          className="absolute inset-2 border-4 border-t-transparent border-cyan-400 rounded-full animate-spin" 
          style={{ animationDuration: '0.8s', animationDirection: 'reverse' }}
        ></div>
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="28" 
            height="28" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-violet-400 animate-pulse"
          >
            <path d="M12 2a10 10 0 1 0 10 10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>
      </div>

      {/* Loading message */}
      <div className="max-w-md mx-auto">
        <p className="text-base sm:text-lg font-semibold text-violet-300 animate-pulse font-orbitron leading-relaxed">
          {message}
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex space-x-2 mt-4">
        {[0, 1, 2].map((dot) => (
          <div
            key={dot}
            className="w-2 h-2 bg-fuchsia-500 rounded-full animate-pulse"
            style={{
              animationDelay: `${dot * 0.2}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Loader;