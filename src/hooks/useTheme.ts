import { useState, useEffect, useCallback } from 'react';

type Theme = 'dark' | 'light';

/**
 * Hook para manejar el tema dark/light
 * Persiste la preferencia en localStorage y aplica las clases CSS
 */
export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar tema desde localStorage al inicializar
  useEffect(() => {
    const savedTheme = localStorage.getItem('onlyfachas_theme') as Theme;
    const systemTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
      setTheme(savedTheme);
    } else {
      setTheme(systemTheme);
    }
    setIsLoaded(true);
  }, []);

  // Aplicar tema al DOM
  useEffect(() => {
    if (!isLoaded) return;

    const root = document.documentElement;
    
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }

    // Guardar en localStorage
    localStorage.setItem('onlyfachas_theme', theme);
  }, [theme, isLoaded]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const setDarkTheme = useCallback(() => {
    setTheme('dark');
  }, []);

  const setLightTheme = useCallback(() => {
    setTheme('light');
  }, []);

  const setSystemTheme = useCallback(() => {
    const systemTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    setTheme(systemTheme);
  }, []);

  return {
    theme,
    isLoaded,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    toggleTheme,
    setDarkTheme,
    setLightTheme,
    setSystemTheme
  };
};
