import React, { useRef, useState, useCallback } from 'react';
import { FachaResult } from '../../types';
import ShareCard from './ShareCard';
import { getFachaTier } from '../utils/fachaUtils';
import useFontLoader from '../hooks/useFontLoader';
import { generateShareableImage, generateFachaFilename } from '../utils/imageGenerator';

interface ShareButtonProps {
  result: FachaResult;
  imageSrc: string;
  className?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ result, imageSrc, className = '' }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const fontsLoaded = useFontLoader();

  const handleExport = useCallback(async () => {
    if (!cardRef.current) {
      return;
    }

    setIsExporting(true);
    try {
      console.log('Starting export, fonts loaded:', fontsLoaded);
      
      // Generate the shareable image using the helper
      const generatedImage = await generateShareableImage({
        cardElement: cardRef.current,
        fontsLoaded,
        pixelRatio: 2,
        backgroundColor: '#000000'
      });

      // Download the image (same for mobile and desktop)
      const filename = generateFachaFilename(result);
      
      const link = document.createElement('a');
      link.download = filename;
      link.href = generatedImage.dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      console.error('Error exporting image:', err);
      alert('Error al exportar la imagen. Intenta de nuevo.');
    } finally {
      setIsExporting(false);
    }
  }, [result, fontsLoaded]);

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={`inline-flex items-center gap-2 bg-gradient-to-r from-violet-600/80 to-purple-800/80 hover:from-violet-500/90 hover:to-purple-700/90 disabled:from-gray-500/80 disabled:to-gray-700/80 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-violet-500/25 border-2 border-violet-400 border-opacity-60 ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isExporting ? (
          <>
            <svg className="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generando...
          </>
          ) : (
                     <>
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                       </svg>
                       Compartir resultado
                     </>
          )}
      </button>

      {/* Hidden card for export - invisible but accessible to html-to-image */}
      <div 
        className="fixed top-0 left-0 pointer-events-none"
        style={{
          transform: 'translateX(-9999px)',
          zIndex: -1,
          position: 'absolute'
        }}
      >
        <ShareCard
          ref={cardRef}
          image={imageSrc}
          score={result.rating.toFixed(1)}
          rank={getFachaTier(result.rating)}
        />
      </div>
    </div>
  );
};

export default ShareButton;