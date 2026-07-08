import { useState, useEffect } from 'react';

/**
 * Hook para persistir valores en localStorage.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch {
      // Ignorar errores de escritura (modo privado, cuota llena…)
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
