import { useEffect, useState } from 'react';

const useFontLoader = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        // Load fonts using FontFace API for better control
        const fontPromises = [];
        
        // Montserrat Light
        if (!document.fonts.check('100 16px Montserrat')) {
          const montserratLight = new FontFace('Montserrat', 'url(https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aXpsog.woff2)', {
            weight: '100',
            style: 'normal',
            display: 'swap'
          });
          fontPromises.push(montserratLight.load().then(font => document.fonts.add(font)));
        }
        
        // Montserrat Bold
        if (!document.fonts.check('700 16px Montserrat')) {
          const montserratBold = new FontFace('Montserrat', 'url(https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aXpsog.woff2)', {
            weight: '700',
            style: 'normal',
            display: 'swap'
          });
          fontPromises.push(montserratBold.load().then(font => document.fonts.add(font)));
        }
        
        // Arizonia
        if (!document.fonts.check('400 16px Arizonia')) {
          const arizonia = new FontFace('Arizonia', 'url(https://fonts.gstatic.com/s/arizonia/v13/neIIzCemt4A5qa7mv6WGHK06UY30.woff2)', {
            weight: '400',
            style: 'normal',
            display: 'swap'
          });
          fontPromises.push(arizonia.load().then(font => document.fonts.add(font)));
        }
        
        // Orbitron Regular
        if (!document.fonts.check('400 16px Orbitron')) {
          const orbitron = new FontFace('Orbitron', 'url(https://fonts.gstatic.com/s/orbitron/v31/yMJMMIlzdpvQtQY9D4bk0ODTQ.woff2)', {
            weight: '400',
            style: 'normal',
            display: 'swap'
          });
          fontPromises.push(orbitron.load().then(font => document.fonts.add(font)));
        }
        
        // Orbitron Bold
        if (!document.fonts.check('700 16px Orbitron')) {
          const orbitronBold = new FontFace('Orbitron', 'url(https://fonts.gstatic.com/s/orbitron/v31/yMJMMIlzdpvQtQY9D4bk0ODTQ.woff2)', {
            weight: '700',
            style: 'normal',
            display: 'swap'
          });
          fontPromises.push(orbitronBold.load().then(font => document.fonts.add(font)));
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
