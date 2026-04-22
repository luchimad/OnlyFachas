/**
 * Client-side image validation before sending to the API.
 * Keeps the validation logic in one place so every upload point can reuse it.
 */

export interface ImageValidationError {
  code: 'INVALID_TYPE' | 'TOO_LARGE' | 'TOO_SMALL';
  message: string;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const MIN_SIZE_BYTES = 1024; // 1 KB – reject blank/empty files

export const validateImageFile = (file: File): ImageValidationError | null => {
  if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
    return {
      code: 'INVALID_TYPE',
      message: `Formato no soportado. Usá JPG, PNG o WebP, che.`,
    };
  }

  if (file.size > MAX_SIZE_BYTES) {
    return {
      code: 'TOO_LARGE',
      message: `La foto pesa más de ${MAX_SIZE_MB}MB. Achicala un poco y volvé a intentar.`,
    };
  }

  if (file.size < MIN_SIZE_BYTES) {
    return {
      code: 'TOO_SMALL',
      message: `La foto está vacía o es muy pequeña. Subí una foto real, pibe.`,
    };
  }

  return null;
};
