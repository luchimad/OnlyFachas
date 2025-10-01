/**
 * Instagram Share to Stories Service
 * Modular service for handling Instagram sharing functionality
 * Supports both Android (intent) and iOS (URL scheme) approaches
 */

export interface InstagramShareResult {
  success: boolean;
  method: 'app' | 'web' | 'download';
  message: string;
}

export interface InstagramShareOptions {
  imageBlob: Blob;
  fallbackToDownload?: boolean;
  showUserFeedback?: boolean;
}

class InstagramShareService {
  private readonly INSTAGRAM_PACKAGE = 'com.instagram.android';
  private readonly INSTAGRAM_STORIES_URL = 'instagram-stories://share';
  private readonly INSTAGRAM_WEB_URL = 'https://www.instagram.com/stories/create/';
  private readonly SOURCE_APP = 'onlyfachas';

  /**
   * Detect if the device is mobile
   */
  private isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           window.innerWidth <= 768;
  }

  /**
   * Detect if the device is Android
   */
  private isAndroid(): boolean {
    return /Android/i.test(navigator.userAgent);
  }

  /**
   * Detect if the device is iOS
   */
  private isIOS(): boolean {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  /**
   * Copy image to clipboard with Instagram-specific format
   */
  private async copyToClipboard(blob: Blob): Promise<boolean> {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'com.instagram.sharedSticker.backgroundImage': blob,
          'public.png': blob
        })
      ]);
      return true;
    } catch (error) {
      console.warn('Failed to copy to clipboard with Instagram format:', error);
      
      // Fallback to standard PNG format
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob
          })
        ]);
        return true;
      } catch (fallbackError) {
        console.error('Failed to copy to clipboard:', fallbackError);
        return false;
      }
    }
  }

  /**
   * Try to open Instagram app using Android intent
   */
  private async tryAndroidIntent(): Promise<boolean> {
    return new Promise((resolve) => {
      const intentUrl = `intent://instagram.com#Intent;package=${this.INSTAGRAM_PACKAGE};end`;
      
      // Create a temporary iframe to test if the app can be opened
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = intentUrl;
      
      const timeout = setTimeout(() => {
        document.body.removeChild(iframe);
        resolve(false);
      }, 2000);

      iframe.onload = () => {
        clearTimeout(timeout);
        document.body.removeChild(iframe);
        resolve(true);
      };

      iframe.onerror = () => {
        clearTimeout(timeout);
        document.body.removeChild(iframe);
        resolve(false);
      };

      document.body.appendChild(iframe);
    });
  }

  /**
   * Try to open Instagram app using iOS URL scheme
   */
  private async tryIOSURLScheme(): Promise<boolean> {
    return new Promise((resolve) => {
      const url = `${this.INSTAGRAM_STORIES_URL}?source_application=${this.SOURCE_APP}`;
      
      // Create a temporary link to test if the app can be opened
      const link = document.createElement('a');
      link.href = url;
      link.style.display = 'none';
      
      const timeout = setTimeout(() => {
        document.body.removeChild(link);
        resolve(false);
      }, 2000);

      // Try to open the app
      try {
        link.click();
        clearTimeout(timeout);
        document.body.removeChild(link);
        resolve(true);
      } catch (error) {
        clearTimeout(timeout);
        document.body.removeChild(link);
        resolve(false);
      }
    });
  }

  /**
   * Open Instagram web version as fallback
   */
  private openWebVersion(): void {
    window.open(this.INSTAGRAM_WEB_URL, '_blank');
  }

  /**
   * Download image as fallback
   */
  private downloadImage(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Show user feedback message
   */
  private showMessage(message: string, _type: 'success' | 'error' | 'info' = 'info'): void {
    // You can replace this with your preferred notification system
    alert(message);
  }

  /**
   * Main method to share to Instagram Stories
   */
  async shareToInstagram(options: InstagramShareOptions): Promise<InstagramShareResult> {
    const { imageBlob, fallbackToDownload = true, showUserFeedback = true } = options;

    // Check if we're on mobile
    if (!this.isMobile()) {
      if (showUserFeedback) {
        this.showMessage('Esta función está diseñada para dispositivos móviles.', 'info');
      }
      return {
        success: false,
        method: 'download',
        message: 'Función solo disponible en móviles'
      };
    }

    try {
      // Copy image to clipboard first
      const clipboardSuccess = await this.copyToClipboard(imageBlob);
      
      if (!clipboardSuccess) {
        throw new Error('No se pudo copiar la imagen al portapapeles');
      }

      let appOpened = false;

      // Try platform-specific methods
      if (this.isAndroid()) {
        appOpened = await this.tryAndroidIntent();
      } else if (this.isIOS()) {
        appOpened = await this.tryIOSURLScheme();
      }

      if (appOpened) {
        if (showUserFeedback) {
          this.showMessage('¡Imagen copiada! Se abrió Instagram Stories. Pegá la imagen en tu historia.', 'success');
        }
        return {
          success: true,
          method: 'app',
          message: 'Instagram abierto exitosamente'
        };
      }

      // Fallback to web version
      this.openWebVersion();
      
      if (showUserFeedback) {
        this.showMessage('Imagen copiada al portapapeles. Abriendo Instagram web...', 'info');
      }
      
      return {
        success: true,
        method: 'web',
        message: 'Abriendo Instagram web'
      };

    } catch (error) {
      console.error('Error sharing to Instagram:', error);
      
      if (fallbackToDownload) {
        // Final fallback: download the image
        const filename = `onlyfachas-${Date.now()}.png`;
        this.downloadImage(imageBlob, filename);
        
        if (showUserFeedback) {
          this.showMessage('No pudimos abrir Instagram, descargá la imagen y subila manualmente.', 'error');
        }
        
        return {
          success: true,
          method: 'download',
          message: 'Imagen descargada como fallback'
        };
      }

      if (showUserFeedback) {
        this.showMessage('Error al compartir. Intenta de nuevo.', 'error');
      }
      
      return {
        success: false,
        method: 'download',
        message: 'Error al compartir'
      };
    }
  }
}

// Export singleton instance
export const instagramShareService = new InstagramShareService();
export default instagramShareService;