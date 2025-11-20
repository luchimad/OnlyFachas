
import React, { useState, useCallback, useRef, useEffect, Suspense, lazy } from 'react';
import { FachaResult, FachaBattleResult, FachaEnhanceResult, StoredFachaResult, AiMode } from './types';
import './animations.css';
import { getFachaScore, getFachaBattleResult, getEnhancedFacha } from './services/geminiService';
import WebcamCapture from './components/WebcamCapture';
import Loader from './components/Loader';

import { useApiWithFallback } from './hooks/useApiWithFallback';
import { useHapticFeedback } from './hooks/useHapticFeedback';
import { useEmergencyControls } from './hooks/useEmergencyControls';

import { useAgeVerification } from './hooks/useAgeVerification';
import useDevMode from './hooks/useDevMode';

import { setDevModeSettings, setAnalyticsTracker, setSuccessfulAnalysisTracker, setFailedAnalysisTracker } from './services/geminiService';
import { setDevModeTracker, setMockModeToggleTracker, setForcedScoreTracker } from './hooks/useDevMode';
import useAnalytics from './hooks/useAnalytics';
import { selectFachaAudio, selectBattleAudio } from './utils/audioUtils';

// Lazy load all view components for code splitting
const WelcomeView = lazy(() => import('./views/WelcomeView'));
const ResultView = lazy(() => import('./views/ResultView'));
const BattleSelectView = lazy(() => import('./views/BattleView').then(module => ({ default: module.BattleSelectView })));
const BattleResultView = lazy(() => import('./views/BattleView').then(module => ({ default: module.BattleResultView })));
const EnhanceView = lazy(() => import('./views/EnhanceView'));
const LeaderboardView = lazy(() => import('./views/LeaderboardView'));
const PrivacyView = lazy(() => import('./views/PrivacyView'));
const TermsView = lazy(() => import('./views/TermsView'));
const AboutView = lazy(() => import('./views/AboutView'));
const FaqView = lazy(() => import('./views/FaqView'));
const ComingSoonView = lazy(() => import('./views/ComingSoonView'));
const SettingsView = lazy(() => import('./views/SettingsView'));
const SelectModeView = lazy(() => import('./views/SelectModeView'));
const ImageView = lazy(() => import('./views/ImageView'));
const ErrorView = lazy(() => import('./views/ErrorView'));

import Layout from './components/Layout';
import { AudioProvider, useAudio } from './contexts/AudioContext';

type AppMode = 'single' | 'battle' | 'enhance';
type AppState = 'welcome' | 'select' | 'capture' | 'analyze' | 'result' | 'error' | 'battleSelect' | 'battleResult' | 'enhancing' | 'enhanceResult' | 'leaderboard' | 'privacy' | 'terms' | 'comingSoon' | 'about' | 'faq';



// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<{ base64: string, mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const [mimePart, dataPart] = result.split(';base64,');
      const mimeType = mimePart.split(':')[1];
      resolve({ base64: dataPart, mimeType });
    };
    reader.onerror = error => reject(error);
  });
};

const AppContent: React.FC = () => {
  // Common state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [appMode, setAppMode] = useState<AppMode>('single');
  const [appState, setAppState] = useState<AppState>('welcome');

  // Debug: Log state changes (removed for production)

  // Debug: Log mode changes (removed for production)

  // Debug: Log initial state (removed for production)
  const [aiMode, setAiMode] = useState<AiMode>('rapido');
  const [showSettings, setShowSettings] = useState(false);

  // Notification Toast state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationContent, setNotificationContent] = useState({
    type: 'info' as 'error' | 'warning' | 'info' | 'success',
    title: '',
    message: ''
  });

  // Emergency banner states
  const [showMaintenanceBanner, setShowMaintenanceBanner] = useState(false);
  const [showRateLimitBanner, setShowRateLimitBanner] = useState(false);
  const [showRequestDelayBanner, setShowRequestDelayBanner] = useState(false);

  // Age verification hook
  const { } = useAgeVerification();

  // Dev mode hook
  const {
    devSettings,
    closeDevMenu,
    toggleMockData,
    setForceScore,
    resetDevSettings
  } = useDevMode();

  // Analytics hook
  const {
    trackApiUsage,
    trackForcedScore,
    trackMockModeToggle,
    trackSuccessfulAnalysis,
    trackFailedAnalysis,
    trackDevModeAccess
  } = useAnalytics();

  // API with fallback hook
  const {
    isRateLimited,
    timeUntilNextRequest,
    callApi
  } = useApiWithFallback();

  // QoL hooks
  const haptic = useHapticFeedback();

  // Emergency controls
  const {
    isMaintenanceMode,
    maxRequestsPerHour,
    requestDelay,
    isRateLimited: isEmergencyRateLimited,
    remainingRequests,
    checkRateLimit,
    incrementRequestCount
  } = useEmergencyControls();

  // Single/Enhance mode state
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageData, setImageData] = useState<{ base64: string, mimeType: string } | null>(null);
  const [result, setResult] = useState<FachaResult | null>(null);

  // QoL states
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState<string>('');

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<StoredFachaResult[]>([]);
  const [selectedLeaderboardResult, setSelectedLeaderboardResult] = useState<StoredFachaResult | null>(null);

  // Audio controls now managed by AudioContext
  const { musicEnabled, effectsEnabled, musicVolume, effectsVolume, setMusicEnabled, setEffectsEnabled, setMusicVolume, setEffectsVolume, playEffect } = useAudio();

  // Estado para rotación de audios (evitar repetir el mismo consecutivamente)
  const [lastPlayedAudio, setLastPlayedAudio] = useState<string>('');
  const [lastPlayedBattleAudio, setLastPlayedBattleAudio] = useState<string>('');

  // Pre-cargar audios comunes al inicializar (solo efectos)
  useEffect(() => {
    if (effectsEnabled) {
      const commonAudios = [
        '/audios/frases/individual/facha_detected_1.mp3',
        '/audios/frases/individual/facha_detected_2.mp3',
        '/audios/frases/individual/facha_detected_low1.mp3',
        '/audios/frases/individual/facha_detected_low2.mp3',
        '/audios/frases/individual/facha_detected_mid1.mp3',
        '/audios/frases/individual/facha_detected_mid2.mp3',
        '/audios/frases/individual/facha_detected_super.mp3',
        '/audios/frases/individual/facha_detected_super2.mp3',
        '/audios/frases/individual/facha_detected_super3.mp3',
        '/audios/frases/facha-vs-facha/1_wins.mp3',
        '/audios/frases/facha-vs-facha/1_wins_super.mp3',
        '/audios/frases/facha-vs-facha/2_wins.mp3',
        '/audios/frases/facha-vs-facha/2_wins_super.mp3'
      ];

      commonAudios.forEach(audioPath => {
        const audio = new Audio(audioPath);
        audio.preload = 'auto';
        audio.load();
      });
    }
  }, [effectsEnabled]);


  // Enhance mode state
  const [enhancedResult, setEnhancedResult] = useState<FachaEnhanceResult | null>(null);

  // Battle mode state
  const [imageSrc1, setImageSrc1] = useState<string | null>(null);
  const [imageData1, setImageData1] = useState<{ base64: string, mimeType: string } | null>(null);
  const [imageSrc2, setImageSrc2] = useState<string | null>(null);
  const [imageData2, setImageData2] = useState<{ base64: string, mimeType: string } | null>(null);
  const [battleResult, setBattleResult] = useState<FachaBattleResult | null>(null);
  const [activeBattleSlot, setActiveBattleSlot] = useState<1 | 2 | null>(null);
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem('onlyFachasLeaderboard');
      if (storedData) {
        const parsedData = JSON.parse(storedData) as StoredFachaResult[];

        // Limpiar datos antiguos (más de 30 días)
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const cleanedData = parsedData.filter(entry => entry.timestamp > thirtyDaysAgo);

        // Limitar a 5 entradas máximo (top 5)
        const limitedData = cleanedData.slice(0, 5);

        setLeaderboard(limitedData);

        // Si se limpiaron datos, guardar la versión limpia
        if (cleanedData.length !== parsedData.length || limitedData.length !== cleanedData.length) {
          localStorage.setItem('onlyFachasLeaderboard', JSON.stringify(limitedData));
        }
      }
    } catch (e) {
      console.error("Failed to load leaderboard from localStorage", e);
      setLeaderboard([]);
      // Limpiar datos corruptos
      localStorage.removeItem('onlyFachasLeaderboard');
    }
  }, []);


  // Emergency controls effect
  useEffect(() => {
    if (isMaintenanceMode) {
      setShowMaintenanceBanner(true);
    } else if (isEmergencyRateLimited) {
      setShowRateLimitBanner(true);
    } else if (requestDelay > 3000) { // Show delay banner if delay is more than 3 seconds
      setShowRequestDelayBanner(true);
    }
  }, [isMaintenanceMode, isEmergencyRateLimited, requestDelay]);

  // Sincronizar configuraciones del dev mode con el servicio
  useEffect(() => {
    setDevModeSettings({
      useMockData: devSettings.useMockData,
      forceScore: devSettings.forceScore
    });
  }, [devSettings.useMockData, devSettings.forceScore]);

  // Configurar los trackers de Analytics
  useEffect(() => {
    setAnalyticsTracker(trackApiUsage);
    setSuccessfulAnalysisTracker(trackSuccessfulAnalysis);
    setFailedAnalysisTracker(trackFailedAnalysis);
    setDevModeTracker(trackDevModeAccess);
    setMockModeToggleTracker(trackMockModeToggle);
    setForcedScoreTracker(trackForcedScore);
  }, [trackApiUsage, trackSuccessfulAnalysis, trackFailedAnalysis, trackDevModeAccess, trackMockModeToggle, trackForcedScore]);

  const runFachaEnhancement = useCallback(async (currentImageData: { base64: string, mimeType: string }) => {
    if (!currentImageData) {
      setError("Necesito una foto para tunear, pibe.");
      setAppState('error');
      return;
    }

    // Verificar controles de emergencia
    if (isMaintenanceMode) {
      setShowMaintenanceBanner(true);
      return;
    }

    if (!checkRateLimit()) {
      setShowRateLimitBanner(true);
      return;
    }

    // Aplicar delay si está configurado
    if (requestDelay > 0) {
      setShowRequestDelayBanner(true);
      await new Promise(resolve => setTimeout(resolve, requestDelay));
      setShowRequestDelayBanner(false);
    }

    setIsLoading(true);
    setError(null);
    setEnhancedResult(null);
    setAppState('enhancing');
    try {
      // Incrementar contador de requests
      incrementRequestCount();

      // Usar el hook con fallback automático
      const result = await callApi(getEnhancedFacha, currentImageData.base64, currentImageData.mimeType);
      setEnhancedResult(result);
      setAppState('enhanceResult');

    } catch (err: any) {
      console.error(err);

      // Mostrar error específico si es rate limiting
      if (err.message && err.message.includes('Esperá')) {
        showNotificationToast('warning', 'Muy rápido', err.message);
      } else {
        setError(err instanceof Error ? err.message : "Falló la IA tuneadora de fachas. Probá de nuevo.");
        setAppState('error');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isRateLimited, timeUntilNextRequest, callApi]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, slot: 'single' | 1 | 2) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Verificar rate limiting antes de procesar
        if (isRateLimited) {
          showNotificationToast(
            'warning',
            'Esperá un momento',
            `Esperá ${timeUntilNextRequest} segundos antes de enviar otra foto`
          );
          return;
        }

        // Haptic feedback al seleccionar imagen
        haptic.buttonPress();

        // Mostrar skeleton loading
        setShowSkeleton(true);

        setError(null);
        const { base64, mimeType } = await fileToBase64(file);
        const newImageData = { base64, mimeType };
        // Usar data URL en lugar de URL.createObjectURL para evitar problemas de CORS en exportación
        const newImageSrc = `data:${mimeType};base64,${base64}`;

        // Simular delay de carga
        setTimeout(() => {
          setShowSkeleton(false);
          if (slot === 'single') {
            setResult(null);
            setEnhancedResult(null);
            setImageData(newImageData);
            setImageSrc(newImageSrc);
            if (appMode === 'enhance') {
              runFachaEnhancement(newImageData);
            } else {
              setAppState('analyze');
            }
          } else if (slot === 1) {
            setBattleResult(null);
            setImageData1(newImageData);
            setImageSrc1(newImageSrc);
          } else { // slot === 2
            setBattleResult(null);
            setImageData2(newImageData);
            setImageSrc2(newImageSrc);
          }
        }, 500);
      } catch (err) {
        setShowSkeleton(false);
        setError('No se pudo cargar la imagen. Probá con otra, che.');
        setAppState('error');
      } finally {
        event.target.value = "";
      }
    }
  };

  const handleWebcamCapture = (dataUrl: string) => {
    // Haptic feedback al capturar
    haptic.success();

    setError(null);
    const [mimePart, dataPart] = dataUrl.split(';base64,');
    const mimeType = mimePart.split(':')[1];
    const newImageData = { base64: dataPart, mimeType };

    if (appMode === 'single' || appMode === 'enhance') {
      setResult(null);
      setEnhancedResult(null);
      setImageData(newImageData);
      setImageSrc(dataUrl);
      if (appMode === 'enhance') {
        runFachaEnhancement(newImageData);
      } else {
        setAppState('analyze');
      }
    } else if (appMode === 'battle' && activeBattleSlot) {
      setBattleResult(null);
      if (activeBattleSlot === 1) {
        setImageData1(newImageData);
        setImageSrc1(dataUrl);
      } else {
        setImageData2(newImageData);
        setImageSrc2(dataUrl);
      }
      setActiveBattleSlot(null);
      setAppState('battleSelect');
    }
  };

  const analyzeFacha = useCallback(async () => {
    if (!imageData) {
      setError("No hay foto para analizar, pibe.");
      setAppState('error');
      return;
    }
    if (!name.trim()) {
      setError("Che, ponete un nombre o un apodo para entrar al top.");
      return;
    }

    // Verificar controles de emergencia
    if (isMaintenanceMode) {
      setShowMaintenanceBanner(true);
      return;
    }

    if (!checkRateLimit()) {
      setShowRateLimitBanner(true);
      return;
    }

    // Aplicar delay si está configurado
    if (requestDelay > 0) {
      setShowRequestDelayBanner(true);
      await new Promise(resolve => setTimeout(resolve, requestDelay));
      setShowRequestDelayBanner(false);
    }

    setIsLoading(true);
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {

      // Incrementar contador de requests
      incrementRequestCount();

      // Usar el hook con fallback automático
      console.log('🔄 [APP] Llamando a callApi...');
      const fachaResult = await callApi(getFachaScore, imageData.base64, imageData.mimeType, aiMode);
      console.log('✅ [APP] callApi completado, resultado:', fachaResult);

      // Haptic feedback
      haptic.success();

      const dataUrl = `data:${imageData.mimeType};base64,${imageData.base64}`;
      const newEntry: StoredFachaResult = {
        id: `facha-${Date.now()}`,
        name: name,
        imageSrc: dataUrl,
        timestamp: Date.now(),
        ...fachaResult
      };

      // Verificar si el nuevo puntaje merece estar en el top 5
      let updatedLeaderboard = [...leaderboard];

      if (leaderboard.length < 5) {
        // Si hay menos de 5 entradas, agregar directamente
        updatedLeaderboard.push(newEntry);
      } else {
        // Si ya hay 5 entradas, verificar si el nuevo puntaje es mejor que el último
        const sortedLeaderboard = [...leaderboard].sort((a, b) => b.rating - a.rating);
        const lowestScore = sortedLeaderboard[4].rating; // El último (5to lugar)

        if (fachaResult.rating > lowestScore) {
          // El nuevo puntaje es mejor que el último, reemplazar
          updatedLeaderboard = sortedLeaderboard.slice(0, 4); // Tomar los primeros 4
          updatedLeaderboard.push(newEntry); // Agregar el nuevo
        }
        // Si no es mejor, no hacer nada (no se guarda)
      }

      // Ordenar por puntaje descendente
      updatedLeaderboard = updatedLeaderboard.sort((a, b) => b.rating - a.rating);

      setLeaderboard(updatedLeaderboard);

      try {
        localStorage.setItem('onlyFachasLeaderboard', JSON.stringify(updatedLeaderboard));
      } catch (error) {
        console.warn('localStorage quota exceeded, clearing old data...');
        // Limpiar datos antiguos y reintentar
        localStorage.removeItem('onlyFachasLeaderboard');
        localStorage.removeItem('onlyfachas_requests');
        localStorage.removeItem('onlyFachas_ageVerified');
        localStorage.removeItem('onlyFachas_ageVerifiedExpiry');
        localStorage.removeItem('onlyFachas_cache');
        localStorage.removeItem('onlyFachas_rateLimit');

        // Guardar solo las últimas 5 entradas (top 5)
        const limitedLeaderboard = updatedLeaderboard.slice(0, 5);
        localStorage.setItem('onlyFachasLeaderboard', JSON.stringify(limitedLeaderboard));
        setLeaderboard(limitedLeaderboard);
      }

      console.log('🎯 [APP] Estableciendo resultado y cambiando estado...');
      setResult(fachaResult);
      setAppState('result');
      console.log('✅ [APP] Estado cambiado a result, resultado establecido');

      // Reproducir audio según el puntaje
      playFachaAudio(fachaResult.rating);

    } catch (err: any) {
      console.error(err);

      // Mostrar error específico si es rate limiting
      if (err.message && err.message.includes('Esperá')) {
        showNotificationToast('warning', 'Muy rápido', err.message);
      } else {
        setError("Upa, se rompió todo. Capaz tu facha es tan GOD que bugueó la IA. Probá de una con otra foto.");
        setAppState('error');
      }
    } finally {
      setIsLoading(false);
      setIsAnalyzing(false);
    }
  }, [imageData, aiMode, name, leaderboard, isRateLimited, timeUntilNextRequest, callApi, haptic]);

  const analyzeFachaBattle = useCallback(async () => {
    if (!imageData1 || !imageData2) {
      setError("Faltan contendientes para la batalla, che.");
      setAppState('error');
      return;
    }

    // Verificar controles de emergencia
    if (isMaintenanceMode) {
      setShowMaintenanceBanner(true);
      return;
    }

    if (!checkRateLimit()) {
      setShowRateLimitBanner(true);
      return;
    }

    // Aplicar delay si está configurado
    if (requestDelay > 0) {
      setShowRequestDelayBanner(true);
      await new Promise(resolve => setTimeout(resolve, requestDelay));
      setShowRequestDelayBanner(false);
    }

    setIsLoading(true);
    setError(null);
    setBattleResult(null);
    try {
      // Incrementar contador de requests
      incrementRequestCount();

      // Usar el hook con fallback automático
      const result = await callApi(getFachaBattleResult, imageData1, imageData2, aiMode);
      setBattleResult(result);
      setAppState('battleResult');

      // Reproducir audio de batalla
      playBattleAudio(result.winner, result.score1, result.score2);

    } catch (err: any) {
      console.error(err);

      // Mostrar error específico si es rate limiting
      if (err.message && err.message.includes('Esperá')) {
        showNotificationToast('warning', 'Muy rápido', err.message);
      } else {
        setError("La IA no pudo decidir, la facha es demasiada. Intentá con otras fotos.");
        setAppState('error');
      }
    } finally {
      setIsLoading(false);
    }
  }, [imageData1, imageData2, aiMode, isRateLimited, timeUntilNextRequest, callApi]);

  const reset = () => {
    // Resetting app state...

    try {
      // Common
      setError(null);
      setIsLoading(false);
      setShowSettings(false);

      // Single / Enhance
      setImageSrc(null);
      setImageData(null);
      setResult(null);
      setEnhancedResult(null);
      setName('');
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Battle
      setImageSrc1(null);
      setImageData1(null);
      setImageSrc2(null);
      setImageData2(null);
      setBattleResult(null);
      setActiveBattleSlot(null);
      if (fileInputRef1.current) fileInputRef1.current.value = "";
      if (fileInputRef2.current) fileInputRef2.current.value = "";

      // Leaderboard
      setSelectedLeaderboardResult(null);

      // Reset to initial state - Force immediate update
      setAppMode('single');
      setAppState('welcome');

      // App state reset completed
    } catch (error) {
      console.error('❌ Error during reset:', error);
    }
  };

  const clearLeaderboard = () => {
    if (window.confirm("¿Estás seguro de que querés borrar a todos los fachas? Esta acción no se puede deshacer.")) {
      // Update state first for immediate UI feedback
      setLeaderboard([]);

      // Then, remove from persistent storage
      try {
        localStorage.removeItem('onlyFachasLeaderboard');
      } catch (e) {
        console.error("No se pudo borrar el leaderboard:", e);
        setError("Hubo un error al intentar borrar el top de fachas.");
        setAppState('error');
      }
    }
  };

  const clearAllLocalStorage = () => {
    // Limpiar todos los datos de OnlyFachas del localStorage
    const keysToRemove = [
      'onlyFachasLeaderboard',
      'onlyfachas_requests',
      'onlyFachas_ageVerified',
      'onlyFachas_ageVerifiedExpiry',
      'onlyFachas_cache',
      'onlyFachas_rateLimit'
    ];

    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn(`Error removing ${key}:`, error);
      }
    });

    // Resetear estados
    setLeaderboard([]);
    console.log('localStorage cleared successfully');
  };

  const handleLeaderboardResultClick = (entry: StoredFachaResult) => {
    setSelectedLeaderboardResult(entry);
    setAppState('result');
  };

  // Función para reproducir audio según el puntaje con rotación
  const playFachaAudio = (rating: number) => {
    const audioFile = selectFachaAudio(rating, lastPlayedAudio);
    setLastPlayedAudio(audioFile);
    playEffect(audioFile);
  };

  // Función para reproducir audio de batalla con rotación
  const playBattleAudio = (winner: 1 | 2, score1: number, score2: number) => {
    const audioFile = selectBattleAudio(winner, score1, score2, lastPlayedBattleAudio);
    setLastPlayedBattleAudio(audioFile);
    playEffect(audioFile);
  };


  // Notification functions
  const showNotificationToast = (type: 'error' | 'warning' | 'info' | 'success', title: string, message: string) => {
    setNotificationContent({ type, title, message });
    setShowNotification(true);
  };

  const hideNotificationToast = () => {
    setShowNotification(false);
  };

  const renderContent = () => {






    if (isLoading) {
      return (
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-violet-300 animate-pulse">
            {appMode === 'battle' ? 'Analizando batalla...' : 'Analizando facha...'}
          </p>
        </div>
      );
    }

    if (showSettings) {
      return (
        <SettingsView
          musicEnabled={musicEnabled}
          effectsEnabled={effectsEnabled}
          musicVolume={musicVolume}
          effectsVolume={effectsVolume}
          setMusicEnabled={setMusicEnabled}
          setEffectsEnabled={setEffectsEnabled}
          setMusicVolume={setMusicVolume}
          setEffectsVolume={setEffectsVolume}
          aiMode={aiMode}
          setAiMode={setAiMode}
          setShowSettings={setShowSettings}
        />
      );
    }

    switch (appState) {
      case 'welcome':
        return (
          <WelcomeView
            setAppMode={setAppMode}
            setAppState={setAppState}
            setShowSettings={setShowSettings}
          />
        );

      case 'select':
        return (
          <SelectModeView
            appMode={appMode}
            setAppState={setAppState}
            fileInputRef={fileInputRef}
            handleImageUpload={handleImageUpload}
            reset={reset}
          />
        );

      case 'capture':
        return (
          <WebcamCapture
            onCapture={handleWebcamCapture}
            onCancel={() => setAppState('select')}
          />
        );

      case 'analyze':
        return (
          <ImageView
            imageSrc={imageSrc}
            showSkeleton={showSkeleton}
            name={name}
            setName={setName}
            analyzeFacha={analyzeFacha}
            reset={reset}
          />
        );

      case 'result':
        return (
          <ResultView
            result={result}
            imageSrc={imageSrc}
            isFromLeaderboard={!!selectedLeaderboardResult}
            isAnalyzing={isAnalyzing}
            onBackToLeaderboard={() => { setSelectedLeaderboardResult(null); setAppState('leaderboard'); }}
            onReset={reset}
          />
        );

      case 'error':
        return (
          <ErrorView
            error={error}
            reset={reset}
          />
        );

      case 'battleSelect':
        return (
          <BattleSelectView
            imageSrc1={imageSrc1}
            imageSrc2={imageSrc2}
            imageData1={imageData1}
            imageData2={imageData2}
            setActiveBattleSlot={setActiveBattleSlot}
            setAppState={setAppState}
            fileInputRef1={fileInputRef1}
            fileInputRef2={fileInputRef2}
            onImageUpload={handleImageUpload}
            onAnalyze={analyzeFachaBattle}
            onReset={reset}
          />
        );

      case 'battleResult':
        return (
          <BattleResultView
            battleResult={battleResult}
            imageSrc1={imageSrc1}
            imageSrc2={imageSrc2}
            onReset={reset}
          />
        );

      case 'enhancing':
        return (
          <div className="text-center">
            <Loader />
            <p className="mt-4 text-violet-300 animate-pulse">Mejorando facha...</p>
          </div>
        );

      case 'enhanceResult':
        return (
          <EnhanceView
            enhancedResult={enhancedResult}
            imageSrc={imageSrc}
            setEnhancedResult={setEnhancedResult}
            setImageData={setImageData}
            setImageSrc={setImageSrc}
            setAppState={setAppState}
            onReset={reset}
          />
        );

      case 'leaderboard':
        return (
          <LeaderboardView
            leaderboard={leaderboard}
            handleLeaderboardResultClick={handleLeaderboardResultClick}
            onReset={reset}
            clearLeaderboard={clearLeaderboard}
            clearAllLocalStorage={clearAllLocalStorage}
          />
        );

      case 'privacy':
        return <PrivacyView onReset={reset} />;

      case 'terms':
        return <TermsView onReset={reset} />;

      case 'comingSoon':
        return <ComingSoonView onReset={reset} setAppState={setAppState} />;

      case 'about':
        return <AboutView onReset={reset} setAppState={setAppState} />;

      case 'faq':
        return <FaqView onReset={reset} setAppState={setAppState} />;

      default:
        return (
          <WelcomeView
            setAppMode={setAppMode}
            setAppState={setAppState}
            setShowSettings={setShowSettings}
          />
        );
    }
  };

  const containerClasses = appState === 'welcome'
    ? "w-full min-h-[300px] sm:min-h-[400px] flex items-center justify-center p-4 sm:p-6 md:p-8 rounded-2xl fade-in transition-all duration-500"
    : "w-full min-h-[300px] sm:min-h-[400px] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-900/50 backdrop-blur-sm border border-violet-500/30 rounded-2xl neon-shadow-purple fade-in transition-all duration-500";

  return (
    <Layout
      onReset={reset}
      onNavigate={setAppState}
      containerClasses={containerClasses}
      showNotification={showNotification}
      notificationContent={notificationContent}
      onCloseNotification={hideNotificationToast}
      showMaintenanceBanner={showMaintenanceBanner}
      showRateLimitBanner={showRateLimitBanner}
      showRequestDelayBanner={showRequestDelayBanner}
      onCloseMaintenanceBanner={() => setShowMaintenanceBanner(false)}
      onCloseRateLimitBanner={() => setShowRateLimitBanner(false)}
      onCloseRequestDelayBanner={() => setShowRequestDelayBanner(false)}
      remainingRequests={remainingRequests}
      maxRequests={maxRequestsPerHour}
      requestDelay={requestDelay}
      devSettings={devSettings}
      onCloseDevMenu={closeDevMenu}
      onToggleMockData={toggleMockData}
      onSetForceScore={setForceScore}
      onResetDevSettings={resetDevSettings}
    >
      <Suspense fallback={<Loader />}>
        {renderContent()}
      </Suspense>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AudioProvider>
      <AppContent />
    </AudioProvider>
  );
};

export default App;
