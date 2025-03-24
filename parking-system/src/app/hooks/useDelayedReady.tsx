import { useState, useEffect, useRef } from 'react';

interface DelayedReadyOptions {
  delay?: number;
  dependencies: any[];
  condition: boolean;
}

/**
 * Custom hook to delay showing content until conditions are met
 * @param options.delay - Delay in milliseconds (default: 1000ms)
 * @param options.dependencies - Array of dependencies for the effect
 * @param options.condition - Boolean condition that must be true for isReady to become true
 * @returns isReady - Boolean indicating if component should render
 */
export function useDelayedReady({
  delay = 1000,
  dependencies,
  condition
}: DelayedReadyOptions) {
  // Always create the same hooks in the same order
  const [isReady, setIsReady] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use a stable useEffect with consistent return
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    // Reset ready state when conditions change
    setIsReady(false);
    
    // Only set up timer if condition is met
    if (condition) {
      timerRef.current = setTimeout(() => {
        setIsReady(true);
      }, delay);
    }
    
    // Cleanup on unmount or when dependencies change
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  // Use a stable dependencies array structure
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, condition, delay]);

  return isReady;
}