import { useState, useRef, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import AAAAAA from '@/components/art/AAAAAA'; // Adjust path as necessary

const TOAST_LIMIT = 5; // Number of toasts before confetti
const RESET_TIMEOUT_MS = 2000; // Time window for consecutive clicks (ms)
const CONFETTI_DURATION_MS = 10000; // How long confetti stays visible (ms) - Increased to 10s

export const useAAAAtoast = () => {
  const [showConfetti, setShowConfetti] = useState(false);
  const toastCountRef = useRef(0);
  const resetTimerRef = useRef(null);
  const confettiTimerRef = useRef(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
      if (confettiTimerRef.current) {
        clearTimeout(confettiTimerRef.current);
      }
    };
  }, []);

  const triggerAAAAtoast = useCallback((aaaaProps, toastOptions = { position: 'bottom-center' }) => {
    // Clear the existing reset timer
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }

    // Increment count
    toastCountRef.current += 1;

    if (toastCountRef.current >= TOAST_LIMIT) {
      // Trigger confetti
      setShowConfetti(true);
      toastCountRef.current = 0; // Reset count immediately

      // Clear any existing confetti timer
      if (confettiTimerRef.current) {
        clearTimeout(confettiTimerRef.current);
      }
      // Set timer to hide confetti after duration
      confettiTimerRef.current = setTimeout(() => {
        setShowConfetti(false);
        confettiTimerRef.current = null;
      }, CONFETTI_DURATION_MS);

    } else {
      // Show the regular AAAAAA toast
      toast.custom(
        <AAAAAA {...aaaaProps} />,
        toastOptions
      );

      // Set a new timer to reset the count if no more toasts arrive soon
      resetTimerRef.current = setTimeout(() => {
        toastCountRef.current = 0;
        resetTimerRef.current = null;
      }, RESET_TIMEOUT_MS);
    }
  }, []); // No dependencies needed as refs and setState are stable

  return { triggerAAAAtoast, showConfetti };
};

// Default export for convenience
export default useAAAAtoast;
