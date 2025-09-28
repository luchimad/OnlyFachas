import { useState, useEffect, useCallback } from 'react';

interface AgeVerification {
  isAgeConfirmed: boolean;
  confirmAge: () => void;
  resetAgeVerification: () => void;
}

const AGE_VERIFICATION_KEY = 'onlyFachas_ageVerified';
const AGE_VERIFICATION_EXPIRY_KEY = 'onlyFachas_ageVerifiedExpiry';

// La verificación expira después de 30 días
const VERIFICATION_EXPIRY_DAYS = 30;

/**
 * Hook personalizado para manejar la verificación de edad
 * - Solo se ejecuta una vez cada 30 días
 * - Persiste en localStorage con expiración de 30 días
 * - Se puede resetear manualmente si es necesario
 */
export const useAgeVerification = (): AgeVerification => {
  const [isAgeConfirmed, setIsAgeConfirmed] = useState<boolean>(false);

  // Verificar si ya existe una verificaciÃ³n vÃ¡lida al inicializar
  useEffect(() => {
    const checkExistingVerification = () => {
      try {
        const verified = localStorage.getItem(AGE_VERIFICATION_KEY);
        const expiry = localStorage.getItem(AGE_VERIFICATION_EXPIRY_KEY);
        
        if (verified === 'true' && expiry) {
          const expiryDate = new Date(expiry);
          const now = new Date();
          
          // Si la verificaciÃ³n no ha expirado, confirmar automÃ¡ticamente
          if (now < expiryDate) {
            setIsAgeConfirmed(true);
            return;
          } else {
            // Si expirÃ³, limpiar el localStorage
            localStorage.removeItem(AGE_VERIFICATION_KEY);
            localStorage.removeItem(AGE_VERIFICATION_EXPIRY_KEY);
          }
        }
      } catch (error) {
        console.warn('Error al verificar edad guardada:', error);
        // En caso de error, limpiar datos corruptos
        localStorage.removeItem(AGE_VERIFICATION_KEY);
        localStorage.removeItem(AGE_VERIFICATION_EXPIRY_KEY);
      }
    };

    checkExistingVerification();
  }, []);

  // FunciÃ³n para confirmar la edad
  const confirmAge = useCallback(() => {
    try {
      const now = new Date();
      const expiryDate = new Date(now.getTime() + (VERIFICATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000));
      
      localStorage.setItem(AGE_VERIFICATION_KEY, 'true');
      localStorage.setItem(AGE_VERIFICATION_EXPIRY_KEY, expiryDate.toISOString());
      
      setIsAgeConfirmed(true);
      console.log('Verificación de edad confirmada hasta:', expiryDate.toLocaleDateString());
    } catch (error) {
      console.error('Error al guardar verificación de edad:', error);
      // Aún así confirmar para la sesión actual
      setIsAgeConfirmed(true);
    }
  }, []);

  // FunciÃ³n para resetear la verificaciÃ³n (Ãºtil para testing o si el usuario quiere volver a verificar)
  const resetAgeVerification = useCallback(() => {
    try {
      localStorage.removeItem(AGE_VERIFICATION_KEY);
      localStorage.removeItem(AGE_VERIFICATION_EXPIRY_KEY);
      setIsAgeConfirmed(false);
      console.log('VerificaciÃ³n de edad reseteada');
    } catch (error) {
      console.error('Error al resetear verificaciÃ³n de edad:', error);
    }
  }, []);

  return {
    isAgeConfirmed,
    confirmAge,
    resetAgeVerification
  };
};



