import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { VisitList } from './components/VisitList';
import VisitDetail from './components/VisitDetail';
import { NewVisitModal } from './components/NewVisitModal';
import { FloatingActionButton } from './components/FloatingActionButton';
import { PublishButton } from './components/PublishButton';
import { useStore } from './store/useStore';
import { useOfflineStatus } from './hooks/useOfflineStatus';
import { VisitDetailRef } from './components/VisitDetail';

type View = 'list' | 'detail';

function App() {
  const [currentView, setCurrentView] = useState<View>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const visitDetailRef = useRef<VisitDetailRef>(null);
  
  const currentVisitId = useStore((state) => state.currentVisitId);
  const setCurrentVisit = useStore((state) => state.setCurrentVisit);
  const theme = useStore((state) => state.theme);
  const visits = useStore((state) => state.visits);
  
  useOfflineStatus();

  // Initialize theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  const handleVisitSelect = (visitId: string) => {
    setCurrentVisit(visitId);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentVisit(null);
    setCurrentView('list');
  };

  const handleVisitCreated = (visitId: string) => {
    setCurrentVisit(visitId);
    setCurrentView('detail');
  };

  const handlePublish = () => {
    if (visitDetailRef.current) {
      visitDetailRef.current.handlePublish();
    }
  };

  const currentVisit = visits.find((v) => v.id === currentVisitId);
  const headerTitle = currentView === 'list' 
    ? 'Site Visits' 
    : currentVisit?.siteName || 'Site Visit';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header
        title={headerTitle}
        showBack={currentView === 'detail'}
        showPublish={currentView === 'detail'}
        onBack={handleBackToList}
        onPublish={handlePublish}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {currentView === 'list' ? (
          <VisitList onVisitSelect={handleVisitSelect} />
        ) : currentVisitId ? (
          <VisitDetail 
            visitId={currentVisitId} 
            ref={visitDetailRef}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              Visit not found
            </div>
          </div>
        )}
      </main>

      {currentView === 'list' && (
        <FloatingActionButton onClick={() => setIsModalOpen(true)} />
      )}

      <NewVisitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onVisitCreated={handleVisitCreated}
      />

      <div className="safe-area-inset-bottom" />
    </div>
  );
}

export default App;
