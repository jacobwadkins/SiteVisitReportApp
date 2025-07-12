import React from 'react';
import { format } from 'date-fns';
import { Trash2, Calendar, MapPin, Hash, User, Building } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useHapticFeedback } from '../hooks/useHapticFeedback';

interface VisitListProps {
  onVisitSelect: (visitId: string) => void;
}

export const VisitList: React.FC<VisitListProps> = ({ onVisitSelect }) => {
  const visits = useStore((state) => state.visits);
  const deleteVisit = useStore((state) => state.deleteVisit);
  const triggerHaptic = useHapticFeedback();

  const sortedVisits = [...visits].sort(
    (a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
  );

  const handleDelete = (e: React.MouseEvent, visitId: string) => {
    e.stopPropagation();
    triggerHaptic('medium');
    
    if (window.confirm('Are you sure you want to delete this site visit?')) {
      deleteVisit(visitId);
    }
  };

  const handleVisitClick = (visitId: string) => {
    triggerHaptic('light');
    onVisitSelect(visitId);
  };

  if (visits.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <Building size={40} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            📋 Site Visits
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Tap the + button to create your first site visit report
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 space-y-4">
      {sortedVisits.map((visit) => (
        <div
          key={visit.id}
          onClick={() => handleVisitClick(visit.id)}
          className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-blue-600 active:scale-[0.98]"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                <Calendar size={14} />
                <span>{format(new Date(visit.visitDate), 'MMM dd, yyyy')}</span>
              </div>
              
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-1 truncate">
                <User size={16} className="inline mr-1" /> {visit.clientName}   |   <MapPin size={16} className="inline mr-1" /> {visit.siteName}   |   <Hash size={16} className="inline mr-1" /> {visit.projectNo}
              </h3>
              
              
              {visit.photos.length > 0 && (
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                  📸 {visit.photos.length} photo{visit.photos.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
            
            <button
              onClick={(e) => handleDelete(e, visit.id)}
              className="ml-3 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors touch-manipulation"
              aria-label="Delete visit"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};