import { useEffect, useRef } from 'react';

interface UseDebouncedPersistenceOptions<T> {
  value: T;
  onPersist: (value: T) => Promise<void>;
  delay?: number;
}

export function useDebouncedPersistence<T>({
  value,
  onPersist,
  delay = 1000,
}: UseDebouncedPersistenceOptions<T>) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousValueRef = useRef<T>(value);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip persistence on first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousValueRef.current = value;
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for persistence
    timeoutRef.current = setTimeout(() => {
      if (value !== previousValueRef.current) {
        onPersist(value).catch((error) => {
          console.error('Failed to persist state:', error);
        });
        previousValueRef.current = value;
      }
    }, delay);

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, onPersist, delay]);

  // Expose a method to force immediate persistence
  const persistNow = async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (value !== previousValueRef.current) {
      await onPersist(value);
      previousValueRef.current = value;
    }
  };

  return { persistNow };
}
