import React, { useRef, useState, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { FachaResult } from '../../types';
import ShareCard from './ShareCard';
import { getFachaTier } from '../utils/fachaUtils';
import useFontLoader from '../hooks/useFontLoader';

interface ShareButtonProps {
  result: FachaResult;
  imageSrc: string;
  className?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ result, imageSrc, className = '' }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const fontsLoaded = useFontLoader();

  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
  };

  const handleExport = useCallback(async () => {
    if (!cardRef.current) {
      return;
    }

    setIsExporting(true);
    try {
      console.log('Starting export, fonts loaded:', fontsLoaded);
      
      // Wait for fonts to load completely
      if (!fontsLoaded) {
        console.log('Waiting for fonts to load...');
        await document.fonts.ready;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Additional wait to ensure fonts are fully rendered
      console.log('Waiting additional time for font rendering...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Final font check
      const montserratReady = document.fonts.check('16px Montserrat');
      const arizoniaReady = document.fonts.check('16px Arizonia');
      const orbitronReady = document.fonts.check('16px Orbitron');
      
      console.log('Final font check:', {
        montserrat: montserratReady,
        arizonia: arizoniaReady,
        orbitron: orbitronReady
      });
      
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2, // Higher pixel ratio for better quality
        cacheBust: true,
        backgroundColor: '#000000',
      });
      
      if (isMobile()) {
        // On mobile, open Instagram app directly
        const instagramAppUrl = `instagram://story-camera`;
        const instagramWebUrl = `https://www.instagram.com/stories/create/`;
        
        // Try to open Instagram app first
        const appLink = document.createElement('a');
        appLink.href = instagramAppUrl;
        appLink.click();
        
        // Fallback to web version after a short delay
        setTimeout(() => {
          window.open(instagramWebUrl, '_blank');
        }, 1000);
        
        // Also copy image to clipboard if possible
        try {
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': blob
            })
          ]);
          alert('Imagen copiada al portapapeles. Ahora podés pegarla en tu historia de Instagram!');
        } catch (clipboardError) {
          console.log('Clipboard not available, opening Instagram only');
        }
      } else {
        // On desktop, download the image
        const tierText = getFachaTier(result.rating);
        const filename = `onlyfachas-${result.rating.toFixed(1)}-${tierText.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
        
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Error exporting image:', err);
      alert('Error al exportar la imagen. Intenta de nuevo.');
    } finally {
      setIsExporting(false);
    }
  }, [result]);

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={`relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium rounded-lg group bg-gradient-to-br from-violet-500 to-purple-600 transition-all duration-300 ${isExporting ? 'opacity-50 cursor-not-allowed' : 'group-hover:from-violet-500 group-hover:to-purple-600 hover:text-white focus:ring-4 focus:outline-none focus:ring-violet-200'}`}
      >
        <span className="relative w-full px-5 py-2.5 transition-all ease-in duration-75 bg-slate-900/30 backdrop-blur-sm rounded-md group-hover:bg-opacity-0 flex items-center justify-center gap-2 text-white font-bold group-hover:text-white drop-shadow-lg">
        {isExporting ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generando...
          </>
          ) : (
                     <>
                       <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                       </svg>
                       {isMobile() ? 'Subir a Instagram' : 'Compartir resultado'}
                     </>
          )}
        </span>
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
