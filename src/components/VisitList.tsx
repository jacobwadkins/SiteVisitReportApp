import React from 'react';
import { format } from 'date-fns';
import { Trash2, Calendar, MapPin, Hash, User, Building, Share } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { generatePDF } from '../utils/pdfUtils';
import { generateDOCX } from '../utils/docxUtils';

interface VisitListProps {
  onVisitSelect: (visitId: string) => void;
}

export const VisitList: React.FC<VisitListProps> = ({ onVisitSelect }) => {
  const visits = useStore((state) => state.visits);
  const deleteVisit = useStore((state) => state.deleteVisit);
  const triggerHaptic = useHapticFeedback();
  const [exportingVisitId, setExportingVisitId] = React.useState<string | null>(null);
  const [showExportModal, setShowExportModal] = React.useState<string | null>(null);

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

  const handleExportClick = (e: React.MouseEvent, visitId: string) => {
    e.stopPropagation();
    setShowExportModal(visitId);
    triggerHaptic('light');
  };

  const handleExport = async (visitId: string, format: 'pdf' | 'docx') => {
    const visit = visits.find(v => v.id === visitId);
    if (!visit) return;

    setExportingVisitId(visitId);
    setShowExportModal(null);
    triggerHaptic('medium');

    try {
      if (format === 'pdf') {
        await generatePDF(visit, photosPerPage);
      } else {
        await generateDOCX(visit, photosPerPage);
      }
      
      triggerHaptic('heavy');
      
      // Show non-blocking success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
      successMessage.textContent = `📄 ${format.toUpperCase()} report generated successfully!`;
      document.body.appendChild(successMessage);
      
      // Auto-remove after 3 seconds
      setTimeout(() => {
        successMessage.style.opacity = '0';
        successMessage.style.transform = 'translate(-50%, -20px)';
        setTimeout(() => {
          if (document.body.contains(successMessage)) {
            document.body.removeChild(successMessage);
          }
        }, 300);
      }, 3000);
    } catch (error) {
      console.error(`Error generating ${format.toUpperCase()}:`, error);
      alert(`Error generating ${format.toUpperCase()}. Please try again.`);
    } finally {
      setExportingVisitId(null);
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
    <>
      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                📤 Export Report
              </h3>
              <button
                onClick={() => setShowExportModal(null)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="p-4 space-y-3">
              {/* Photos Per Page Toggle */}
              {(() => {
                const visit = visits.find(v => v.id === showExportModal);
                return visit && visit.photos.length > 0 ? (
                  <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Photos per page:
                      </span>
                      <div className="flex bg-gray-200 dark:bg-gray-600 rounded-lg p-1">
                        <button
                          onClick={() => {
                            setPhotosPerPage(2);
                            triggerHaptic('light');
                          }}
                          className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                            photosPerPage === 2
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                          }`}
                        >
                          2
                        </button>
                        <button
                          onClick={() => {
                            setPhotosPerPage(6);
                            triggerHaptic('light');
                          }}
                          className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                            photosPerPage === 6
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                          }`}
                        >
                          6
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null;
              })()}
              
              <button
                onClick={() => handleExport(showExportModal, 'pdf')}
                disabled={exportingVisitId === showExportModal}
                className="w-full flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  📄
                </div>
                <div className="text-left">
                  <div className="font-semibold">Export as PDF</div>
                  <div className="text-sm opacity-75">Professional report format</div>
                </div>
              </button>
              
              <button
                onClick={() => handleExport(showExportModal, 'docx')}
                disabled={exportingVisitId === showExportModal}
                className="w-full flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  📝
                </div>
                <div className="text-left">
                  <div className="font-semibold">Export as DOCX</div>
                  <div className="text-sm opacity-75">Editable Word document</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay when exporting */}
  const photosPerPage = useStore((state) => state.photosPerPage);
  const setPhotosPerPage = useStore((state) => state.setPhotosPerPage);
      {exportingVisitId && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-gray-900 dark:text-white font-medium">Exporting report...</span>
            </div>
          </div>
        </div>
      )}
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
                <div className="space-y-1">
                  <div className="flex items-center text-base">
                    <User size={16} className="mr-2 flex-shrink-0" />
                    <span className="truncate">{visit.clientName}</span>
                  </div>
                  <div className="flex items-center text-base">
                    <MapPin size={16} className="mr-2 flex-shrink-0" />
                    <span className="truncate">{visit.siteName}</span>
                  </div>
                  <div className="flex items-center text-base">
                    <Hash size={16} className="mr-2 flex-shrink-0" />
                    <span className="truncate">{visit.projectNo}</span>
                  </div>
                </div>
              </h3>
              
              
              {visit.photos.length > 0 && (
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                  📸 {visit.photos.length} photo{visit.photos.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
            
            <div className="ml-3 flex space-x-1">
              <button
                onClick={(e) => handleExportClick(e, visit.id)}
                disabled={exportingVisitId === visit.id}
                className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors touch-manipulation disabled:opacity-50"
                aria-label="Export visit"
              >
                {exportingVisitId === visit.id ? (
                  <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                ) : (
                  <Share size={16} />
                )}
              </button>
              <button
                onClick={(e) => handleDelete(e, visit.id)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors touch-manipulation"
                aria-label="Delete visit"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
      </div>
    </>
  );
};