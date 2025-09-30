import { useEffect, useState } from 'react';

const useFontLoader = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        // Preload critical fonts
        const fontPromises = [
          document.fonts.load('100 16px Montserrat'),
          document.fonts.load('400 16px Arizonia'),
          document.fonts.load('700 16px Orbitron'),
          document.fonts.load('900 16px Orbitron'),
        ];

        await Promise.all(fontPromises);
        
        // Wait for all fonts to be ready
        await document.fonts.ready;
        
        // Additional verification
        const montserratLoaded = document.fonts.check('16px Montserrat');
        const arizoniaLoaded = document.fonts.check('16px Arizonia');
        const orbitronLoaded = document.fonts.check('16px Orbitron');
        
        if (montserratLoaded && arizoniaLoaded && orbitronLoaded) {
          setFontsLoaded(true);
        } else {
          // Fallback: wait a bit more
          setTimeout(() => setFontsLoaded(true), 1000);
        }
      } catch (error) {
        console.warn('Font loading error:', error);
        // Fallback: proceed anyway
        setFontsLoaded(true);
      }
    };

    loadFonts();
  }, []);

  return fontsLoaded;
};

export default useFontLoader;
