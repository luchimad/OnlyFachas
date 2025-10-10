/**
 * Social Share Service
 * Modular service for handling social media sharing with deep links
 * Supports Web Share API and platform-specific deep links
 */

export interface ShareResult {
  success: boolean;
  method: 'web-share' | 'deep-link' | 'fallback';
  message: string;
  platform?: string;
}

export interface ShareOptions {
  imageBlob: Blob;
  filename: string;
  title?: string;
  text?: string;
  url?: string;
}

export interface DeepLinkConfig {
  scheme: string;
  package?: string;
  fallbackUrl?: string;
}

class SocialShareService {
  private readonly DEEP_LINKS = {
    instagram: {
      scheme: 'instagram-stories://share',
      package: 'com.instagram.android',
      fallbackUrl: 'https://www.instagram.com/stories/create/'
    },
    // Add more social platforms here in the future
    twitter: {
      scheme: 'twitter://post',
      package: 'com.twitter.android',
      fallbackUrl: 'https://twitter.com/compose/tweet'
    }
  };

  /**
   * Check if Web Share API is supported
   */
  private isWebShareSupported(): boolean {
    return 'navigator' in window && 'share' in navigator;
  }

  /**
   * Check if the device is mobile
   */
  private isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           window.innerWidth <= 768;
  }

  /**
   * Check if the device is Android
   */
  private isAndroid(): boolean {
    return /Android/i.test(navigator.userAgent);
  }

  /**
   * Check if the device is iOS
   */
  private isIOS(): boolean {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  /**
   * Use Web Share API to share the image
   */
  private async shareWithWebAPI(options: ShareOptions): Promise<boolean> {
    if (!this.isWebShareSupported()) {
      return false;
    }

    try {
      const shareData: any = {
        title: options.title || 'OnlyFachas - Mi resultado de facha',
        text: options.text || '¡Mirá mi puntaje de facha!',
        url: options.url || 'https://onlyfachas.fun/'
      };

      // Add files if supported (some browsers support sharing files)
      if ('canShare' in navigator && navigator.canShare({ files: [new File([options.imageBlob], options.filename, { type: 'image/png' })] })) {
        shareData.files = [new File([options.imageBlob], options.filename, { type: 'image/png' })];
      }

      await navigator.share(shareData);
      return true;
    } catch (error) {
      console.warn('Web Share API failed:', error);
      return false;
    }
  }

  /**
   * Try to open app using deep link with proper intent handling
   */
  private async tryDeepLink(config: DeepLinkConfig, imageBlob: Blob): Promise<boolean> {
    return new Promise((resolve) => {
      // For Android, we need to use a more sophisticated approach
      if (this.isAndroid()) {
        this.tryAndroidDeepLink(config, imageBlob).then(resolve);
        return;
      }

      // For iOS, use URL scheme
      if (this.isIOS()) {
        this.tryIOSDeepLink(config, imageBlob).then(resolve);
        return;
      }

      // Fallback for other platforms
      resolve(false);
    });
  }

  /**
   * Try Android deep link with proper intent handling
   */
  private async tryAndroidDeepLink(config: DeepLinkConfig, imageBlob: Blob): Promise<boolean> {
    return new Promise((resolve) => {
      // Create a data URL for the image
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        
        // Create intent URL with proper data
        const intentUrl = `intent://instagram.com#Intent;` +
          `package=${config.package};` +
          `action=android.intent.action.SEND;` +
          `type=image/png;` +
          `S.android.intent.extra.STREAM=${encodeURIComponent(dataUrl)};` +
          `end`;

        // Try to open the app
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = intentUrl;
        
        const timeout = setTimeout(() => {
          document.body.removeChild(iframe);
          resolve(false);
        }, 3000);

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
      };
      
      reader.readAsDataURL(imageBlob);
    });
  }

  /**
   * Try iOS deep link with URL scheme
   */
  private async tryIOSDeepLink(config: DeepLinkConfig, imageBlob: Blob): Promise<boolean> {
    return new Promise((resolve) => {
      // For iOS, we need to copy the image to clipboard first
      // Then use the URL scheme
      navigator.clipboard.write([
        new ClipboardItem({
          'com.instagram.sharedSticker.backgroundImage': imageBlob,
          'public.png': imageBlob
        })
      ]).then(() => {
        // Now try to open the app
        const link = document.createElement('a');
        link.href = config.scheme;
        link.style.display = 'none';
        
        const timeout = setTimeout(() => {
          document.body.removeChild(link);
          resolve(false);
        }, 3000);

        link.onclick = () => {
          clearTimeout(timeout);
          document.body.removeChild(link);
          resolve(true);
        };

        document.body.appendChild(link);
        link.click();
      }).catch(() => {
        resolve(false);
      });
    });
  }

  /**
   * Open fallback URL
   */
  private openFallback(config: DeepLinkConfig): void {
    if (config.fallbackUrl) {
      window.open(config.fallbackUrl, '_blank');
    }
  }

  /**
   * Download image as final fallback
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
   * Share to Instagram Stories specifically
   */
  async shareToInstagramStories(options: ShareOptions): Promise<ShareResult> {
    const config = this.DEEP_LINKS.instagram;

    // Check if we're on mobile
    if (!this.isMobile()) {
      return {
        success: false,
        method: 'fallback',
        message: 'Esta función está diseñada para dispositivos móviles'
      };
    }

    try {
      // First try Web Share API
      const webShareSuccess = await this.shareWithWebAPI(options);
      if (webShareSuccess) {
        return {
          success: true,
          method: 'web-share',
          message: 'Compartido usando Web Share API',
          platform: 'instagram'
        };
      }

      // Try deep link
      const deepLinkSuccess = await this.tryDeepLink(config, options.imageBlob);
      if (deepLinkSuccess) {
        return {
          success: true,
          method: 'deep-link',
          message: 'Instagram Stories abierto exitosamente',
          platform: 'instagram'
        };
      }

      // Fallback to web version
      this.openFallback(config);
      return {
        success: true,
        method: 'fallback',
        message: 'Abriendo Instagram web como fallback',
        platform: 'instagram'
      };

    } catch (error) {
      console.error('Error sharing to Instagram:', error);
      
      // Final fallback: download
      this.downloadImage(options.imageBlob, options.filename);
      
      return {
        success: true,
        method: 'fallback',
        message: 'No pudimos abrir Instagram, descargá la imagen y subila manualmente',
        platform: 'instagram'
      };
    }
  }

  /**
   * Generic share method (can be extended for other platforms)
   */
  async share(platform: keyof typeof SocialShareService.prototype.DEEP_LINKS, options: ShareOptions): Promise<ShareResult> {
    switch (platform) {
      case 'instagram':
        return this.shareToInstagramStories(options);
      default:
        throw new Error(`Platform ${platform} not supported yet`);
    }
  }
}

// Export singleton instance
export const socialShareService = new SocialShareService();
export default socialShareService;
