import React, { createContext, useContext, ReactNode } from 'react';
import { useAudioControls } from '../hooks/useAudioControls';

interface AudioContextType {
    musicEnabled: boolean;
    effectsEnabled: boolean;
    musicVolume: number;
    effectsVolume: number;
    setMusicEnabled: (enabled: boolean) => void;
    setEffectsEnabled: (enabled: boolean) => void;
    setMusicVolume: (volume: number) => void;
    setEffectsVolume: (volume: number) => void;
    playEffect: (audioPath: string) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

interface AudioProviderProps {
    children: ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
    // Use the existing audio controls hook
    const audioControls = useAudioControls();

    const value: AudioContextType = {
        musicEnabled: audioControls.musicEnabled,
        effectsEnabled: audioControls.effectsEnabled,
        musicVolume: audioControls.musicVolume,
        effectsVolume: audioControls.effectsVolume,
        setMusicEnabled: audioControls.setMusicEnabled,
        setEffectsEnabled: audioControls.setEffectsEnabled,
        setMusicVolume: audioControls.setMusicVolume,
        setEffectsVolume: audioControls.setEffectsVolume,
        playEffect: audioControls.playEffect,
    };

    return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};

// Custom hook to use the audio context
export const useAudio = (): AudioContextType => {
    const context = useContext(AudioContext);
    if (context === undefined) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};
