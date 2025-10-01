/**
 * Image Generation Helper
 * Modular utility for generating shareable images
 */

import { toPng } from 'html-to-image';
import { FachaResult } from '../../types';
import { getFachaTier } from './fachaUtils';

export interface ImageGenerationOptions {
  cardElement: HTMLElement;
  fontsLoaded: boolean;
  pixelRatio?: number;
  backgroundColor?: string;
}

export interface GeneratedImage {
  dataUrl: string;
  blob: Blob;
  filename: string;
}

/**
 * Wait for fonts to be fully loaded and rendered
 */
export const waitForFonts = async (fontsLoaded: boolean): Promise<void> => {
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
};

/**
 * Generate a shareable image from the card element
 */
export const generateShareableImage = async (
  options: ImageGenerationOptions
): Promise<GeneratedImage> => {
  const {
    cardElement,
    fontsLoaded,
    pixelRatio = 2,
    backgroundColor = '#000000'
  } = options;

  // Wait for fonts to be ready
  await waitForFonts(fontsLoaded);

  // Generate the image
  const dataUrl = await toPng(cardElement, {
    pixelRatio,
    cacheBust: true,
    backgroundColor,
  });

  // Convert to blob
  const response = await fetch(dataUrl);
  const blob = await response.blob();

  // Generate filename
  const filename = `onlyfachas-${Date.now()}.png`;

  return {
    dataUrl,
    blob,
    filename
  };
};

/**
 * Generate filename for facha result
 */
export const generateFachaFilename = (result: FachaResult): string => {
  const tierText = getFachaTier(result.rating);
  return `onlyfachas-${result.rating.toFixed(1)}-${tierText.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
};
