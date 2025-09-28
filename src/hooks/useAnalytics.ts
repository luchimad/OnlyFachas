import { useEffect } from 'react';

// Declarar gtag globalmente
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

// ID de Google Analytics
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-BVYETSFLC2';

export const useAnalytics = () => {
  // Inicializar Google Analytics
  useEffect(() => {
    if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
      // Cargar el script de Google Analytics
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script);

      // Inicializar gtag
      window.gtag = window.gtag || function() {
        (window.gtag as any).q = (window.gtag as any).q || [];
        (window.gtag as any).q.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_title: 'OnlyFachas',
        page_location: window.location.href,
      });
    }
  }, []);

  // Función para trackear eventos
  const trackEvent = (event: AnalyticsEvent) => {
    if (window.gtag && GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
      });
    }
  };

  // Función para trackear uso de API
  const trackApiUsage = (isMock: boolean, apiType: 'facha' | 'battle' | 'enhance', score?: number) => {
    trackEvent({
      action: isMock ? 'Mock API Call' : 'Real API Call',
      category: 'API Usage',
      label: `${apiType}_${isMock ? 'mock' : 'real'}`,
      value: score ? Math.round(score * 10) : 1, // Multiplicar por 10 para tener valores enteros
    });
  };

  // Función para trackear puntajes forzados
  const trackForcedScore = (score: number, apiType: 'facha' | 'battle' | 'enhance') => {
    trackEvent({
      action: 'Forced Score',
      category: 'Dev Mode',
      label: `${apiType}_${score}`,
      value: Math.round(score * 10),
    });
  };

  // Función para trackear activación de modo mock
  const trackMockModeToggle = (enabled: boolean) => {
    trackEvent({
      action: 'Mock Mode Toggle',
      category: 'Dev Mode',
      label: enabled ? 'enabled' : 'disabled',
      value: enabled ? 1 : 0,
    });
  };

  // Función para trackear errores de API
  const trackApiError = (errorType: string, apiType: 'facha' | 'battle' | 'enhance') => {
    trackEvent({
      action: 'API Error',
      category: 'Error',
      label: `${apiType}_${errorType}`,
      value: 1,
    });
  };

  // Función para trackear análisis exitosos
  const trackSuccessfulAnalysis = (apiType: 'facha' | 'battle' | 'enhance', isMock: boolean, score?: number) => {
    trackEvent({
      action: 'Successful Analysis',
      category: 'Analysis',
      label: `${apiType}_${isMock ? 'mock' : 'real'}`,
      value: score ? Math.round(score * 10) : 1,
    });
  };

  // Función para trackear análisis fallidos
  const trackFailedAnalysis = (apiType: 'facha' | 'battle' | 'enhance', errorType: string) => {
    trackEvent({
      action: 'Failed Analysis',
      category: 'Analysis',
      label: `${apiType}_${errorType}`,
      value: 1,
    });
  };

  // Función para trackear uso de dev mode
  const trackDevModeAccess = () => {
    trackEvent({
      action: 'Dev Mode Accessed',
      category: 'Dev Mode',
      label: 'keyboard_shortcut',
      value: 1,
    });
  };

  // Función para trackear páginas/vistas
  const trackPageView = (pageName: string) => {
    if (window.gtag && GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX') {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_title: `OnlyFachas - ${pageName}`,
        page_location: window.location.href,
      });
    }
  };

  return {
    trackEvent,
    trackApiUsage,
    trackForcedScore,
    trackMockModeToggle,
    trackApiError,
    trackSuccessfulAnalysis,
    trackFailedAnalysis,
    trackDevModeAccess,
    trackPageView,
  };
};

export default useAnalytics;
