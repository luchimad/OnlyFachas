
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FachaResult, FachaBattleResult, FachaEnhanceResult, StoredFachaResult, AiMode } from '../types';
import './animations.css';
import { getFachaScore, getFachaBattleResult, getEnhancedFacha } from '../services/geminiService';
import WebcamCapture from '../components/WebcamCapture';
import FachaStats from '../components/FachaStats';
import Loader from '../components/Loader';
import AdBanner from '../components/AdBanner';
import NotificationToast from '../components/NotificationToast';
import MinimalLoader from '../components/MinimalLoader';
import { useApiWithFallback } from './hooks/useApiWithFallback';
import { useHapticFeedback } from './hooks/useHapticFeedback';
import { useEmergencyControls } from './hooks/useEmergencyControls';
import { useAudioControls } from './hooks/useAudioControls';
import { useAgeVerification } from './hooks/useAgeVerification';
import useDevMode from './hooks/useDevMode';
import DevModeMenu from './components/DevModeMenu';
import { setDevModeSettings, setAnalyticsTracker, setSuccessfulAnalysisTracker, setFailedAnalysisTracker } from '../services/geminiService';
import { setDevModeTracker, setMockModeToggleTracker, setForcedScoreTracker } from './hooks/useDevMode';
import useAnalytics from './hooks/useAnalytics';
import { getScoreColor, getFachaTier } from './utils/fachaUtils';
import { selectFachaAudio, selectBattleAudio } from './utils/audioUtils';
import { UploadIcon, CameraIcon, ZapIcon, RefreshCwIcon, AlertTriangleIcon, CheckCircle2, XCircle, TrophyIcon, SettingsIcon, SparklesIcon, Trash2Icon, InstagramIcon } from '../components/Icons';
import { AudioSettings } from './components/AudioSettings';
import { FiVolume2, FiVolumeX } from "react-icons/fi";
import { FiTrendingUp, FiUsers } from "react-icons/fi";
import { MaintenanceBanner, RateLimitBanner, RequestDelayBanner } from './components/EmergencyBanners';
import ShareButton from './components/ShareButton';

type AppMode = 'single' | 'battle' | 'enhance';
type AppState = 'welcome' | 'select' | 'capture' | 'analyze' | 'result' | 'error' | 'battleSelect' | 'battleResult' | 'enhancing' | 'enhanceResult' | 'leaderboard' | 'privacy' | 'terms' | 'comingSoon' | 'about' | 'faq';



// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<{base64: string, mimeType: string}> => {
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

const App: React.FC = () => {
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
  const [imageData, setImageData] = useState<{base64: string, mimeType: string} | null>(null);
  const [result, setResult] = useState<FachaResult | null>(null);
  
  // QoL states
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultContainerRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState<string>('');
  
  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<StoredFachaResult[]>([]);
  const [selectedLeaderboardResult, setSelectedLeaderboardResult] = useState<StoredFachaResult | null>(null);
  
  // Audio controls hook
  const {
    musicEnabled,
    effectsEnabled,
    musicVolume,
    effectsVolume,
    setMusicEnabled,
    setEffectsEnabled,
    setMusicVolume,
    setEffectsVolume,
    playEffect
  } = useAudioControls();
  
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
  const [imageData1, setImageData1] = useState<{base64: string, mimeType: string} | null>(null);
  const [imageSrc2, setImageSrc2] = useState<string | null>(null);
  const [imageData2, setImageData2] = useState<{base64: string, mimeType: string} | null>(null);
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
            
            // Limitar a 50 entradas máximo
            const limitedData = cleanedData.slice(0, 50);
            
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

  const runFachaEnhancement = useCallback(async (currentImageData: {base64: string, mimeType: string}) => {
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

      const updatedLeaderboard = [...leaderboard, newEntry]
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 50); // Limitar a 50 entradas máximo
      
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
        
        // Guardar solo las últimas 20 entradas
        const limitedLeaderboard = updatedLeaderboard.slice(0, 20);
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

  const NeonButton: React.FC<{onClick?: () => void, children: React.ReactNode, className?: string, disabled?: boolean}> = ({ onClick, children, className = '', disabled = false }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 transition-all duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : 'group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white focus:ring-4 focus:outline-none focus:ring-purple-200'} ${className}`}
    >
      <span className="relative w-full px-5 py-2.5 transition-all ease-in duration-75 bg-slate-900/30 backdrop-blur-sm rounded-md group-hover:bg-opacity-0 flex items-center justify-center gap-2 text-white font-bold group-hover:text-white drop-shadow-lg">
        {children}
      </span>
    </button>
  );




  const renderWelcomeView = () => (
    <div className="text-center flex flex-col items-center">
      {/* Botones de arriba - principales */}
      <div className="flex flex-col items-center gap-4 w-full max-w-md">
        <NeonButton 
          onClick={() => { setAppMode('single'); setAppState('select'); }} 
          className="w-full text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 mobile-button hover:scale-105 hover:shadow-[0_0_25px_theme('colors.fuchsia.500'),0_0_50px_theme('colors.purple.700')]"
        >
          <ZapIcon /> Analizame la facha
        </NeonButton>
        
        <NeonButton 
          onClick={() => { setAppMode('battle'); setAppState('battleSelect'); }}
          className="w-full text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 mobile-button bg-gradient-to-br from-red-500 to-red-600 group-hover:from-red-500 group-hover:to-red-600 hover:shadow-[0_0_25px_theme('colors.red.500'),0_0_50px_theme('colors.red.600')]"
        >
          <FiUsers className="w-5 h-5" /> ⚔️ Facha vs Facha ⚔️
        </NeonButton>
      </div>
      
      {/* Botones de abajo - Secundarios */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md mt-6">
        <NeonButton 
          onClick={() => setAppState('leaderboard')}
          className="w-full sm:w-1/2 text-base sm:text-lg px-4 sm:px-6 py-3 sm:py-4 mobile-button bg-gradient-to-br from-yellow-400 to-orange-500 group-hover:from-yellow-400 group-hover:to-orange-500 focus:ring-yellow-300 hover:shadow-[0_0_25px_theme('colors.yellow.400'),0_0_50px_theme('colors.orange.600')]"
        >
          <FiTrendingUp className="w-5 h-5" /> Top Fachas
        </NeonButton>
        
        <button
          onClick={() => setAppState('comingSoon')}
          className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium rounded-lg group bg-gradient-to-br from-gray-500 to-gray-600 transition-all duration-300 w-full sm:w-1/2 text-base sm:text-lg px-4 sm:px-6 py-3 sm:py-4 mobile-button hover:scale-105 hover:shadow-[0_0_25px_theme('colors.gray.500'),0_0_50px_theme('colors.gray.600')]"
        >
          <span className="relative w-full px-5 py-2.5 transition-all ease-in duration-75 bg-slate-900/30 backdrop-blur-sm rounded-md group-hover:bg-opacity-0 flex items-center justify-center gap-2 text-white font-bold group-hover:text-white drop-shadow-lg">
            <SparklesIcon /> Aumentá tu facha
          </span>
        </button>
      </div>
      
       <button 
        onClick={() => setShowSettings(true)}
        className="mt-6 text-sm text-violet-400 hover:text-white flex items-center gap-2"
      >
        <SettingsIcon className="w-4 h-4" /> Configurar IA
      </button>
    </div>
  );

  const renderSettingsView = () => (
    <div className="w-full max-w-md mx-auto text-center space-y-8">
        {/* Configuración de Audio */}
        <AudioSettings
          musicEnabled={musicEnabled}
          effectsEnabled={effectsEnabled}
          musicVolume={musicVolume}
          effectsVolume={effectsVolume}
          setMusicEnabled={setMusicEnabled}
          setEffectsEnabled={setEffectsEnabled}
          setMusicVolume={setMusicVolume}
          setEffectsVolume={setEffectsVolume}
        />
        
        {/* Configuración de IA */}
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 neon-text-fuchsia">Modelo de IA</h2>
          <p className="text-violet-300 mb-8">Elegí qué tan zarpada querés que sea la IA.</p>
          <div className="flex flex-col gap-4">
              <button
                  onClick={() => setAiMode('rapido')}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${aiMode === 'rapido' ? 'border-fuchsia-500 bg-fuchsia-500/10 neon-shadow-fuchsia' : 'border-violet-500/30 bg-slate-800/50 hover:bg-violet-500/10'}`}
              >
                  <h3 className="font-bold text-lg text-white">Rápido y Furioso</h3>
                  <p className="text-sm text-violet-300">Respuestas al toque. Ideal para ansiosos.</p>
              </button>
              <button
                  onClick={() => setAiMode('creativo')}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${aiMode === 'creativo' ? 'border-fuchsia-500 bg-fuchsia-500/10 neon-shadow-fuchsia' : 'border-violet-500/30 bg-slate-800/50 hover:bg-violet-500/10'}`}
              >
                  <h3 className="font-bold text-lg text-white">Modo Creativo</h3>
                  <p className="text-sm text-violet-300">Análisis más zarpado y original. Puede tardar un toque más.</p>
              </button>
          </div>
        </div>
        
        <NeonButton onClick={() => setShowSettings(false)} className="mt-8">
            Volver
        </NeonButton>
    </div>
);

  const renderSelectModeView = () => (
    <div className="text-center">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 neon-text-fuchsia">
        {appMode === 'enhance' ? 'Convertite en GigaChad' : '¿Qué onda tu facha?'}
      </h2>
      <p className="text-violet-300 mb-8 max-w-md mx-auto">
        {appMode === 'enhance' ? 'Subí tu mejor foto y dejá que la IA te transforme en una leyenda.' : 'Subí una foto o tirá una selfie para que nuestra IA te diga si tenés pinta. De una, sin vueltas.'}
      </p>
      
      {/* Aviso informativo */}
      <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 border border-yellow-500/30 rounded-lg p-4 mb-6 max-w-lg mx-auto">
        <div className="flex items-center justify-center gap-2 text-sm text-center">
          <span className="text-yellow-400">⚠️</span>
          <span className="text-yellow-300">Al continuar confirmo que no subiré imágenes explícitas y que tengo 18 años o más. OnlyFachas es solo para diversión: las fotos se procesan en el momento y no se guardan.</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        <NeonButton 
          onClick={() => { setAppState('capture'); }} 
        >
          <CameraIcon /> Activar Cámara
        </NeonButton>
        <NeonButton 
          onClick={() => fileInputRef.current?.click()} 
        >
           <UploadIcon /> Subir Foto
        </NeonButton>
      </div>
      
      
       <button 
         onClick={() => {
           reset();
         }} 
         className="mt-6 text-sm text-violet-400 hover:text-white transition-colors duration-200"
       >
         Volver
       </button>
      <input type="file" ref={fileInputRef} onChange={(e) => handleImageUpload(e, 'single')} accept="image/*" className="hidden" />
    </div>
  );

  const renderImageView = () => (
    <div className="w-full max-w-lg mx-auto text-center">
      <div className="mb-6 border-4 border-violet-500 rounded-lg overflow-hidden neon-shadow-purple">
        {showSkeleton ? (
          <div className="w-full h-64 flex items-center justify-center bg-slate-800/50">
            <MinimalLoader message="Procesando imagen..." />
          </div>
        ) : (
          <img src={imageSrc!} alt="User upload" className="w-full h-auto object-cover"/>
        )}
      </div>
       <div className="w-full mb-4">
        <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre o apodo para el Top"
            className="w-full px-4 py-3 bg-slate-800/70 border-2 border-violet-500/50 rounded-lg text-white placeholder-violet-300/60 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition-all text-center"
            aria-label="Ingresa tu nombre"
            maxLength={30}
        />
      </div>
     <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        <NeonButton onClick={analyzeFacha} className="w-full sm:w-auto" disabled={!name.trim()}>
          <ZapIcon /> Medir Facha
        </NeonButton>
        <NeonButton 
          onClick={() => {
            reset();
          }} 
          className="w-full sm:w-auto"
        >
           <RefreshCwIcon /> Probar de Nuevo
        </NeonButton>
     </div>
    </div>
  );
  
  const renderResultView = () => {
    // Usar resultado del leaderboard si está seleccionado, sino usar resultado normal
    const currentResult = selectedLeaderboardResult || result;
    const currentImageSrc = selectedLeaderboardResult?.imageSrc || imageSrc;
    const isFromLeaderboard = !!selectedLeaderboardResult;
    
    return currentResult && (
    <div ref={resultContainerRef} className="text-center w-full max-w-6xl mx-auto flex flex-col items-center">
        {/* Image Section - Centered on desktop, full width on mobile */}
        <div className="w-full mb-8">
            <h3 className="text-2xl font-bold mb-4 text-violet-300 text-center">
                {isFromLeaderboard ? `${selectedLeaderboardResult.name} - Análisis` : 'Tu Foto'}
            </h3>
            <div className="flex justify-center">
                <img src={currentImageSrc!} alt={isFromLeaderboard ? `Foto de ${selectedLeaderboardResult.name}` : "Tu foto analizada"} className="rounded-lg border-4 border-violet-500 neon-shadow-purple w-full max-w-md"/>
            </div>
            {isFromLeaderboard && (
                <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-violet-500/30 max-w-md mx-auto">
                    <p className="text-sm text-violet-300">
                        📅 Analizado el {new Date(selectedLeaderboardResult.timestamp).toLocaleDateString()}
                    </p>
                </div>
            )}
        </div>
        
        {/* Verdict Section - Full width and centered */}
        <div className="w-full flex flex-col items-center">
                <h2 className="text-4xl font-bold mb-8 neon-text-fuchsia">VEREDICTO</h2>
                
                {/* Score Display - Simple and Clean */}
                <div className="w-full flex flex-col items-center mb-8">
                  {isAnalyzing ? (
                    <MinimalLoader 
                      message="Analizando tu facha..." 
                      className="py-12"
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                      <span 
                        className="font-orbitron text-8xl md:text-9xl font-bold transition-all duration-1000"
                        style={{ 
                          color: getScoreColor(currentResult.rating),
                          textShadow: `0 0 20px ${getScoreColor(currentResult.rating)}`
                        }}
                      >
                        {currentResult.rating.toFixed(1)}
                      </span>
                      <p className="text-2xl font-bold text-gray-300 tracking-widest uppercase mt-2">
                        DE FACHA
                      </p>
                      <div className="mt-6 w-full max-w-lg text-center bg-slate-800/60 border-2 rounded-lg p-6"
                           style={{ 
                             borderColor: getScoreColor(currentResult.rating), 
                             boxShadow: `0 0 15px ${getScoreColor(currentResult.rating)}40` 
                           }}>
                        <p className="text-base uppercase tracking-widest text-violet-300/80 mb-3">
                          {isFromLeaderboard ? 'Rango de Facha' : 'Tu Rango de Facha'}
                        </p>
                        <p 
                          className="font-orbitron text-2xl font-bold"
                          style={{ color: getScoreColor(currentResult.rating) }}
                        >
                          {getFachaTier(currentResult.rating)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <p className="text-lg md:text-xl text-cyan-300 mt-8 p-4 bg-slate-800/50 border border-yellow-500/30 rounded-lg italic w-full">"{currentResult.comment}"</p>
                <div className="mt-8 w-full flex flex-col md:flex-row gap-6 text-left">
                    <div className="flex-1 bg-slate-800/50 p-4 rounded-lg border border-green-500/30"><h3 className="font-bold text-lg text-green-400 mb-3 flex items-center gap-2"><CheckCircle2 /> {isFromLeaderboard ? 'Puntos fuertes' : 'Tus puntos fuertes'}</h3><ul className="space-y-2 text-green-300/90">{currentResult.fortalezas.map((item, i) => <li key={i} className="flex items-start gap-2"><span className="mt-1">✅</span>{item}</li>)}</ul></div>
                    <div className="flex-1 bg-slate-800/50 p-4 rounded-lg border border-yellow-500/30"><h3 className="font-bold text-lg text-yellow-400 mb-3 flex items-center gap-2"><XCircle/> Para mejorar, pibe</h3><ul className="space-y-2 text-yellow-300/90">{currentResult.consejos.map((item, i) => <li key={i} className="flex items-start gap-2"><span className="mt-1">👉</span>{item}</li>)}</ul></div>
                </div>
                <FachaStats rating={currentResult.rating} />
                
                {/* Anuncio sutil después de estadísticas */}
                <AdBanner 
                  slot="9595760046" 
                  size="medium"
                  className="mt-6"
                />
        </div>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
            {isFromLeaderboard ? (
                <>
                    <NeonButton onClick={() => { setSelectedLeaderboardResult(null); setAppState('leaderboard'); }}>
                        <TrophyIcon /> Volver al Top
                    </NeonButton>
                    <NeonButton onClick={reset}><RefreshCwIcon /> Nuevo Análisis</NeonButton>
                </>
            ) : (
                <>
                    <NeonButton onClick={reset}><RefreshCwIcon /> Otra vez</NeonButton>
                    {currentResult && currentImageSrc && (
                        <ShareButton
                            result={currentResult}
                            imageSrc={currentImageSrc}
                            className="w-full sm:w-auto"
                        />
                    )}
                </>
            )}
        </div>
        
    </div>
  );
  };
  
  const renderErrorView = () => (
      <div className="text-center text-red-400 bg-red-900/50 p-6 rounded-lg border border-red-500">
        <AlertTriangleIcon className="mx-auto mb-4" />
        <p className="font-bold text-lg">¡Upa! Algo salió mal</p>
        <p>{error}</p>
        <NeonButton 
          onClick={() => {
            reset();
          }} 
          className="mt-6"
        >
          <RefreshCwIcon /> Intentar de nuevo
        </NeonButton>
      </div>
  );



  const renderBattleSelectView = () => (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center battle-container">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 neon-text-fuchsia">⚔️ Facha vs Facha ⚔️</h2>
        <p className="text-violet-300 mb-8 text-center text-lg max-w-2xl">
          La batalla más épica de la historia. Subí dos fotos y que la IA decida quién la rompe más. 
          <span className="text-cyan-400 font-bold"> ¡Spoiler: va a estar re picante!</span>
        </p>
        
        {/* Aviso informativo */}
        <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 border border-yellow-500/30 rounded-lg p-4 mb-6 max-w-lg mx-auto">
          <div className="flex items-center justify-center gap-2 text-sm text-center">
            <span className="text-yellow-400">⚠️</span>
            <span className="text-yellow-300">Al continuar confirmo que no subiré imágenes explícitas y que tengo 18 años o más. OnlyFachas es solo para diversión: las fotos se procesan en el momento y no se guardan.</span>
          </div>
        </div>
        
        <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12 mb-8">
            {/* Contendiente 1 */}
            <div className="w-full lg:w-1/3 flex flex-col items-center">
                <div className="w-full h-80 battle-image-container bg-slate-800/50 border-2 border-dashed border-violet-500/50 rounded-xl flex items-center justify-center overflow-hidden relative group hover:border-fuchsia-500/70 transition-all duration-300">
                    {imageSrc1 ? (
                        <div className="relative w-full h-full">
                            <img src={imageSrc1} alt="Contendiente 1" className="w-full h-full object-cover rounded-lg" />
                            <div className="absolute top-2 left-2 bg-fuchsia-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                                Contendiente 1
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="text-6xl mb-4">🥊</div>
                            <span className="text-violet-400 text-lg font-bold">Contendiente 1</span>
                            <p className="text-violet-300/60 text-sm mt-2">Subí una foto o usa la cámara</p>
                        </div>
                    )}
                </div>
                <div className="flex gap-3 mt-4">
                    <NeonButton 
                        onClick={() => { setActiveBattleSlot(1); setAppState('capture'); }}
                        className="bg-gradient-to-br from-cyan-400 to-blue-500 group-hover:from-cyan-400 group-hover:to-blue-500"
                    >
                        <CameraIcon /> Cámara
                    </NeonButton>
                    <NeonButton 
                        onClick={() => fileInputRef1.current?.click()}
                        className="bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500"
                    >
                        <UploadIcon /> Subir
                    </NeonButton>
                </div>
            </div>

            {/* VS Divider */}
            <div className="flex flex-col items-center gap-4">
                <div className="font-orbitron text-4xl sm:text-5xl lg:text-6xl text-fuchsia-500 animate-pulse battle-vs-text">
                    VS
                </div>
                <div className="text-2xl">⚔️</div>
                <div className="text-violet-300 text-sm text-center max-w-32">
                  La batalla más épica
                </div>
            </div>

            {/* Contendiente 2 */}
            <div className="w-full lg:w-1/3 flex flex-col items-center">
                <div className="w-full h-80 battle-image-container bg-slate-800/50 border-2 border-dashed border-violet-500/50 rounded-xl flex items-center justify-center overflow-hidden relative group hover:border-fuchsia-500/70 transition-all duration-300">
                    {imageSrc2 ? (
                        <div className="relative w-full h-full">
                            <img src={imageSrc2} alt="Contendiente 2" className="w-full h-full object-cover rounded-lg" />
                            <div className="absolute top-2 left-2 bg-fuchsia-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                                Contendiente 2
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="text-6xl mb-4">🥊</div>
                            <span className="text-violet-400 text-lg font-bold">Contendiente 2</span>
                            <p className="text-violet-300/60 text-sm mt-2">Subí una foto o usa la cámara</p>
                        </div>
                    )}
                </div>
                <div className="flex gap-3 mt-4">
                    <NeonButton 
                        onClick={() => { setActiveBattleSlot(2); setAppState('capture'); }}
                        className="bg-gradient-to-br from-cyan-400 to-blue-500 group-hover:from-cyan-400 group-hover:to-blue-500"
                    >
                        <CameraIcon /> Cámara
                    </NeonButton>
                    <NeonButton 
                        onClick={() => fileInputRef2.current?.click()}
                        className="bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500"
                    >
                        <UploadIcon /> Subir
                    </NeonButton>
                </div>
            </div>
        </div>

        <div className="flex flex-col items-center gap-4">
            <NeonButton 
                onClick={analyzeFachaBattle} 
                disabled={!imageData1 || !imageData2}
                className="text-xl px-8 py-4 bg-gradient-to-br from-red-500 to-pink-500 group-hover:from-red-500 group-hover:to-pink-500 hover:scale-105 transition-transform"
            >
                <ZapIcon /> 🔥 INICIAR BATALLA 🔥
            </NeonButton>
            
            
            {(!imageData1 || !imageData2) && (
                <p className="text-violet-300/60 text-sm text-center">
                  {!imageData1 && !imageData2 ? 'Subí las dos fotos para comenzar la batalla' : 
                   !imageData1 ? 'Falta la foto del Contendiente 1' : 'Falta la foto del Contendiente 2'}
                </p>
            )}
            
            <button onClick={reset} className="mt-4 text-sm text-violet-400 hover:text-white transition-colors">
              ← Volver al Menú Principal
            </button>
        </div>

        <input type="file" ref={fileInputRef1} onChange={(e) => handleImageUpload(e, 1)} accept="image/*" className="hidden" />
        <input type="file" ref={fileInputRef2} onChange={(e) => handleImageUpload(e, 2)} accept="image/*" className="hidden" />
    </div>
  );

  const renderBattleResultView = () => battleResult && (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center text-center battle-container">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8 neon-text-fuchsia">🏆 VEREDICTO FINAL 🏆</h2>
        
        {/* Battle Results */}
        <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-8 mb-12">
            {[1, 2].map(slot => {
                const isWinner = battleResult.winner === slot;
                const imageSrc = slot === 1 ? imageSrc1 : imageSrc2;
                const score = slot === 1 ? battleResult.score1 : battleResult.score2;
                const scoreColor = getScoreColor(score);
                
                return (
                    <div key={slot} className={`relative w-full lg:w-1/3 flex flex-col items-center transition-all duration-700 ${isWinner ? 'scale-105' : 'scale-100'}`}>
                        {/* Winner Crown */}
                        {isWinner && (
                            <div className="absolute -top-4 z-20 text-6xl animate-bounce">
                                👑
                            </div>
                        )}
                        
                        {/* Image Container */}
                        <div className={`relative border-4 rounded-2xl overflow-hidden transition-all duration-500 ${
                            isWinner 
                                ? 'border-yellow-400 shadow-[0_0_30px_theme(colors.yellow.400)]' 
                                : 'border-violet-500'
                        }`}>
                            <img src={imageSrc!} alt={`Contendiente ${slot}`} className="w-full h-80 battle-result-image object-cover" />
                            
                            {/* Score Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                <div className="text-center">
                                    <span 
                                        className={`font-orbitron font-bold text-4xl battle-score ${isWinner ? 'text-yellow-300' : 'text-white'}`} 
                                        style={{
                                            textShadow: isWinner ? '0 0 15px #facc15' : '0 0 8px #000',
                                            color: isWinner ? '#facc15' : scoreColor
                                        }}
                                    >
                                        {score.toFixed(1)}
                                    </span>
                                    <p className="text-sm text-gray-300 mt-1">DE FACHA</p>
                                </div>
                            </div>
                            
                            {/* Winner Badge */}
                            {isWinner && (
                                <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded-full font-bold text-sm animate-pulse">
                                    🥇 GANADOR
                                </div>
                            )}
                        </div>
                        
                        {/* Player Info */}
                        <div className="mt-6 text-center">
                            <p className={`text-2xl font-bold ${isWinner ? 'text-yellow-300' : 'text-violet-300'}`}>
                                {isWinner ? '🏆 CAMPEÓN 🏆' : `Contendiente ${slot}`}
                            </p>
                            {isWinner && (
                                <p className="text-yellow-400 text-lg mt-2 animate-pulse">
                                    ¡La rompió toda!
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Battle Comment */}
        <div className="w-full max-w-4xl mb-8">
            <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 border-cyan-500/50 rounded-2xl p-6 backdrop-blur-sm battle-comment">
                <div className="text-4xl mb-4">💬</div>
                <p className="text-xl md:text-2xl text-cyan-300 italic leading-relaxed">
                    "{battleResult.comment}"
                </p>
                <div className="text-cyan-400/60 text-sm mt-4">
                  - La IA después de ver esta batalla épica
                </div>
            </div>
        </div>

        {/* Winner Explanation */}
        {battleResult.winnerExplanation && battleResult.winnerExplanation.length > 0 && (
            <div className="w-full max-w-4xl mb-8">
                <div className="bg-gradient-to-r from-yellow-800/60 to-orange-800/60 border-2 border-yellow-500/50 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="text-4xl mb-4">🔥</div>
                    <h3 className="text-2xl md:text-3xl font-bold text-yellow-300 mb-6">
                        ¿Por qué la Persona {battleResult.winner} detona más?
                    </h3>
                    <div className="space-y-4">
                        {battleResult.winnerExplanation.map((explanation, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold text-sm">
                                    {index + 1}
                                </div>
                                <p className="text-lg text-yellow-200 leading-relaxed">
                                    {explanation}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="text-yellow-400/60 text-sm mt-4">
                      - Análisis detallado de la IA sobre por qué ganó
                    </div>
                </div>
            </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <NeonButton 
                onClick={() => { setBattleResult(null); setImageData1(null); setImageSrc1(null); setImageData2(null); setImageSrc2(null); setAppState('battleSelect'); }}
                className="bg-gradient-to-br from-orange-500 to-red-500 group-hover:from-orange-500 group-hover:to-red-500 text-lg px-6 py-3"
            >
                <RefreshCwIcon /> 🔥 Otra Batalla 🔥
            </NeonButton>
            <NeonButton 
                onClick={reset}
                className="bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 text-lg px-6 py-3"
            >
                🏠 Menú Principal
            </NeonButton>
        </div>
    </div>
  );

  const renderEnhanceResultView = () => enhancedResult && (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 neon-text-fuchsia">¡Mirá lo que sos ahora!</h2>
        <div className="w-full flex flex-col md:flex-row items-start justify-center gap-8 mb-8">
            <div className="w-full md:w-1/2 flex flex-col items-center">
                <h3 className="text-2xl font-bold mb-4 text-violet-300">Antes</h3>
                <img src={imageSrc!} alt="Foto original" className="rounded-lg border-4 border-violet-500 w-full" />
            </div>
            <div className="w-full md:w-1/2 flex flex-col items-center">
                <h3 className="text-2xl font-bold mb-4 text-cyan-400">Después (GigaChad)</h3>
                <img 
                    src={`data:${enhancedResult.newImageMimeType};base64,${enhancedResult.newImageBase64}`} 
                    alt="Foto mejorada" 
                    className="rounded-lg border-4 border-cyan-400 neon-shadow-fuchsia w-full" 
                />
            </div>
        </div>
        <p className="text-lg md:text-xl text-cyan-300 mt-4 p-4 bg-slate-800/50 border border-yellow-500/30 rounded-lg italic w-full">
            "{enhancedResult.comment}"
        </p>
        <div className="flex gap-4 mt-8">
            <NeonButton onClick={() => { setEnhancedResult(null); setImageData(null); setImageSrc(null); setAppState('select'); }}>
                <RefreshCwIcon /> Probar con otra
            </NeonButton>
            <NeonButton onClick={reset}>Menú Principal</NeonButton>
        </div>
    </div>
  );
  
  const renderLeaderboardView = () => (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 neon-text-fuchsia flex items-center gap-2 sm:gap-3">
            <TrophyIcon className="w-8 h-8 sm:w-10 sm:h-10" /> Top Fachas
        </h2>
        {leaderboard.length > 0 ? (
            <div className="w-full space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {leaderboard.map((entry, index) => (
                    <div 
                        key={entry.id} 
                        onClick={() => handleLeaderboardResultClick(entry)}
                        className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-lg border border-violet-500/20 w-full transition-all hover:bg-slate-800 hover:border-fuchsia-500 cursor-pointer hover:scale-[1.02] active:scale-[0.98] group"
                        title="Tocá para ver el análisis completo"
                    >
                        <span className="font-orbitron text-2xl font-bold text-fuchsia-400 w-12 text-center">#{index + 1}</span>
                        <img src={entry.imageSrc} alt={entry.name} className="w-16 h-16 rounded-full object-cover border-2 border-violet-400 group-hover:border-fuchsia-400 transition-colors" />
                        <div className="flex-grow">
                            <p className="font-bold text-lg text-white truncate group-hover:text-fuchsia-300 transition-colors">{entry.name}</p>
                            <p className="text-sm text-violet-300 group-hover:text-violet-200 transition-colors">Clasificó el {new Date(entry.timestamp).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-orbitron text-3xl font-bold group-hover:scale-110 transition-transform" style={{ color: getScoreColor(entry.rating), textShadow: `0 0 8px ${getScoreColor(entry.rating)}` }}>
                                {entry.rating.toFixed(1)}
                            </p>
                            <p className="text-xs text-violet-400 uppercase group-hover:text-violet-200 transition-colors">de Facha</p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-fuchsia-400 text-sm font-bold">
                            👆 Ver análisis
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-violet-300 text-lg text-center mt-8">
                Todavía no hay nadie en el top. ¡Sé el primero en medir tu facha!
            </p>
        )}
        
        {/* Anuncio en el leaderboard */}
        <AdBanner 
          slot="6322234604" 
          size="medium"
          className="my-6"
        />
        
        <div className="mt-8 flex items-center gap-6">
            <NeonButton onClick={reset}>
                Menú Principal
            </NeonButton>
            {leaderboard.length > 0 && (
                 <button
                    onClick={clearLeaderboard}
                    className="flex items-center gap-2 text-red-400 hover:text-red-300 hover:scale-105 transition-transform"
                >
                    <Trash2Icon /> Borrar Top
                </button>
            )}
            <button
                onClick={clearAllLocalStorage}
                className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 hover:scale-105 transition-transform text-sm"
                title="Limpiar todos los datos guardados (útil si hay problemas de almacenamiento)"
            >
                <Trash2Icon /> Limpiar Datos
            </button>
        </div>
    </div>
  );

  const renderPrivacyView = () => (
    <div className="w-full max-w-4xl mx-auto text-left">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 neon-text-fuchsia text-center">
            Política de Privacidad
        </h2>
        <div className="space-y-6 text-violet-300/90 leading-relaxed">
            <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 border-cyan-500/50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-cyan-300 mb-4">1. Aclaración Importante</h3>
                <p className="text-violet-300/90 leading-relaxed">
                    La palabra <span className="text-cyan-400 font-bold">"facha"</span> se usa únicamente en el sentido argentino de fachero/estilo, sin relación con política o ideologías.
                    Se refiere a apariencia o "pinta" de una persona, nunca a creencias ni posicionamientos.
                </p>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30">
                <h3 className="text-xl font-bold text-violet-200 mb-4">2. Resumen</h3>
                <p>
                    OnlyFachas respeta tu privacidad.
                    Procesamos las imágenes solo para generar un puntaje de facha en tiempo real.
                    No almacenamos, guardamos ni compartimos las fotos ni los resultados.
                </p>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30">
                <h3 className="text-xl font-bold text-violet-200 mb-4">3. Procesamiento de Imágenes</h3>
                <p className="mb-4">
                    Las fotos se envían de manera temporal a los servicios de inteligencia artificial de Google Gemini.
                </p>
                <ul className="list-disc list-inside space-y-2 text-violet-300/80">
                    <li>Se utilizan únicamente para calcular el puntaje.</li>
                    <li>No se guardan en nuestros servidores.</li>
                    <li>Se eliminan automáticamente después del análisis.</li>
                    <li>No se comparten con terceros.</li>
                </ul>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30">
                <h3 className="text-xl font-bold text-violet-200 mb-4">4. Datos Técnicos</h3>
                <p className="mb-4">
                    Podemos recopilar datos de uso anónimos para estadísticas, publicidad y mejora de la experiencia, como:
                </p>
                <ul className="list-disc list-inside space-y-2 text-violet-300/80">
                    <li>Cookies y datos de navegación.</li>
                    <li>Tiempo de permanencia en la aplicación.</li>
                    <li>Páginas visitadas.</li>
                    <li>Información básica del dispositivo (tipo, navegador).</li>
                </ul>
                <p className="text-violet-300/80 mt-4">
                    Estos datos no identifican a una persona de forma directa.
                </p>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30">
                <h3 className="text-xl font-bold text-violet-200 mb-4">5. Servicios de Terceros</h3>
                <p className="mb-4">
                    Al usar OnlyFachas aceptás que algunos datos de navegación sean tratados por terceros bajo sus propias políticas:
                </p>
                <ul className="list-disc list-inside space-y-2 text-violet-300/80">
                    <li><strong>Google Gemini:</strong> procesamiento de imágenes.</li>
                    <li><strong>Google AdSense:</strong> anuncios publicitarios.</li>
                    <li><strong>Google Analytics:</strong> métricas y estadísticas de uso.</li>
                </ul>
                <p className="text-violet-300/80 mt-4">
                    Recomendamos revisar las políticas de privacidad de Google para más información.
                </p>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30">
                <h3 className="text-xl font-bold text-violet-200 mb-4">6. Tus Derechos</h3>
                <p className="mb-4">
                    No guardamos ninguna foto ni información personal.
                </p>
                <p className="mb-4">
                    Podés borrar las cookies de tu navegador para eliminar los datos técnicos almacenados localmente.
                </p>
                <p className="text-violet-300/80">
                    Solo se guardan, en tu propio dispositivo, las preferencias locales (por ejemplo, audio o configuraciones de juego).
                </p>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30">
                <h3 className="text-xl font-bold text-violet-200 mb-4">7. Contacto</h3>
                <p>
                    Para consultas o solicitudes vinculadas a privacidad escribinos a: <span className="text-cyan-400">onlyfachasoficial@gmail.com</span>
                </p>
            </div>
        </div>

        <div className="mt-8 flex justify-center">
            <NeonButton onClick={reset}>
                Volver al Inicio
            </NeonButton>
        </div>
    </div>
  );

  const renderTermsView = () => (
    <div className="w-full max-w-4xl mx-auto text-left">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 neon-text-fuchsia text-center">
            Términos y Condiciones de OnlyFachas
        </h2>
        <div className="space-y-6 text-violet-300/90 leading-relaxed">
            <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30">
                <h3 className="text-xl font-bold text-violet-200 mb-4">1. Aceptación</h3>
                <p>
                    Al acceder o utilizar OnlyFachas aceptás estos términos en su totalidad.
                    Si no estás de acuerdo, no uses la aplicación.
                </p>
            </div>

            <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 border-cyan-500/50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-cyan-300 mb-4">2. Aclaración Importante</h3>
                <p className="text-violet-300/90 leading-relaxed">
                    El término <span className="text-cyan-400 font-bold">"facha"</span> se usa únicamente en el sentido argentino de fachero/estilo, sin relación con política o ideologías.
                    Hace referencia a la apariencia o "pinta" de una persona, su look o estilo personal.
                </p>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30">
                <h3 className="text-xl font-bold text-violet-200 mb-4">3. Uso Permitido</h3>
                <p className="mb-4">
                    OnlyFachas es una aplicación de entretenimiento.
                    Queda prohibido usarla para acosar, discriminar, difamar o infringir derechos de terceros.
                </p>
                <ul className="list-disc list-inside space-y-2 text-violet-300/80">
                    <li>Uso exclusivo para diversión.</li>
                    <li>No subir contenido ofensivo, ilegal, violento o sexual.</li>
                    <li>Respetar derechos de imagen y de autor.</li>
                    <li>Ser mayor de 18 años o contar con supervisión adulta.</li>
                </ul>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30">
                <h3 className="text-xl font-bold text-violet-200 mb-4">4. Contenido del Usuario</h3>
                <p className="mb-4">
                    Vos sos el único responsable de las fotos que subas.
                    No cargues imágenes de otras personas sin su consentimiento.
                </p>
                <p className="text-violet-300/80">
                    Las imágenes no se almacenan: se procesan en el momento mediante servicios de terceros (por ejemplo, Google Gemini) que pueden aplicar filtros automáticos para moderación.
                </p>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30">
                <h3 className="text-xl font-bold text-violet-200 mb-4">5. Limitación de Responsabilidad</h3>
                <p className="mb-4">
                    OnlyFachas se ofrece "tal cual", sin garantías de ningún tipo.
                    Los puntajes generados por la IA:
                </p>
                <ul className="list-disc list-inside space-y-2 text-violet-300/80">
                    <li>Son solo para entretenimiento.</li>
                    <li>No constituyen un juicio real sobre apariencia o valor personal.</li>
                    <li>Pueden variar o contener errores.</li>
                    <li>No asumimos responsabilidad por decisiones tomadas en base a los resultados.</li>
                </ul>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30">
                <h3 className="text-xl font-bold text-violet-200 mb-4">6. Servicios de Terceros</h3>
                <p className="mb-4">
                    El análisis de imágenes se realiza con APIs de Google (Gemini, entre otros) y las métricas publicitarias se gestionan a través de Google AdSense.
                    Al usar la aplicación aceptás las políticas de privacidad y términos de dichos servicios.
                </p>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30">
                <h3 className="text-xl font-bold text-violet-200 mb-4">7. Cambios</h3>
                <p>
                    Podemos actualizar estos términos y/o la política de privacidad en cualquier momento.
                    El uso continuo de la aplicación implica la aceptación de las modificaciones.
                </p>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30">
                <h3 className="text-xl font-bold text-violet-200 mb-4">8. Contacto</h3>
                <p>
                    Para consultas o solicitudes vinculadas a privacidad, escribí a: <span className="text-cyan-400">onlyfachasoficial@gmail.com</span>
                </p>
            </div>
        </div>

        <div className="mt-8 flex justify-center">
            <NeonButton onClick={reset}>
                Volver al Inicio
            </NeonButton>
        </div>
    </div>
  );

  const renderComingSoonView = () => (
    <div className="w-full max-w-4xl mx-auto text-center">
        <div className="mb-8">
            <div className="text-8xl mb-6">🚀</div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 neon-text-fuchsia">
                ¡Próximamente!
            </h2>
            <p className="text-xl text-violet-300 mb-8">
                Estamos cocinando algo épico para vos
            </p>
        </div>

        <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 border-cyan-500/50 rounded-2xl p-8 mb-8">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-2xl font-bold text-cyan-300 mb-4">
                Aumentá tu Facha
            </h3>
            <p className="text-lg text-violet-300/90 leading-relaxed mb-6">
                Estamos trabajando en una funcionalidad épica que va a transformar tu foto en una versión 
                <span className="text-cyan-400 font-bold"> GigaChad</span>. 
                La IA está aprendiendo a ser más zarpada que nunca.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="bg-slate-700/50 p-4 rounded-lg border border-yellow-500/30">
                    <div className="text-2xl mb-2">🎨</div>
                    <h4 className="font-bold text-cyan-300 mb-2">Transformación Total</h4>
                    <p className="text-sm text-violet-300/80">Tu foto se convierte en una obra de arte de la facha</p>
                </div>
                
                <div className="bg-slate-700/50 p-4 rounded-lg border border-yellow-500/30">
                    <div className="text-2xl mb-2">🤖</div>
                    <h4 className="font-bold text-cyan-300 mb-2">IA Avanzada</h4>
                    <p className="text-sm text-violet-300/80">Algoritmos de última generación para resultados épicos</p>
                </div>
                
                <div className="bg-slate-700/50 p-4 rounded-lg border border-yellow-500/30">
                    <div className="text-2xl mb-2">🔥</div>
                    <h4 className="font-bold text-cyan-300 mb-2">Resultados Zarpados</h4>
                    <p className="text-sm text-violet-300/80">Prepárate para quedar detonado con el resultado</p>
                </div>
            </div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30 mb-8">
            <h4 className="text-lg font-bold text-violet-200 mb-4">¿Cuándo estará listo?</h4>
            <p className="text-violet-300/90 mb-4">
                Estamos trabajando a full para traerte esta funcionalidad lo antes posible. 
                Mientras tanto, disfrutá del análisis de facha y las batallas épicas.
            </p>
            <div className="flex items-center justify-center gap-2 text-cyan-400">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                <span className="ml-2 text-sm">En desarrollo...</span>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <NeonButton 
              onClick={() => {
                reset();
              }} 
              className="bg-gradient-to-br from-purple-500 to-pink-500"
            >
                🏠 Volver al Inicio
            </NeonButton>
            <NeonButton onClick={() => setAppState('leaderboard')} className="bg-gradient-to-br from-yellow-400 to-orange-500">
                <FiTrendingUp className="w-5 h-5" /> Ver Top Fachas
            </NeonButton>
        </div>
    </div>
  );

  const renderAboutView = () => (
    <div className="w-full max-w-4xl mx-auto text-center">
        <div className="mb-8">
            <div className="text-8xl mb-6">🚀</div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 neon-text-fuchsia">
                Sobre Nosotros
            </h2>
            <p className="text-xl text-violet-300 mb-8">
                La historia detrás de esta locura
            </p>
        </div>

        <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 border-cyan-500/50 rounded-2xl p-8 mb-8">
            <div className="text-6xl mb-4">💡</div>
            <h3 className="text-2xl font-bold text-cyan-300 mb-4">
                El Origen
            </h3>
            <p className="text-lg text-violet-300/90 leading-relaxed mb-6">
                OnlyFachas nació como un experimento medio en broma de un estudiante de ingeniería aeroespacial que quería probar qué tan lejos podía llegar jugando con inteligencia artificial.
            </p>
            <p className="text-lg text-violet-300/90 leading-relaxed mb-6">
                La idea apareció una noche de estudio entre mates y risas: <span className="text-cyan-400 font-bold">"¿y si hacemos una IA que mida la facha?"</span>.
            </p>
            <p className="text-lg text-violet-300/90 leading-relaxed mb-6">
                Lo que arrancó como chiste para un par de amigos terminó convirtiéndose en un proyecto que mezcló código, diseño y mucho humor argentino.
            </p>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30 mb-8">
            <h4 className="text-lg font-bold text-violet-200 mb-4">El Despegue</h4>
            <p className="text-violet-300/90 mb-4">
                Cuando el primer prototipo estuvo listo y se lo mostró a sus amigos, todos se engancharon.
            </p>
            <p className="text-violet-300/90 mb-4">
                Empezaron a competir por los puntajes, a compartir capturas y a tirar ideas para nuevas funciones.
            </p>
            <p className="text-violet-300/90 mb-4">
                Ese entusiasmo fue el empujón para darle una vuelta más profesional, abrir el sitio y dejar que cualquiera pueda probar su nivel de facha.
            </p>
        </div>

        <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 border-yellow-500/50 rounded-2xl p-8 mb-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h4 className="text-lg font-bold text-yellow-300 mb-4">Importante</h4>
            <p className="text-lg text-violet-300/90 leading-relaxed mb-4">
                Es importante aclarar que <span className="text-yellow-400 font-bold">OnlyFachas no es una medida real ni científica de nada</span>.
            </p>
            <p className="text-lg text-violet-300/90 leading-relaxed mb-4">
                Los puntajes son solo un juego, un análisis de IA pensado para divertirse en juntadas, o para pasar el rato con amigos.
            </p>
            <p className="text-lg text-violet-300/90 leading-relaxed mb-4">
                La idea es reírse, compartir un momento y no tomarse demasiado en serio la calificación.
            </p>
            <p className="text-lg text-violet-300/90 leading-relaxed mb-4">
                <span className="text-cyan-400 font-bold">La facha de verdad está en la actitud, no en un número.</span>
            </p>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30 mb-8">
            <h4 className="text-lg font-bold text-violet-200 mb-4">Nuestros Objetivos</h4>
            <p className="text-violet-300/90 mb-4">
                Hoy OnlyFachas sigue siendo un proyecto independiente, hecho con ganas y mucho humor, pero con objetivos claros:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="bg-slate-700/50 p-4 rounded-lg border border-yellow-500/30">
                    <div className="text-2xl mb-2">🎯</div>
                    <h4 className="font-bold text-cyan-300 mb-2">Experiencia Divertida</h4>
                    <p className="text-sm text-violet-300/80">Ofrecer una experiencia divertida y segura</p>
                </div>
                
                <div className="bg-slate-700/50 p-4 rounded-lg border border-yellow-500/30">
                    <div className="text-2xl mb-2">🔒</div>
                    <h4 className="font-bold text-cyan-300 mb-2">Privacidad Total</h4>
                    <p className="text-sm text-violet-300/80">No guardar fotos ni datos personales</p>
                </div>
                
                <div className="bg-slate-700/50 p-4 rounded-lg border border-yellow-500/30">
                    <div className="text-2xl mb-2">😄</div>
                    <h4 className="font-bold text-cyan-300 mb-2">Humor Criollo</h4>
                    <p className="text-sm text-violet-300/80">Mantener un toque de humor criollo en cada análisis</p>
                </div>
                
                <div className="bg-slate-700/50 p-4 rounded-lg border border-yellow-500/30">
                    <div className="text-2xl mb-2">🎭</div>
                    <h4 className="font-bold text-cyan-300 mb-2">Solo Joda</h4>
                    <p className="text-sm text-violet-300/80">Recordar siempre que esto es solo joda</p>
                </div>
            </div>
        </div>

        <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 border-fuchsia-500/50 rounded-2xl p-8 mb-8">
            <div className="text-6xl mb-4">🤝</div>
            <h4 className="text-lg font-bold text-fuchsia-300 mb-4">Únete a la Comunidad</h4>
            <p className="text-lg text-violet-300/90 leading-relaxed mb-4">
                Si te divertís usándolo, compartilo con tus amigos y ayudanos a que esta locura siga creciendo.
            </p>
            <p className="text-lg text-violet-300/90 leading-relaxed mb-4">
                Gracias por ser parte de esta comunidad que sabe que la facha no es solo apariencia: <span className="text-fuchsia-400 font-bold">es actitud y buena onda</span>.
            </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <NeonButton 
              onClick={() => {
                reset();
              }} 
              className="bg-gradient-to-br from-purple-500 to-pink-500"
            >
                🏠 Volver al Inicio
            </NeonButton>
            <NeonButton onClick={() => setAppState('leaderboard')} className="bg-gradient-to-br from-yellow-400 to-orange-500">
                <FiTrendingUp className="w-5 h-5" /> Ver Top Fachas
            </NeonButton>
        </div>
    </div>
  );


  const renderFaqView = () => (
    <div className="w-full max-w-4xl mx-auto text-center">
        <div className="mb-8">
            <div className="text-8xl mb-6">❓</div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 neon-text-fuchsia">
                Preguntas Frecuentes
            </h2>
            <p className="text-xl text-violet-300 mb-8">
                Todo lo que necesitás saber sobre OnlyFachas
            </p>
        </div>

        <div className="space-y-6 text-left">
            {/* ¿Qué es OnlyFachas? */}
            <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 border-cyan-500/50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-cyan-300 mb-3 flex items-center gap-2">
                    <span className="text-2xl">🤖</span>
                    ¿Qué es OnlyFachas?
                </h3>
                <p className="text-violet-300/90 leading-relaxed">
                    OnlyFachas es una app web que usa inteligencia artificial para dar un puntaje de "facha" a una foto.
                </p>
                <p className="text-violet-300/90 leading-relaxed mt-2">
                    Es un juego para divertirse, no un análisis serio ni una medida real de belleza o estilo.
                </p>
            </div>

            {/* ¿Las fotos se guardan? */}
            <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30">
                <h3 className="text-xl font-bold text-violet-200 mb-3 flex items-center gap-2">
                    <span className="text-2xl">🔒</span>
                    ¿Las fotos se guardan en algún lado?
                </h3>
                <p className="text-violet-300/90 leading-relaxed">
                    No. Las imágenes se procesan solo para el análisis y después se descartan.
                </p>
                <p className="text-violet-300/90 leading-relaxed mt-2">
                    No almacenamos ni compartimos tus fotos con nadie.
                </p>
            </div>

            {/* ¿Por qué cambia el puntaje? */}
            <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 border-yellow-500/50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-yellow-300 mb-3 flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    ¿Por qué a veces el puntaje cambia?
                </h3>
                <p className="text-violet-300/90 leading-relaxed">
                    La IA analiza cada foto de manera independiente y puede dar resultados distintos según la luz, el encuadre o la expresión.
                </p>
                <p className="text-violet-300/90 leading-relaxed mt-2">
                    Recordá que es solo para divertirse, no hay una "medición exacta".
                </p>
            </div>

            {/* ¿Puedo usarlo desde el celular? */}
            <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30">
                <h3 className="text-xl font-bold text-violet-200 mb-3 flex items-center gap-2">
                    <span className="text-2xl">📱</span>
                    ¿Puedo usarlo desde el celular?
                </h3>
                <p className="text-violet-300/90 leading-relaxed">
                    Sí. El sitio está pensado para funcionar en celulares, tablets y computadoras.
                </p>
                <p className="text-violet-300/90 leading-relaxed mt-2">
                    Podés subir una foto o usar la cámara directamente.
                </p>
            </div>

            {/* ¿Qué pasa si la IA falla? */}
            <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 border-orange-500/50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-orange-300 mb-3 flex items-center gap-2">
                    <span className="text-2xl">⚠️</span>
                    ¿Qué pasa si la IA falla o está saturada?
                </h3>
                <p className="text-violet-300/90 leading-relaxed">
                    Si la IA de Google no responde usamos un sistema de respaldo que devuelve resultados de ejemplo para que la experiencia siga siendo divertida.
                </p>
            </div>

            {/* ¿Necesito crear cuenta? */}
            <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30">
                <h3 className="text-xl font-bold text-violet-200 mb-3 flex items-center gap-2">
                    <span className="text-2xl">👤</span>
                    ¿Necesito crear una cuenta?
                </h3>
                <p className="text-violet-300/90 leading-relaxed">
                    No. No pedimos registro ni datos personales.
                </p>
                <p className="text-violet-300/90 leading-relaxed mt-2">
                    Todo el historial de puntajes queda guardado solo en tu dispositivo.
                </p>
            </div>

            {/* ¿Es gratis? */}
            <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 border-green-500/50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-green-300 mb-3 flex items-center gap-2">
                    <span className="text-2xl">💰</span>
                    ¿Es gratis?
                </h3>
                <p className="text-violet-300/90 leading-relaxed">
                    Sí. OnlyFachas es totalmente gratuito.
                </p>
                <p className="text-violet-300/90 leading-relaxed mt-2">
                    Hay anuncios de Google AdSense para cubrir costos de hosting, pero no es necesario pagar nada para usarlo.
                </p>
            </div>

            {/* ¿Puedo compartir resultados? */}
            <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30">
                <h3 className="text-xl font-bold text-violet-200 mb-3 flex items-center gap-2">
                    <span className="text-2xl">📤</span>
                    ¿Puedo compartir mis resultados?
                </h3>
                <p className="text-violet-300/90 leading-relaxed">
                    Claro. Podés descargar tu análisis como imagen y compartirla en redes sociales o en tus grupos de amigos.
                </p>
            </div>

            {/* ¿Es apto para menores? */}
            <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 border-blue-500/50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-blue-300 mb-3 flex items-center gap-2">
                    <span className="text-2xl">👶</span>
                    ¿Es apto para menores?
                </h3>
                <p className="text-violet-300/90 leading-relaxed">
                    El contenido es humorístico y no contiene material inapropiado, pero recomendamos que los menores lo usen con supervisión adulta para entender que es solo un juego.
                </p>
            </div>

            {/* ¿Puedo sugerir mejoras? */}
            <div className="bg-slate-800/50 p-6 rounded-lg border border-violet-500/30">
                <h3 className="text-xl font-bold text-violet-200 mb-3 flex items-center gap-2">
                    <span className="text-2xl">💬</span>
                    ¿Puedo sugerir mejoras o reportar un problema?
                </h3>
                <p className="text-violet-300/90 leading-relaxed">
                    Sí. Nos encanta recibir feedback.
                </p>
                <p className="text-violet-300/90 leading-relaxed mt-2">
                    Podés escribirnos por Instagram en <a href="https://instagram.com/onlyfachas" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 underline">@onlyfachas</a> o por email a <span className="text-cyan-400">onlyfachasoficial@gmail.com</span>.
                </p>
            </div>
        </div>

        {/* Mensaje final */}
        <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 border-fuchsia-500/50 rounded-2xl p-8 mt-8">
            <div className="text-6xl mb-4">🎭</div>
            <h4 className="text-lg font-bold text-fuchsia-300 mb-4">Recordá</h4>
            <p className="text-lg text-violet-300/90 leading-relaxed">
                OnlyFachas es solo para pasar un buen rato.
            </p>
            <p className="text-lg text-violet-300/90 leading-relaxed mt-2">
                La verdadera facha está en la actitud y en la buena onda, no en un número.
            </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <NeonButton 
              onClick={() => {
                reset();
              }} 
              className="bg-gradient-to-br from-purple-500 to-pink-500"
            >
                🏠 Volver al Inicio
            </NeonButton>
            <NeonButton onClick={() => setAppState('about')} className="bg-gradient-to-br from-cyan-400 to-blue-500">
                📖 Sobre Nosotros
            </NeonButton>
        </div>
    </div>
  );

  const renderContent = () => {
    
    if (isLoading) return <Loader />;
    if (showSettings) return renderSettingsView();
    if (appState === 'leaderboard') return renderLeaderboardView();
    if (appState === 'privacy') return renderPrivacyView();
    if (appState === 'terms') return renderTermsView();
    if (appState === 'comingSoon') return renderComingSoonView();
    if (appState === 'about') return renderAboutView();
    if (appState === 'faq') return renderFaqView();
    
    if (appMode === 'enhance') {
      switch(appState) {
          case 'select': return renderSelectModeView();
          case 'capture': return <WebcamCapture onCapture={handleWebcamCapture} onCancel={() => setAppState('select')} />;
          case 'enhancing': return <Loader />;
          case 'enhanceResult': return renderEnhanceResultView();
          case 'error': return renderErrorView();
          default: return renderSelectModeView();
      }
    }

    if (appMode === 'battle') {
        switch(appState) {
            case 'battleSelect': return renderBattleSelectView();
            case 'capture': return <WebcamCapture onCapture={handleWebcamCapture} onCancel={() => { setActiveBattleSlot(null); setAppState('battleSelect'); }} />;
            case 'battleResult': return renderBattleResultView();
            case 'error': return renderErrorView();
            default: return renderBattleSelectView();
        }
    }

    // single mode
    switch(appState) {
        case 'welcome': return renderWelcomeView();
        case 'select': return renderSelectModeView();
        case 'capture': return <WebcamCapture onCapture={handleWebcamCapture} onCancel={() => setAppState('select')} />;
        case 'analyze': return renderImageView();
        case 'result': return renderResultView();
        case 'error': return renderErrorView();
        default: return renderWelcomeView();
    }
  };

  const containerClasses = appState === 'welcome' 
    ? "w-full min-h-[300px] sm:min-h-[400px] flex items-center justify-center p-4 sm:p-6 md:p-8 rounded-2xl fade-in transition-all duration-500" 
    : "w-full min-h-[300px] sm:min-h-[400px] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-900/50 backdrop-blur-sm border border-violet-500/30 rounded-2xl neon-shadow-purple fade-in transition-all duration-500";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 mobile-container selection:bg-fuchsia-500 selection:text-white">
      <div className="absolute top-0 left-0 w-full h-full bg-grid-violet-500/20 [mask-image:linear-gradient(to_bottom,white_5%,transparent_90%)]"></div>
      <main className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center justify-center">
        <header className="text-center mb-6 sm:mb-10 mobile-header">
          {/* Controles de Audio Separados */}
          <div className="flex justify-center gap-2 mb-4">
            {/* Control de Música */}
            <button
              onClick={() => setMusicEnabled(!musicEnabled)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-slate-700/50 hover:border-blue-400 transition-all duration-200"
              title={musicEnabled ? "Desactivar música de fondo" : "Activar música de fondo"}
            >
              {musicEnabled ? <FiVolume2 className="w-4 h-4" /> : <FiVolumeX className="w-4 h-4" />}
              <span className="text-xs font-medium">
                {musicEnabled ? "🎵 Música ON" : "🎵 Música OFF"}
              </span>
            </button>
            
            {/* Control de Efectos */}
            <button
              onClick={() => setEffectsEnabled(!effectsEnabled)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 border border-green-500/30 rounded-lg text-green-300 hover:bg-slate-700/50 hover:border-green-400 transition-all duration-200"
              title={effectsEnabled ? "Desactivar efectos de voz" : "Activar efectos de voz"}
            >
              {effectsEnabled ? <FiVolume2 className="w-4 h-4" /> : <FiVolumeX className="w-4 h-4" />}
              <span className="text-xs font-medium">
                {effectsEnabled ? "🎤 Voces ON" : "🎤 Voces OFF"}
              </span>
            </button>
          </div>
          
          <div 
            className="cursor-pointer" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              reset();
            }} 
            title="Ir al inicio"
          >
            <h1 className="neon-text-fuchsia flex items-baseline justify-center gap-x-1 md:gap-x-2 mobile-title">
              <span className="font-montserrat font-thin tracking-wider text-4xl sm:text-6xl md:text-7xl lg:text-8xl">Only</span>
              <span className="font-arizonia text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl">Fachas</span>
            </h1>
            <p className="text-violet-300 mt-2 mobile-subtitle animate-pulse-90bpm">La única IA que sabe de tirar facha.</p>
          </div>
          
          {/* Botón Sobre Nosotros y enlace Instagram */}
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-violet-400/80">
            <button 
              onClick={() => setAppState('about')}
              className="hover:text-violet-300 transition-colors duration-200 underline"
            >
              Sobre Nosotros
            </button>
            <span className="text-violet-400/40">|</span>
            <button 
              onClick={() => setAppState('faq')}
              className="hover:text-violet-300 transition-colors duration-200 underline"
            >
              Preguntas Frecuentes
            </button>
            <span className="text-violet-400/40">|</span>
            <a 
              href="https://www.instagram.com/onlyfachas/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-violet-300 transition-colors duration-200"
            >
              <InstagramIcon className="w-4 h-4" />
              <span>@onlyfachas</span>
            </a>
          </div>
        </header>
        <div className={containerClasses}>
            {renderContent()}
        </div>
        <footer className="mt-6 sm:mt-10 text-center text-violet-400/60 text-xs sm:text-sm mobile-footer">
            <p className="mb-2">Hecho con mucho tiempo libre y mucho amor. Los resultados son para joder, no te la creas tanto.</p>
            <div className="flex justify-center gap-4 text-violet-400/80">
                <button 
                    onClick={() => setAppState('privacy')}
                    className="hover:text-violet-300 transition-colors duration-200 underline"
                >
                    Privacidad
                </button>
                <span className="text-violet-400/40">•</span>
                <button 
                    onClick={() => setAppState('terms')}
                    className="hover:text-violet-300 transition-colors duration-200 underline"
                >
                    Términos
                </button>
            </div>
        </footer>
      </main>
      

      {/* Notification Toast */}
      <NotificationToast
        isVisible={showNotification}
        onClose={hideNotificationToast}
        type={notificationContent.type}
        title={notificationContent.title}
        message={notificationContent.message}
        duration={5000}
      />

      {/* Emergency Banners */}
      {showMaintenanceBanner && (
        <MaintenanceBanner onClose={() => setShowMaintenanceBanner(false)} />
      )}
      
      {showRateLimitBanner && (
        <RateLimitBanner 
          remainingRequests={remainingRequests}
          maxRequests={maxRequestsPerHour}
          onClose={() => setShowRateLimitBanner(false)} 
        />
      )}
      
      {showRequestDelayBanner && (
        <RequestDelayBanner 
          delaySeconds={Math.ceil(requestDelay / 1000)}
          onClose={() => setShowRequestDelayBanner(false)} 
        />
      )}

      {/* Dev Mode Menu */}
      <DevModeMenu
        isOpen={devSettings.showDevMenu}
        onClose={closeDevMenu}
        forceScore={devSettings.forceScore}
        useMockData={devSettings.useMockData}
        onToggleMockData={toggleMockData}
        onSetForceScore={setForceScore}
        onReset={resetDevSettings}
      />
    </div>
  );
};

export default App;
