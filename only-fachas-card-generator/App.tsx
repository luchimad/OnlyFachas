import React, { useState, useRef, useCallback } from 'react';
import PreviewCard from './components/PreviewCard';
import Controls from './components/Controls';

// Declare htmlToImage for TypeScript since it's loaded from a CDN
declare global {
  interface Window {
    htmlToImage: {
      toPng: (element: HTMLElement, options?: any) => Promise<string>;
    };
  }
}

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [score, setScore] = useState<string>('8.3');
  const [rank, setRank] = useState<string>('FACHA PERSONIFICADA');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const cardRef = useRef<HTMLDivElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = useCallback(async () => {
    if (cardRef.current === null) {
      return;
    }

    setIsExporting(true);
    try {
      const dataUrl = await window.htmlToImage.toPng(cardRef.current, {
        pixelRatio: 2, // Higher pixel ratio for better quality
        cacheBust: true,
      });
      
      const link = document.createElement('a');
      link.download = 'only-fachas.png';
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Oops, something went wrong!', err);
      alert('Error exporting image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#0a030f] text-white flex flex-col items-center justify-center p-4 lg:p-8">
      <main className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-16 items-center lg:items-start">
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
           <PreviewCard ref={cardRef} image={image} score={score} rank={rank} />
        </div>
        <div className="w-full lg:w-1/2">
           <Controls
            score={score}
            setScore={setScore}
            rank={rank}
            setRank={setRank}
            onImageChange={handleImageChange}
            onExport={handleExport}
            isExporting={isExporting}
          />
        </div>
      </main>
    </div>
  );
};

export default App;