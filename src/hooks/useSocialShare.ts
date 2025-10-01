import { useState, useCallback } from 'react';
import { socialShareService, ShareResult, ShareOptions } from '../services/socialShareService';

interface UseSocialShareReturn {
  isSharing: boolean;
  shareToInstagram: (options: ShareOptions) => Promise<ShareResult>;
  share: (platform: 'instagram', options: ShareOptions) => Promise<ShareResult>;
  lastResult: ShareResult | null;
}

/**
 * Custom hook for social sharing functionality
 * Provides a clean interface to the social share service
 */
export const useSocialShare = (): UseSocialShareReturn => {
  const [isSharing, setIsSharing] = useState(false);
  const [lastResult, setLastResult] = useState<ShareResult | null>(null);

  const shareToInstagram = useCallback(async (options: ShareOptions): Promise<ShareResult> => {
    setIsSharing(true);
    
    try {
      const result = await socialShareService.shareToInstagramStories(options);
      setLastResult(result);
      return result;
    } finally {
      setIsSharing(false);
    }
  }, []);

  const share = useCallback(async (platform: 'instagram', options: ShareOptions): Promise<ShareResult> => {
    setIsSharing(true);
    
    try {
      const result = await socialShareService.share(platform, options);
      setLastResult(result);
      return result;
    } finally {
      setIsSharing(false);
    }
  }, []);

  return {
    isSharing,
    shareToInstagram,
    share,
    lastResult
  };
};

export default useSocialShare;
