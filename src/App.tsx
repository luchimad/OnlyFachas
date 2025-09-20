
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FachaResult, FachaBattleResult, FachaEnhanceResult, StoredFachaResult, AiMode } from '../types';
import { getFachaScore, getFachaBattleResult, getEnhancedFacha } from '../services/geminiService';
import WebcamCapture from '../components/WebcamCapture';
import FachaMeter from '../components/FachaMeter';
import FachaStats from '../components/FachaStats';
import Loader from '../components/Loader';
import WorkInProgressToast from '../components/WorkInProgressToast';
import AdBanner from '../components/AdBanner';
import { UploadIcon, CameraIcon, ZapIcon, RefreshCwIcon, AlertTriangleIcon, CheckCircle2, XCircle, TrophyIcon, SettingsIcon, DownloadIcon, SparklesIcon, Trash2Icon } from '../components/Icons';

type AppMode = 'single' | 'battle' | 'enhance';
type AppState = 'welcome' | 'select' | 'capture' | 'analyze' | 'result' | 'error' | 'battleSelect' | 'battleResult' | 'enhancing' | 'enhanceResult' | 'leaderboard';

// --- Sound Effects ---
const playSound = (audioSrc: string) => {
  try {
    const audio = new Audio(audioSrc);
    audio.volume = 0.5;
    audio.play().catch(e => console.error("Audio playback failed:", e));
  } catch (e) {
    console.error("Could not play audio:", e);
  }
};

// Use a single, valid sound data to prevent playback errors from corrupted base64 strings
const validSoundData = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjQ1LjEwMAAAAAAAAAAAAAAA//tAmAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIwARTR4AAAAAAAAAAAAAADh4ZUVsY25IajdnLzVUSmJHSnZlRzZ6eWJWVzZaVlR0ZlA4PQBCbGF6ZXIgdjAuOS4yAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7QJgAAMPgZn6BSwAABOAAANIAAAEGVVGljTg091aishgQAACAgIABARiQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7QJgAE0B2b4KscgAARCAAABgAAAARFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/9k=';
const uploadSoundData = validSoundData;
const cameraActivateSoundData = validSoundData;
const resultSoundData = validSoundData;


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
  const [aiMode, setAiMode] = useState<AiMode>('rapido');
  const [showSettings, setShowSettings] = useState(false);
  const [showWipToast, setShowWipToast] = useState(false);
  const [wipToastContent, setWipToastContent] = useState<{title: string, description: string}>({title: '', description: ''});
  
  // Single/Enhance mode state
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageData, setImageData] = useState<{base64: string, mimeType: string} | null>(null);
  const [result, setResult] = useState<FachaResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState<string>('');
  
  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<StoredFachaResult[]>([]);

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
            setLeaderboard(parsedData);
        }
    } catch (e) {
        console.error("Failed to load leaderboard from localStorage", e);
        setLeaderboard([]);
    }
  }, []);

  const runFachaEnhancement = useCallback(async (currentImageData: {base64: string, mimeType: string}) => {
    if (!currentImageData) {
      setError("Necesito una foto para tunear, pibe.");
      setAppState('error');
      return;
    }
    setIsLoading(true);
    setError(null);
    setEnhancedResult(null);
    setAppState('enhancing');
    try {
      const result = await getEnhancedFacha(currentImageData.base64, currentImageData.mimeType);
      playSound(resultSoundData);
      setEnhancedResult(result);
      setAppState('enhanceResult');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Falló la IA tuneadora de fachas. Probá de nuevo.");
      setAppState('error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, slot: 'single' | 1 | 2) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        playSound(uploadSoundData);
        setError(null);
        const { base64, mimeType } = await fileToBase64(file);
        const newImageData = { base64, mimeType };
        const newImageSrc = URL.createObjectURL(file);

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
      } catch (err) {
        setError('No se pudo cargar la imagen. Probá con otra, che.');
        setAppState('error');
      } finally {
        event.target.value = "";
      }
    }
  };

  const handleWebcamCapture = (dataUrl: string) => {
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
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const fachaResult = await getFachaScore(imageData.base64, imageData.mimeType, aiMode);
      playSound(resultSoundData);

      const dataUrl = `data:${imageData.mimeType};base64,${imageData.base64}`;
      const newEntry: StoredFachaResult = {
          id: `facha-${Date.now()}`,
          name: name,
          imageSrc: dataUrl,
          timestamp: Date.now(),
          ...fachaResult
      };

      const updatedLeaderboard = [...leaderboard, newEntry]
          .sort((a, b) => b.rating - a.rating);
      
      setLeaderboard(updatedLeaderboard);
      localStorage.setItem('onlyFachasLeaderboard', JSON.stringify(updatedLeaderboard));
      
      setResult(fachaResult);
      setAppState('result');
    } catch (err) {
      console.error(err);
      setError("Upa, se rompió todo. Capaz tu facha es tan GOD que bugueó la IA. Probá de una con otra foto.");
      setAppState('error');
    } finally {
      setIsLoading(false);
    }
  }, [imageData, aiMode, name, leaderboard]);
  
  const analyzeFachaBattle = useCallback(async () => {
    if (!imageData1 || !imageData2) {
      setError("Faltan contendientes para la batalla, che.");
      setAppState('error');
      return;
    }
    setIsLoading(true);
    setError(null);
    setBattleResult(null);
    try {
        const result = await getFachaBattleResult(imageData1, imageData2, aiMode);
        playSound(resultSoundData);
        setBattleResult(result);
        setAppState('battleResult');
    } catch (err) {
        console.error(err);
        setError("La IA no pudo decidir, la facha es demasiada. Intentá con otras fotos.");
        setAppState('error');
    } finally {
        setIsLoading(false);
    }
}, [imageData1, imageData2, aiMode]);

  const reset = () => {
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

    setAppMode('single');
    setAppState('welcome');
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

  const displayWipToast = (title: string, description: string) => {
    setWipToastContent({ title, description });
    setShowWipToast(true);
  };

  const hideWipToast = () => {
    setShowWipToast(false);
  };

  const NeonButton: React.FC<{onClick?: () => void, children: React.ReactNode, className?: string, disabled?: boolean}> = ({ onClick, children, className = '', disabled = false }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium rounded-lg group bg-gradient-to-br from-purple-500 to-pink-500 transition-all duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : 'group-hover:from-purple-500 group-hover:to-pink-500 hover:text-white focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800'} ${className}`}
    >
      <span className="relative w-full px-5 py-2.5 transition-all ease-in duration-75 bg-slate-900/30 backdrop-blur-sm rounded-md group-hover:bg-opacity-0 flex items-center justify-center gap-2 text-white font-bold group-hover:text-white drop-shadow-lg">
        {children}
      </span>
    </button>
  );

  const getScoreColor = (s: number) => {
    if (s <= 3) return '#f97316'; // orange-500
    if (s <= 6) return '#84cc16'; // lime-500
    return '#d946ef'; // fuchsia-500
  };

  const handleExportResult = async () => {
    if (!result || !imageSrc) return;
    setIsLoading(true);

    try {
        let dataUrl: string;
        if (imageSrc.startsWith('data:')) {
            dataUrl = imageSrc;
        } else {
            const response = await fetch(imageSrc);
            const blob = await response.blob();
            dataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        }

        const score = result.rating.toFixed(1);
        const color = getScoreColor(result.rating);

        const escapeXml = (unsafe: string) => unsafe.replace(/[<>&'"]/g, (c) => {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
                default: return c;
            }
        });

        const svgContent = `
            <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg" style="font-family: 'Roboto', sans-serif;">
                <defs>
                    <linearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#1a0f2b;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#0f051a;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#backgroundGradient)" />
                
                <text x="540" y="120" font-family="Orbitron, sans-serif" font-size="70" fill="#fuchsia-400" text-anchor="middle" style="text-shadow: 0 0 10px #fuchsia-500;">OnlyFachas</text>
                <text x="540" y="180" font-size="30" fill="#a78bfa" text-anchor="middle">El Veredicto Final</text>

                <clipPath id="imageClip"><rect x="140" y="240" width="800" height="800" rx="30" /></clipPath>
                <image href="${dataUrl}" x="140" y="240" width="800" height="800" preserveAspectRatio="xMidYMid slice" clip-path="url(#imageClip)" />
                <rect x="140" y="240" width="800" height="800" rx="30" fill="none" stroke="${color}" stroke-width="8" style="filter: drop-shadow(0 0 15px ${color});" />
                
                <text x="540" y="1150" font-family="Orbitron, sans-serif" font-size="200" fill="${color}" text-anchor="middle" style="text-shadow: 0 0 20px ${color};">${score}</text>
                
                <foreignObject x="80" y="1220" width="920" height="180">
                    <p xmlns="http://www.w3.org/1999/xhtml" style="color: #67e8f9; font-size: 38px; text-align: center; margin: 0; font-style: italic; word-wrap: break-word;">
                        "${escapeXml(result.comment)}"
                    </p>
                </foreignObject>

                <rect x="80" y="1420" width="920" height="420" rx="20" fill="rgba(255,255,255,0.05)" />

                <text x="120" y="1480" font-size="35" fill="#4ade80" font-weight="bold">Puntos Fuertes:</text>
                <foreignObject x="120" y="1510" width="840" height="130">
                    <ul xmlns="http://www.w3.org/1999/xhtml" style="color: #a3e635; font-size: 30px; margin: 0; padding-left: 40px;">
                        ${result.fortalezas.map(f => `<li>${escapeXml(f)}</li>`).join('')}
                    </ul>
                </foreignObject>

                <text x="120" y="1670" font-size="35" fill="#facc15" font-weight="bold">Para Mejorar:</text>
                <foreignObject x="120" y="1700" width="840" height="130">
                    <ul xmlns="http://www.w3.org/1999/xhtml" style="color: #fde047; font-size: 30px; margin: 0; padding-left: 40px;">
                        ${result.consejos.map(c => `<li>${escapeXml(c)}</li>`).join('')}
                    </ul>
                </foreignObject>
            </svg>
        `;
        const svgBlob = new Blob([svgContent], {type: 'image/svg+xml;charset=utf-8'});
        const url = URL.createObjectURL(svgBlob);
        const image = new Image();
        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 1080;
            canvas.height = 1920;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(image, 0, 0);
            }
            URL.revokeObjectURL(url);
            const a = document.createElement('a');
            a.download = 'veredicto-onlyfachas.png';
            a.href = canvas.toDataURL('image/png');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setIsLoading(false);
        };
        image.onerror = () => {
             setError("No se pudo generar la imagen para exportar.");
             setIsLoading(false);
        }
        image.src = url;
    } catch (err) {
        console.error("Error exporting result:", err);
        setError("Falló la exportación. ¿Será que tu facha rompió la compu?");
        setIsLoading(false);
    }
  };

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
          onClick={() => setAppState('leaderboard')}
          className="w-full text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 mobile-button bg-gradient-to-br from-yellow-400 to-orange-500 group-hover:from-yellow-400 group-hover:to-orange-500 focus:ring-yellow-300 dark:focus:ring-yellow-800 hover:shadow-[0_0_25px_theme('colors.yellow.400'),0_0_50px_theme('colors.orange.600')]"
        >
          <TrophyIcon /> Top Fachas
        </NeonButton>
      </div>
      
      {/* Botones de abajo - Work in Progress */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md mt-6">
        <NeonButton 
          onClick={() => displayWipToast(
            "Aumentá tu Facha", 
            "Estamos trabajando en una funcionalidad épica que va a transformar tu foto en una versión GigaChad. La IA está aprendiendo a ser más zarpada que nunca."
          )}
          className="w-full sm:w-1/2 text-base sm:text-lg px-4 sm:px-6 py-3 sm:py-4 mobile-button bg-gradient-to-br from-cyan-400 to-blue-500 group-hover:from-cyan-400 group-hover:to-blue-500 hover:shadow-[0_0_25px_theme('colors.cyan.400'),0_0_50px_theme('colors.blue.600')]"
        >
          <SparklesIcon /> Aumentá tu facha
        </NeonButton>
        
        <NeonButton 
          onClick={() => displayWipToast(
            "Facha vs Facha", 
            "Preparando la batalla más épica de la historia. Dos fotos, una IA, y un veredicto final que va a romper todo."
          )}
          className="w-full sm:w-1/2 text-base sm:text-lg px-4 sm:px-6 py-3 sm:py-4 mobile-button bg-gradient-to-br from-purple-500 to-pink-500 group-hover:from-purple-500 group-hover:to-pink-500 hover:shadow-[0_0_25px_theme('colors.purple.500'),0_0_50px_theme('colors.pink.600')]"
        >
          <TrophyIcon /> Facha vs Facha
        </NeonButton>
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
    <div className="w-full max-w-md mx-auto text-center">
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
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        <NeonButton onClick={() => { playSound(cameraActivateSoundData); setAppState('capture'); }}>
          <CameraIcon /> Activar Cámara
        </NeonButton>
        <NeonButton onClick={() => fileInputRef.current?.click()}>
           <UploadIcon /> Subir Foto
        </NeonButton>
      </div>
       <button onClick={reset} className="mt-6 text-sm text-violet-400 hover:text-white">Volver</button>
      <input type="file" ref={fileInputRef} onChange={(e) => handleImageUpload(e, 'single')} accept="image/*" className="hidden" />
    </div>
  );

  const renderImageView = () => (
    <div className="w-full max-w-lg mx-auto text-center">
      <div className="mb-6 border-4 border-violet-500 rounded-lg overflow-hidden neon-shadow-purple">
         <img src={imageSrc!} alt="User upload" className="w-full h-auto object-cover"/>
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
        <NeonButton onClick={reset} className="w-full sm:w-auto">
           <RefreshCwIcon /> Probar de Nuevo
        </NeonButton>
     </div>
    </div>
  );
  
  const renderResultView = () => result && (
    <div className="text-center w-full max-w-6xl mx-auto flex flex-col items-center">
        <div className="w-full flex flex-col md:flex-row items-start gap-8">
            {/* Left Column: Image */}
            <div className="w-full md:w-1/3 flex-shrink-0">
                <h3 className="text-2xl font-bold mb-4 text-violet-300 text-center">Tu Foto</h3>
                <img src={imageSrc!} alt="Tu foto analizada" className="rounded-lg border-4 border-violet-500 neon-shadow-purple w-full"/>
            </div>
            
            {/* Right Column: Verdict */}
            <div className="w-full md:w-2/3 flex flex-col items-center">
                <h2 className="text-3xl font-bold mb-4 neon-text-fuchsia">El Veredicto</h2>
                <div className="w-full"><FachaMeter score={result.rating} /></div>
                <p className="text-lg md:text-xl text-cyan-300 mt-8 p-4 bg-slate-800/50 border border-cyan-500/30 rounded-lg italic w-full">"{result.comment}"</p>
                <div className="mt-8 w-full flex flex-col md:flex-row gap-6 text-left">
                    <div className="flex-1 bg-slate-800/50 p-4 rounded-lg border border-green-500/30"><h3 className="font-bold text-lg text-green-400 mb-3 flex items-center gap-2"><CheckCircle2 /> Tus puntos fuertes</h3><ul className="space-y-2 text-green-300/90">{result.fortalezas.map((item, i) => <li key={i} className="flex items-start gap-2"><span className="mt-1">✅</span>{item}</li>)}</ul></div>
                    <div className="flex-1 bg-slate-800/50 p-4 rounded-lg border border-yellow-500/30"><h3 className="font-bold text-lg text-yellow-400 mb-3 flex items-center gap-2"><XCircle/> Para mejorar, pibe</h3><ul className="space-y-2 text-yellow-300/90">{result.consejos.map((item, i) => <li key={i} className="flex items-start gap-2"><span className="mt-1">👉</span>{item}</li>)}</ul></div>
                </div>
                <FachaStats rating={result.rating} />
                
                {/* Anuncio sutil después de estadísticas */}
                <AdBanner 
                  slot="9595760046" 
                  size="medium"
                  className="mt-6"
                />
            </div>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <NeonButton onClick={reset}><RefreshCwIcon /> Otra vez</NeonButton>
            <NeonButton onClick={handleExportResult}><DownloadIcon /> Exportar Veredicto</NeonButton>
        </div>
    </div>
  );
  
  const renderErrorView = () => (
      <div className="text-center text-red-400 bg-red-900/50 p-6 rounded-lg border border-red-500">
        <AlertTriangleIcon className="mx-auto mb-4" />
        <p className="font-bold text-lg">¡Upa! Algo salió mal</p>
        <p>{error}</p>
        <NeonButton onClick={reset} className="mt-6"><RefreshCwIcon /> Intentar de nuevo</NeonButton>
      </div>
  );

  const ImageSlot: React.FC<{
    slot: 1 | 2,
    imageSrc: string | null,
    onUploadClick: () => void,
    onCameraClick: () => void
  }> = ({ slot, imageSrc, onUploadClick, onCameraClick }) => (
    <div className="flex flex-col items-center gap-4 w-full md:w-1/2">
        <div className="w-full h-64 bg-slate-800/50 border-2 border-dashed border-violet-500/50 rounded-lg flex items-center justify-center overflow-hidden">
            {imageSrc ? (
                <img src={imageSrc} alt={`Contendiente ${slot}`} className="w-full h-full object-cover" />
            ) : (
                <span className="text-violet-400">Contendiente {slot}</span>
            )}
        </div>
        <div className="flex gap-2">
            <NeonButton onClick={onCameraClick}><CameraIcon /></NeonButton>
            <NeonButton onClick={onUploadClick}><UploadIcon /></NeonButton>
        </div>
    </div>
  );

  const renderBattleSelectView = () => (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 neon-text-fuchsia">Facha vs Facha</h2>
        <p className="text-violet-300 mb-8 text-center">Subí o sacá dos fotos y que la IA decida quién la rompe más.</p>
        <div className="w-full flex flex-col md:flex-row items-start justify-center gap-8 mb-8">
            <ImageSlot
                slot={1}
                imageSrc={imageSrc1}
                onCameraClick={() => { playSound(cameraActivateSoundData); setActiveBattleSlot(1); setAppState('capture'); }}
                onUploadClick={() => fileInputRef1.current?.click()}
            />
            <div className="font-orbitron text-3xl sm:text-4xl md:text-5xl text-fuchsia-500 self-center pt-2 sm:pt-4">VS</div>
             <ImageSlot
                slot={2}
                imageSrc={imageSrc2}
                onCameraClick={() => { playSound(cameraActivateSoundData); setActiveBattleSlot(2); setAppState('capture'); }}
                onUploadClick={() => fileInputRef2.current?.click()}
            />
        </div>
        <NeonButton onClick={analyzeFachaBattle} disabled={!imageData1 || !imageData2}>
            <ZapIcon /> Analizar Batalla
        </NeonButton>
        <button onClick={reset} className="mt-6 text-sm text-violet-400 hover:text-white">Menú Principal</button>
        <input type="file" ref={fileInputRef1} onChange={(e) => handleImageUpload(e, 1)} accept="image/*" className="hidden" />
        <input type="file" ref={fileInputRef2} onChange={(e) => handleImageUpload(e, 2)} accept="image/*" className="hidden" />
    </div>
  );

  const renderBattleResultView = () => battleResult && (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 neon-text-fuchsia">Veredicto Final</h2>
        <div className="w-full flex flex-col md:flex-row items-start justify-center gap-8 mb-8">
            {[1, 2].map(slot => {
                const isWinner = battleResult.winner === slot;
                const imageSrc = slot === 1 ? imageSrc1 : imageSrc2;
                const score = slot === 1 ? battleResult.score1 : battleResult.score2;
                return (
                    <div key={slot} className="relative w-full md:w-1/2 flex flex-col items-center">
                        <div className={`relative border-4 rounded-lg overflow-hidden transition-all duration-500 ${isWinner ? 'border-yellow-400 neon-shadow-fuchsia' : 'border-violet-500'}`}>
                           {isWinner && <div className="absolute top-2 right-2 z-10 text-yellow-300 animate-pulse"><TrophyIcon className="w-8 h-8" style={{filter: 'drop-shadow(0 0 5px #facc15)'}}/></div>}
                           <img src={imageSrc!} alt={`Contendiente ${slot}`} className="w-full h-64 object-cover" />
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 backdrop-blur-sm text-center">
                                <span className={`font-orbitron font-bold text-3xl ${isWinner ? 'text-yellow-300' : 'text-white'}`} style={{textShadow: isWinner ? '0 0 8px #facc15' : 'none'}}>
                                    {score.toFixed(1)}
                                </span>
                            </div>
                        </div>
                        <p className={`mt-2 font-bold ${isWinner ? 'text-yellow-300 text-lg' : 'text-violet-300'}`}>
                           {isWinner ? 'GANADOR' : `Contendiente ${slot}`}
                        </p>
                    </div>
                );
            })}
        </div>
        <p className="text-lg md:text-xl text-cyan-300 mt-4 p-4 bg-slate-800/50 border border-cyan-500/30 rounded-lg italic w-full">
            "{battleResult.comment}"
        </p>
        <div className="flex gap-4 mt-8">
            <NeonButton onClick={() => { setBattleResult(null); setImageData1(null); setImageSrc1(null); setImageData2(null); setImageSrc2(null); setAppState('battleSelect'); }}>
                <RefreshCwIcon /> Otra Batalla
            </NeonButton>
            <NeonButton onClick={reset}>Menú Principal</NeonButton>
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
        <p className="text-lg md:text-xl text-cyan-300 mt-4 p-4 bg-slate-800/50 border border-cyan-500/30 rounded-lg italic w-full">
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
                    <div key={entry.id} className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-lg border border-violet-500/20 w-full transition-all hover:bg-slate-800 hover:border-fuchsia-500">
                        <span className="font-orbitron text-2xl font-bold text-fuchsia-400 w-12 text-center">#{index + 1}</span>
                        <img src={entry.imageSrc} alt={entry.name} className="w-16 h-16 rounded-full object-cover border-2 border-violet-400" />
                        <div className="flex-grow">
                            <p className="font-bold text-lg text-white truncate">{entry.name}</p>
                            <p className="text-sm text-violet-300">Clasificó el {new Date(entry.timestamp).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-orbitron text-3xl font-bold" style={{ color: getScoreColor(entry.rating), textShadow: `0 0 8px ${getScoreColor(entry.rating)}` }}>
                                {entry.rating.toFixed(1)}
                            </p>
                            <p className="text-xs text-violet-400 uppercase">de Facha</p>
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
        </div>
    </div>
  );



  const renderContent = () => {
    if (isLoading) return <Loader />;
    if (showSettings) return renderSettingsView();
    if (appState === 'leaderboard') return renderLeaderboardView();
    
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
        <header className="text-center mb-6 sm:mb-10 cursor-pointer mobile-header" onClick={reset} title="Ir al inicio">
           <h1 className="neon-text-fuchsia flex items-baseline justify-center gap-x-1 md:gap-x-2 mobile-title">
            <span className="font-montserrat font-thin tracking-wider text-4xl sm:text-6xl md:text-7xl lg:text-8xl">Only</span>
            <span className="font-arizonia text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl">Fachas</span>
          </h1>
          <p className="text-violet-300 mt-2 mobile-subtitle">La única IA que sabe de tirar facha.</p>
        </header>
        <div className={containerClasses}>
            {renderContent()}
        </div>
        <footer className="mt-6 sm:mt-10 text-center text-violet-400/60 text-xs sm:text-sm mobile-footer">
            <p>Hecho con IA y mucho amor. Los resultados son para joder, no te la creas tanto.</p>
        </footer>
      </main>
      
      {/* Work in Progress Toast */}
      <WorkInProgressToast
        isVisible={showWipToast}
        onClose={hideWipToast}
        title={wipToastContent.title}
        description={wipToastContent.description}
      />
    </div>
  );
};

export default App;
