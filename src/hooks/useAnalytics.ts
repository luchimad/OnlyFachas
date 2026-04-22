// GA is initialized in index.html – this hook only sends events.
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

const trackEvent = (event: AnalyticsEvent): void => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
    });
  }
};

export const useAnalytics = () => {
  const trackApiUsage = (isMock: boolean, apiType: 'facha' | 'battle' | 'enhance', score?: number) => {
    trackEvent({
      action: isMock ? 'Mock API Call' : 'Real API Call',
      category: 'API Usage',
      label: `${apiType}_${isMock ? 'mock' : 'real'}`,
      value: score ? Math.round(score * 10) : 1,
    });
  };

  const trackForcedScore = (score: number, apiType: 'facha' | 'battle' | 'enhance') => {
    trackEvent({
      action: 'Forced Score',
      category: 'Dev Mode',
      label: `${apiType}_${score}`,
      value: Math.round(score * 10),
    });
  };

  const trackMockModeToggle = (enabled: boolean) => {
    trackEvent({
      action: 'Mock Mode Toggle',
      category: 'Dev Mode',
      label: enabled ? 'enabled' : 'disabled',
      value: enabled ? 1 : 0,
    });
  };

  const trackApiError = (errorType: string, apiType: 'facha' | 'battle' | 'enhance') => {
    trackEvent({
      action: 'API Error',
      category: 'Error',
      label: `${apiType}_${errorType}`,
      value: 1,
    });
  };

  const trackSuccessfulAnalysis = (apiType: 'facha' | 'battle' | 'enhance', isMock: boolean, score?: number) => {
    trackEvent({
      action: 'Successful Analysis',
      category: 'Analysis',
      label: `${apiType}_${isMock ? 'mock' : 'real'}`,
      value: score ? Math.round(score * 10) : 1,
    });
  };

  const trackFailedAnalysis = (apiType: 'facha' | 'battle' | 'enhance', errorType: string) => {
    trackEvent({
      action: 'Failed Analysis',
      category: 'Analysis',
      label: `${apiType}_${errorType}`,
      value: 1,
    });
  };

  const trackDevModeAccess = () => {
    trackEvent({
      action: 'Dev Mode Accessed',
      category: 'Dev Mode',
      label: 'keyboard_shortcut',
      value: 1,
    });
  };

  const trackPageView = (pageName: string) => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('config', 'G-BVYETSFLC2', {
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
