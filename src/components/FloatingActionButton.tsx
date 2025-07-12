import React from 'react';
import { Plus } from 'lucide-react';
import { useHapticFeedback } from '../hooks/useHapticFeedback';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  const triggerHaptic = useHapticFeedback();

  const handleClick = () => {
    triggerHaptic('medium');
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl focus:ring-4 focus:ring-blue-500/50 transition-all duration-200 flex items-center justify-center z-40 active:scale-95 touch-manipulation"
      style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
      aria-label="Create new visit"
    >
      <Plus size={24} />
    </button>
  );
};