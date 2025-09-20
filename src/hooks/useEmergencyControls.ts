import { useState, useEffect, useCallback } from 'react';

interface EmergencyControls {
  isMaintenanceMode: boolean;
  maxRequestsPerHour: number;
  requestDelay: number;
  isRateLimited: boolean;
  remainingRequests: number;
  checkRateLimit: () => boolean;
  incrementRequestCount: () => void;
}

const STORAGE_KEY = 'onlyfachas_requests';
const HOUR_MS = 60 * 60 * 1000;

export const useEmergencyControls = (): EmergencyControls => {
  const [isMaintenanceMode] = useState(
    import.meta.env.VITE_MAINTENANCE_MODE === 'true'
  );
  
  const [maxRequestsPerHour] = useState(
    parseInt(import.meta.env.VITE_MAX_REQUESTS_PER_HOUR || '10', 10)
  );
  
  const [requestDelay] = useState(
    parseInt(import.meta.env.VITE_REQUEST_DELAY || '3', 10) * 1000
  );

  const [isRateLimited, setIsRateLimited] = useState(false);
  const [remainingRequests, setRemainingRequests] = useState(maxRequestsPerHour);

  const getRequestData = useCallback(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return { requests: [], lastReset: Date.now() };
      
      const parsed = JSON.parse(data);
      const now = Date.now();
      
      // Reset if more than an hour has passed
      if (now - parsed.lastReset > HOUR_MS) {
        return { requests: [], lastReset: now };
      }
      
      return parsed;
    } catch {
      return { requests: [], lastReset: Date.now() };
    }
  }, []);

  const saveRequestData = useCallback((data: any) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving request data:', error);
    }
  }, []);

  const checkRateLimit = useCallback((): boolean => {
    if (isMaintenanceMode) return false;
    
    const data = getRequestData();
    const now = Date.now();
    const hourAgo = now - HOUR_MS;
    
    // Filter requests from the last hour
    const recentRequests = data.requests.filter((timestamp: number) => timestamp > hourAgo);
    
    if (recentRequests.length >= maxRequestsPerHour) {
      setIsRateLimited(true);
      setRemainingRequests(0);
      return false;
    }
    
    setRemainingRequests(maxRequestsPerHour - recentRequests.length);
    setIsRateLimited(false);
    return true;
  }, [isMaintenanceMode, maxRequestsPerHour, getRequestData]);

  const incrementRequestCount = useCallback(() => {
    const data = getRequestData();
    const now = Date.now();
    
    data.requests.push(now);
    saveRequestData(data);
    
    // Update remaining requests
    const hourAgo = now - HOUR_MS;
    const recentRequests = data.requests.filter((timestamp: number) => timestamp > hourAgo);
    setRemainingRequests(maxRequestsPerHour - recentRequests.length);
  }, [getRequestData, saveRequestData, maxRequestsPerHour]);

  useEffect(() => {
    checkRateLimit();
  }, [checkRateLimit]);

  return {
    isMaintenanceMode,
    maxRequestsPerHour,
    requestDelay,
    isRateLimited,
    remainingRequests,
    checkRateLimit,
    incrementRequestCount,
  };
};
