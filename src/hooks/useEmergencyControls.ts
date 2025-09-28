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
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [maxRequestsPerHour, setMaxRequestsPerHour] = useState(10);
  const [requestDelay, setRequestDelay] = useState(3000);

  const [isRateLimited, setIsRateLimited] = useState(false);
  const [remainingRequests, setRemainingRequests] = useState(maxRequestsPerHour);

  // Cargar variables de entorno dinámicamente
  useEffect(() => {
    const loadEmergencySettings = async () => {
      try {
        // Intentar cargar desde el archivo de configuración
        const response = await fetch('/emergency-config.json?t=' + Date.now());
        if (response.ok) {
          const settings = await response.json();
          setIsMaintenanceMode(settings.maintenanceMode === true);
          setMaxRequestsPerHour(parseInt(settings.maxRequestsPerHour || '10', 10));
          setRequestDelay(parseInt(settings.requestDelay || '3', 10) * 1000);
          // Configuración de emergencia cargada
          return;
        }
      } catch (error) {
        // No se pudo cargar configuración dinámica, usando valores por defecto
      }

      // Fallback: usar variables de build time
      setIsMaintenanceMode(import.meta.env.VITE_MAINTENANCE_MODE === 'true');
      setMaxRequestsPerHour(parseInt(import.meta.env.VITE_MAX_REQUESTS_PER_HOUR || '10', 10));
      setRequestDelay(parseInt(import.meta.env.VITE_REQUEST_DELAY || '3', 10) * 1000);
    };

    loadEmergencySettings();
    
    // Recargar configuración cada 30 segundos
    const interval = setInterval(loadEmergencySettings, 30000);
    return () => clearInterval(interval);
  }, []);

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
