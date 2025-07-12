import { useEffect } from 'react';
import { useStore } from '../store/useStore';

export function useOfflineStatus() {
  const setOfflineStatus = useStore((state) => state.setOfflineStatus);
  const isOffline = useStore((state) => state.isOffline);

  useEffect(() => {
    const handleOnline = () => setOfflineStatus(false);
    const handleOffline = () => setOfflineStatus(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial status
    setOfflineStatus(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOfflineStatus]);

  return isOffline;
}