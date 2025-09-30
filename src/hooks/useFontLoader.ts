import { useEffect, useState } from 'react';

const useFontLoader = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        // Load fonts using FontFace API for better control
        const fontPromises = [];
        
        // Montserrat Thin
        if (!document.fonts.check('100 16px Montserrat')) {
          const montserratThin = new FontFace('Montserrat', 'url(/fonts/Montserrat-Thin.ttf)', {
            weight: '100',
            style: 'normal',
            display: 'swap'
          });
          fontPromises.push(montserratThin.load().then(font => document.fonts.add(font)));
        }
        
        // Montserrat Regular
        if (!document.fonts.check('400 16px Montserrat')) {
          const montserratRegular = new FontFace('Montserrat', 'url(/fonts/Montserrat-Regular.ttf)', {
            weight: '400',
            style: 'normal',
            display: 'swap'
          });
          fontPromises.push(montserratRegular.load().then(font => document.fonts.add(font)));
        }
        
        // Arizonia
        if (!document.fonts.check('400 16px Arizonia')) {
          const arizonia = new FontFace('Arizonia', 'url(/fonts/Arizonia-Regular.ttf)', {
            weight: '400',
            style: 'normal',
            display: 'swap'
          });
          fontPromises.push(arizonia.load().then(font => document.fonts.add(font)));
        }
        
        // Orbitron Regular
        if (!document.fonts.check('400 16px Orbitron')) {
          const orbitron = new FontFace('Orbitron', 'url(/fonts/Orbitron-Regular.ttf)', {
            weight: '400',
            style: 'normal',
            display: 'swap'
          });
          fontPromises.push(orbitron.load().then(font => document.fonts.add(font)));
        }
        
        // Orbitron Medium
        if (!document.fonts.check('500 16px Orbitron')) {
          const orbitronMedium = new FontFace('Orbitron', 'url(/fonts/Orbitron-Medium.ttf)', {
            weight: '500',
            style: 'normal',
            display: 'swap'
          });
          fontPromises.push(orbitronMedium.load().then(font => document.fonts.add(font)));
        }

        if (fontPromises.length > 0) {
          await Promise.all(fontPromises);
        }
        
        // Wait for all fonts to be ready
        await document.fonts.ready;
        
        // Additional verification
        const montserratLoaded = document.fonts.check('16px Montserrat');
        const arizoniaLoaded = document.fonts.check('16px Arizonia');
        const orbitronLoaded = document.fonts.check('16px Orbitron');
        
        console.log('Font loading status:', {
          montserrat: montserratLoaded,
          arizonia: arizoniaLoaded,
          orbitron: orbitronLoaded
        });
        
        if (montserratLoaded && arizoniaLoaded && orbitronLoaded) {
          setFontsLoaded(true);
        } else {
          // Fallback: wait a bit more
          setTimeout(() => setFontsLoaded(true), 2000);
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
