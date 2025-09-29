import React, { forwardRef } from 'react';

interface ShareCardProps {
  image: string | null;
  score: string;
  rank: string;
}

const GlowText: React.FC<{ children: React.ReactNode; className?: string; color: 'pink' | 'yellow' }> = ({ children, className, color }) => {
  const colorClasses = {
    pink: 'text-pink-300 drop-shadow-[0_0_8px_rgba(244,114,182,0.8)] drop-shadow-[0_0_15px_rgba(244,114,182,0.6)]',
    yellow: 'text-yellow-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] drop-shadow-[0_0_20px_rgba(251,191,36,0.7)]',
  };
  return <span className={`${colorClasses[color]} ${className}`}>{children}</span>;
};

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(({ image, score, rank }, ref) => {
  return (
    <div ref={ref} className="w-[350px] h-[622px] bg-gradient-to-b from-[#0a0515] via-[#2d1a3a] to-[#0a0515] flex flex-col items-center justify-between p-8 rounded-2xl overflow-hidden">
      <header className="text-center -mt-2 relative z-10">
         <h1 className="flex items-baseline justify-center gap-1">
            <GlowText color="pink" className="font-montserrat font-thin text-4xl">Only</GlowText>
            <GlowText color="pink" className="font-arizonia text-5xl">Fachas</GlowText>
         </h1>
      </header>
      
      <div className="w-56 h-64 bg-[#15132b] rounded-2xl border border-[#533597] shadow-[0_0_20px_#533597] p-2 flex items-center justify-center relative z-10">
        {image ? (
          <img src={image} alt="User upload" className="w-full h-full object-cover rounded-xl" />
        ) : (
          <div className="text-center text-purple-300/70 flex flex-col items-center gap-2">
            <span className="text-sm">Sin imagen</span>
          </div>
        )}
      </div>

      <div className="text-center space-y-2 relative z-10">
        <h2 className="text-3xl font-light tracking-[0.05em] font-montserrat">
            <GlowText color="pink">VEREDICTO</GlowText>
        </h2>
        <p className="text-6xl font-black font-orbitron">
            <GlowText color="yellow">{score || '0.0'}</GlowText>
        </p>
        <p className="text-xl font-light tracking-[0.1em]">
            <GlowText color="pink">DE FACHA</GlowText>
        </p>
      </div>

      <div className="w-full border border-[#533597] shadow-[0_0_20px_#533597] bg-[#15132b] rounded-1xl p-4 text-center relative z-10">
        <p className="text-sm tracking-widest text-purple-300/80 -mb-1">RANGO DE FACHA</p>
        <p className="text-2xl font-bold break-words font-orbitron">
            <GlowText color="yellow">{rank || '...'}</GlowText>
        </p>
      </div>

      <footer className="text-center relative z-10">
        <p className="text-sm text-gray-400/50">onlyfachas.netlify.app</p>
      </footer>
    </div>
  );
});

ShareCard.displayName = 'ShareCard';

export default ShareCard;
