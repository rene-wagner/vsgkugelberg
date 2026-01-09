import { ApiError } from '@shared/utils/api';
import { useToast } from './useToast';

export function useErrorHandler() {
  const toast = useToast();

  function handleError(error: unknown): string {
    let message = 'An unexpected error occurred';

    if (error instanceof ApiError) {
      switch (error.statusCode) {
        case 401:
          message = 'Du musst dich einloggen, um diese Aktion auszuführen';
          break;
        case 403:
          message = 'Du hast keine Berechtigung für diese Aktion';
          break;
        case 404:
          message = 'Die angeforderte Ressource wurde nicht gefunden';
          break;
        case 500:
          message = 'Server-Fehler. Bitte versuche es später erneut';
          break;
        default:
          message = error.message;
      }
    } else if (error instanceof Error) {
      message = error.message;
    }

    toast.error(message);
    return message;
  }

  return { handleError };
}
