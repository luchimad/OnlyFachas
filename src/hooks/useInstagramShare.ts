import { useState, useCallback } from 'react';
import { instagramShareService, InstagramShareResult, InstagramShareOptions } from '../services/instagramShareService';

interface UseInstagramShareReturn {
  isSharing: boolean;
  shareToInstagram: (options: InstagramShareOptions) => Promise<InstagramShareResult>;
  lastResult: InstagramShareResult | null;
}

/**
 * Custom hook for Instagram sharing functionality
 * Provides a clean interface to the Instagram share service
 */
export const useInstagramShare = (): UseInstagramShareReturn => {
  const [isSharing, setIsSharing] = useState(false);
  const [lastResult, setLastResult] = useState<InstagramShareResult | null>(null);

  const shareToInstagram = useCallback(async (options: InstagramShareOptions): Promise<InstagramShareResult> => {
    setIsSharing(true);
    
    try {
      const result = await instagramShareService.shareToInstagram(options);
      setLastResult(result);
      return result;
    } finally {
      setIsSharing(false);
    }
  }, []);

  return {
    isSharing,
    shareToInstagram,
    lastResult
  };
};

export default useInstagramShare;
