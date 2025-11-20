import React from 'react';
import { FiVolume2, FiVolumeX } from 'react-icons/fi';
import { InstagramIcon } from './Icons';
import NotificationToast from './NotificationToast';
import { MaintenanceBanner, RateLimitBanner, RequestDelayBanner } from './EmergencyBanners';
import DevModeMenu from './DevModeMenu';
import { useAudio } from '../contexts/AudioContext';

type AppState = 'welcome' | 'select' | 'capture' | 'analyze' | 'result' | 'error' | 'battleSelect' | 'battleResult' | 'enhancing' | 'enhanceResult' | 'leaderboard' | 'privacy' | 'terms' | 'comingSoon' | 'about' | 'faq';

interface LayoutProps {
    children: React.ReactNode;

    // Header props
    onReset: () => void;
    onNavigate: (state: AppState) => void;

    // Content container styling
    containerClasses?: string;

    // Notification props
    showNotification: boolean;
    notificationContent: {
        type: 'error' | 'warning' | 'info' | 'success';
        title: string;
        message: string;
    };
    onCloseNotification: () => void;

    // Emergency banner props
    showMaintenanceBanner: boolean;
    showRateLimitBanner: boolean;
    showRequestDelayBanner: boolean;
    onCloseMaintenanceBanner: () => void;
    onCloseRateLimitBanner: () => void;
    onCloseRequestDelayBanner: () => void;
    remainingRequests?: number;
    maxRequests?: number;
    requestDelay?: number;

    // Dev mode props
    devSettings: {
        showDevMenu: boolean;
        forceScore: number | null;
        useMockData: boolean;
    };
    onCloseDevMenu: () => void;
    onToggleMockData: () => void;
    onSetForceScore: (score: number | null) => void;
    onResetDevSettings: () => void;
}

const Layout: React.FC<LayoutProps> = ({
    children,
    onReset,
    onNavigate,
    containerClasses,
    showNotification,
    notificationContent,
    onCloseNotification,
    showMaintenanceBanner,
    showRateLimitBanner,
    showRequestDelayBanner,
    onCloseMaintenanceBanner,
    onCloseRateLimitBanner,
    onCloseRequestDelayBanner,
    remainingRequests,
    maxRequests,
    requestDelay,
    devSettings,
    onCloseDevMenu,
    onToggleMockData,
    onSetForceScore,
    onResetDevSettings,
}) => {
    // Use audio context
    const { musicEnabled, effectsEnabled, setMusicEnabled, setEffectsEnabled } = useAudio();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 mobile-container selection:bg-fuchsia-500 selection:text-white">
            <div className="absolute top-0 left-0 w-full h-full bg-grid-violet-500/20 [mask-image:linear-gradient(to_bottom,white_5%,transparent_90%)]"></div>
            <main className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center justify-center">
                {/* Header */}
                <header className="text-center mb-6 sm:mb-10 mobile-header">
                    {/* Audio Controls */}
                    <div className="flex justify-center gap-2 mb-4">
                        {/* Music Control */}
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

                        {/* Effects Control */}
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

                    {/* Logo/Title */}
                    <div
                        className="cursor-pointer"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onReset();
                        }}
                        title="Ir al inicio"
                    >
                        <h1 className="neon-text-fuchsia flex items-baseline justify-center gap-x-1 md:gap-x-2 mobile-title">
                            <span className="font-montserrat font-thin tracking-wider text-4xl sm:text-6xl md:text-7xl lg:text-8xl">Only</span>
                            <span className="font-arizonia text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl">Fachas</span>
                        </h1>
                        <p className="text-violet-300 mt-2 mobile-subtitle animate-pulse-90bpm">La única IA que sabe de tirar facha.</p>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center justify-center gap-2 mt-4 text-sm text-violet-400/80">
                        <button
                            onClick={() => onNavigate('about')}
                            className="hover:text-violet-300 transition-colors duration-200 underline"
                        >
                            Sobre Nosotros
                        </button>
                        <span className="text-violet-400/40">|</span>
                        <button
                            onClick={() => onNavigate('faq')}
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

                {/* Main Content */}
                <div className={containerClasses}>
                    {children}
                </div>

                {/* Footer */}
                <footer className="mt-6 sm:mt-10 text-center text-violet-400/60 text-xs sm:text-sm mobile-footer">
                    <p className="mb-2">Hecho con mucho tiempo libre y mucho amor. Los resultados son para joder, no te la creas tanto.</p>
                    <div className="flex justify-center gap-4 text-violet-400/80">
                        <button
                            onClick={() => onNavigate('privacy')}
                            className="hover:text-violet-300 transition-colors duration-200 underline"
                        >
                            Privacidad
                        </button>
                        <span className="text-violet-400/40">•</span>
                        <button
                            onClick={() => onNavigate('terms')}
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
                onClose={onCloseNotification}
                type={notificationContent.type}
                title={notificationContent.title}
                message={notificationContent.message}
                duration={5000}
            />

            {/* Emergency Banners */}
            {showMaintenanceBanner && (
                <MaintenanceBanner onClose={onCloseMaintenanceBanner} />
            )}

            {showRateLimitBanner && (
                <RateLimitBanner
                    remainingRequests={remainingRequests || 0}
                    maxRequests={maxRequests || 10}
                    onClose={onCloseRateLimitBanner}
                />
            )}

            {showRequestDelayBanner && (
                <RequestDelayBanner
                    delaySeconds={Math.ceil((requestDelay || 0) / 1000)}
                    onClose={onCloseRequestDelayBanner}
                />
            )}

            {/* Dev Mode Menu */}
            <DevModeMenu
                isOpen={devSettings.showDevMenu}
                onClose={onCloseDevMenu}
                forceScore={devSettings.forceScore}
                useMockData={devSettings.useMockData}
                onToggleMockData={onToggleMockData}
                onSetForceScore={onSetForceScore}
                onReset={onResetDevSettings}
            />
        </div>
    );
};

export default Layout;
