
import React, { forwardRef } from 'react';
import UploadIcon from './icons/UploadIcon';

interface PreviewCardProps {
  image: string | null;
  score: string;
  rank: string;
}

const GlowText: React.FC<{ children: React.ReactNode; className?: string; color: 'pink' | 'lime' }> = ({ children, className, color }) => {
    const colorClasses = {
        pink: 'text-pink-300 drop-shadow-[0_0_8px_rgba(244,114,182,0.8)] drop-shadow-[0_0_15px_rgba(244,114,182,0.6)]',
        lime: 'text-lime-300 drop-shadow-[0_0_8px_rgba(190,242,100,0.9)] drop-shadow-[0_0_20px_rgba(190,242,100,0.7)]',
    };
    return <span className={`${colorClasses[color]} ${className}`}>{children}</span>;
};


const PreviewCard = forwardRef<HTMLDivElement, PreviewCardProps>(({ image, score, rank }, ref) => {
  return (
    <div ref={ref} className="w-[350px] h-[622px] bg-gradient-to-b from-[#1c0f2a] via-[#461a64] to-[#1c0f2a] flex flex-col items-center justify-between p-8 rounded-2xl overflow-hidden">
      <header className="text-center -mt-2">
         <h1 className="flex items-baseline justify-center gap-1">
            <GlowText color="pink" className="font-montserrat font-thin text-4xl">Only</GlowText>
            <GlowText color="pink" className="font-arizonia text-5xl">Fachas</GlowText>
         </h1>
      </header>
      
      <div className="w-56 h-72 bg-[#15132b] rounded-2xl border border-[#533597] shadow-[0_0_20px_#533597] p-2 flex items-center justify-center">
        {image ? (
          <img src={image} alt="User upload" className="w-full h-full object-cover rounded-xl grayscale" />
        ) : (
          <div className="text-center text-purple-300/70 flex flex-col items-center gap-2">
            <UploadIcon className="w-10 h-10" />
            <span className="text-sm">Sube tu foto</span>
          </div>
        )}
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-light tracking-[0.2em]">
            <GlowText color="pink">VEREDICTO</GlowText>
        </h2>
        <p className="text-6xl font-black font-orbitron">
            <GlowText color="lime">{score || '0.0'}</GlowText>
        </p>
        <p className="text-xl font-light tracking-[0.1em]">
            <GlowText color="pink">DE FACHA</GlowText>
        </p>
      </div>

      <div className="w-full border border-[#533597] shadow-[0_0_20px_#533597] bg-[#15132b] rounded-1xl p-4 text-center">
        <p className="text-sm tracking-widest text-purple-300/80 -mb-1">RANGO DE FACHA</p>
        <p className="text-2xl font-bold break-words font-orbitron">
            <GlowText color="lime">{rank || '...'}</GlowText>
        </p>
      </div>

      <footer className="text-center">
        <p className="text-sm text-gray-400/50">onlyfachas.fun</p>
      </footer>
    </div>
  );
});

PreviewCard.displayName = 'PreviewCard';

export default PreviewCard;