import { useState } from 'react';

/**
 * Encapsula el patrón de "ejecutar una acción async contra Supabase con
 * submitting/error" repetido en los formularios de los paneles de
 * administración (crear, editar, borrar).
 *
 * Recibe el `setError` de un `useAsyncList` (o cualquier setter equivalente)
 * para que la acción y la lista compartan el mismo mensaje de error.
 * Devuelve `true`/`false` para que el componente decida qué hacer solo en
 * caso de éxito (resetear el formulario, recargar la lista, etc.).
 */
export function useAsyncAction(setError: (message: string | null) => void) {
  const [submitting, setSubmitting] = useState(false);

  const run = async (action: () => Promise<unknown>, errorMessage: string): Promise<boolean> => {
    setSubmitting(true);
    setError(null);
    try {
      await action();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : errorMessage);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, run };
}
