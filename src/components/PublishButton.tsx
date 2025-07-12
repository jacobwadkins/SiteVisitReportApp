import React, { useState } from 'react';
import { Share, FileText, Download, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { generatePDF } from '../utils/pdfUtils';
import { generateDOCX } from '../utils/docxUtils';
import { useHapticFeedback } from '../hooks/useHapticFeedback';

interface PublishButtonProps {
  visitId: string;
  className?: string;
}

export const PublishButton: React.FC<PublishButtonProps> = ({ 
  visitId, 
  className = '' 
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const visit = useStore((state) => state.visits.find((v) => v.id === visitId));
  const triggerHaptic = useHapticFeedback();

  const handleExport = async (format: 'pdf' | 'docx') => {
    if (!visit) return;

    setIsExporting(true);
    setShowOptions(false);
    triggerHaptic('medium');

    try {
      if (format === 'pdf') {
        await generatePDF(visit);
      } else {
        await generateDOCX(visit);
      }
      
      triggerHaptic('heavy');
      
      // Show success message
      setTimeout(() => {
        alert(`📄 ${format.toUpperCase()} report generated successfully!`);
      }, 500);
    } catch (error) {
      console.error(`Error generating ${format.toUpperCase()}:`, error);
      alert(`Error generating ${format.toUpperCase()}. Please try again.`);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleOptions = () => {
    setShowOptions(!showOptions);
    triggerHaptic('light');
  };

  return (
    <div className="relative">
      {/* Options Modal */}
      {showOptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                📤 Publish Report
              </h3>
              <button
                onClick={() => setShowOptions(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 space-y-3">
              <button
                onClick={() => handleExport('pdf')}
                disabled={isExporting}
                className="w-full flex items-center space-x-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                <FileText size={24} />
                <div className="text-left">
                  <div className="font-semibold">Export as PDF</div>
                  <div className="text-sm opacity-75">Professional report format</div>
                </div>
              </button>
              
              <button
                onClick={() => handleExport('docx')}
                disabled={isExporting}
                className="w-full flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                <Download size={24} />
                <div className="text-left">
                  <div className="font-semibold">Export as DOCX</div>
                  <div className="text-sm opacity-75">Editable Word document</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Publish Button */}
      <button
        onClick={toggleOptions}
        disabled={isExporting}
        className={`flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation ${className}`}
      >
        {isExporting ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Publishing...</span>
          </>
        ) : (
          <>
            <Share size={20} />
            <span>📤 Publish</span>
          </>
        )}
      </button>
    </div>
  );
};