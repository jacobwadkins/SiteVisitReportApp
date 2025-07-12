import React, { useState, useEffect } from 'react';
import { forwardRef, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit3, ChevronDown, ChevronUp, Share, FileText, Download, X, User, MapPin, Hash, Indent } from 'lucide-react';
import { useStore } from '../store/useStore';
import { visitSchema, VisitFormData } from '../utils/validation';
import { useDebounce } from '../hooks/useDebounce';
import { PhotoGrid } from './PhotoGrid';
import { generatePDF } from '../utils/pdfUtils';
import { generateDOCX } from '../utils/docxUtils';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { format } from 'date-fns';

interface VisitDetailProps {
  visitId: string;
}

export interface VisitDetailRef {
  handlePublish: () => void;
}

const VisitDetail = forwardRef<VisitDetailRef, VisitDetailProps>(({ visitId }, ref) => {
  const [activeTab, setActiveTab] = useState<'report' | 'photos'>('report');
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const visit = useStore((state) => state.visits.find((v) => v.id === visitId));
  const updateVisit = useStore((state) => state.updateVisit);
  const triggerHaptic = useHapticFeedback();

  // Helper functions for display numbering
  const getDisplayNumber = (index: number, isTabbed: boolean, tabbedArray: boolean[]): string => {
    if (isTabbed) return '•';
    
    // Count how many non-tabbed items come before this index
    let count = 1;
    for (let i = 0; i < index; i++) {
      if (!tabbedArray[i]) {
        count++;
      }
    }
    return count.toString();
  };

  const getDisplayLetter = (index: number, isTabbed: boolean, tabbedArray: boolean[]): string => {
    if (isTabbed) return '•';
    
    // Count how many non-tabbed items come before this index
    let count = 0;
    for (let i = 0; i < index; i++) {
      if (!tabbedArray[i]) {
        count++;
      }
    }
    return String.fromCharCode(97 + count); // 'a', 'b', 'c', etc.
  };

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VisitFormData>({
    resolver: zodResolver(visitSchema),
    defaultValues: visit ? {
      clientName: visit.clientName,
      siteName: visit.siteName,
      projectNo: visit.projectNo,
      visitDate: visit.visitDate,
      preparedBy: visit.preparedBy,
    } : undefined,
  });

  const watchedValues = watch();
  const debouncedValues = useDebounce(watchedValues, 500);

  // Update form values when visit changes
  useEffect(() => {
    if (visit) {
      setValue('clientName', visit.clientName);
      setValue('siteName', visit.siteName);
      setValue('projectNo', visit.projectNo);
      setValue('visitDate', visit.visitDate);
      setValue('preparedBy', visit.preparedBy);
    }
  }, [visit?.id, setValue]);

  // Auto-save form changes
  useEffect(() => {
    if (visit && debouncedValues && (
      visit.clientName !== debouncedValues.clientName ||
      visit.siteName !== debouncedValues.siteName ||
      visit.projectNo !== debouncedValues.projectNo ||
      visit.visitDate !== debouncedValues.visitDate ||
      visit.preparedBy !== debouncedValues.preparedBy
    )) {
      const updates: Partial<Visit> = {};
      if (visit.clientName !== debouncedValues.clientName) updates.clientName = debouncedValues.clientName;
      if (visit.siteName !== debouncedValues.siteName) updates.siteName = debouncedValues.siteName;
      if (visit.projectNo !== debouncedValues.projectNo) updates.projectNo = debouncedValues.projectNo;
      if (visit.visitDate !== debouncedValues.visitDate) updates.visitDate = debouncedValues.visitDate;
      if (visit.preparedBy !== debouncedValues.preparedBy) updates.preparedBy = debouncedValues.preparedBy;
      
      if (Object.keys(updates).length > 0) {
        updateVisit(visitId, updates);
      }
    }
  }, [debouncedValues, visit, visitId, updateVisit]);

  // Auto-save report fields
  const [reportFields, setReportFields] = useState({
    background: visit?.background || '',
  });
  
  // Handle observations as individual inputs
  const [observationInputs, setObservationInputs] = useState<string[]>(() => {
    if (visit?.observations) {
      const lines = visit.observations.split('\n').filter(line => line.trim());
      return lines.length > 0 ? [...lines, ''] : ['', '', ''];
    }
    return ['', '', ''];
  });
  
  // Track which observations are tabbed (bullet points)
  const [tabbedObservations, setTabbedObservations] = useState<boolean[]>(() => {
    if (visit?.observations) {
      const lines = visit.observations.split('\n').filter(line => line.trim());
      return lines.map(line => line.startsWith('\t') || line.startsWith('    '));
    }
    return [];
  });

  // Handle follow-ups as individual inputs
  const [followupInputs, setFollowupInputs] = useState<string[]>(() => {
    if (visit?.followups) {
      const lines = visit.followups.split('\n').filter(line => line.trim());
      return lines.length > 0 ? [...lines, ''] : ['', '', ''];
    }
    return ['', '', ''];
  });
  
  // Track which follow-ups are tabbed (bullet points)
  const [tabbedFollowups, setTabbedFollowups] = useState<boolean[]>(() => {
    if (visit?.followups) {
      const lines = visit.followups.split('\n').filter(line => line.trim());
      return lines.map(line => line.startsWith('\t') || line.startsWith('    '));
    }
    return [];
  });

  const debouncedReportFields = useDebounce(reportFields, 500);
  const debouncedObservations = useDebounce(observationInputs, 500);
  const debouncedFollowups = useDebounce(followupInputs, 500);

  // Update report fields when visit changes
  useEffect(() => {
    if (visit) {
      setReportFields({
        background: visit.background || '',
      });
      
      if (visit.observations) {
        const lines = visit.observations.split('\n').filter(line => line.trim());
        setObservationInputs(lines.length > 0 ? [...lines, ''] : ['', '', '']);
        setTabbedObservations(lines.map(line => line.startsWith('\t') || line.startsWith('    ')));
      } else {
        setObservationInputs(['', '', '']);
        setTabbedObservations([]);
      }
      
      if (visit.followups) {
        const lines = visit.followups.split('\n').filter(line => line.trim());
        setFollowupInputs(lines.length > 0 ? [...lines, ''] : ['', '', '']);
        setTabbedFollowups(lines.map(line => line.startsWith('\t') || line.startsWith('    ')));
      } else {
        setFollowupInputs(['', '', '']);
        setTabbedFollowups([]);
      }
    }
  }, [visit?.id]);

  useEffect(() => {
    if (visit && (
      visit.background !== debouncedReportFields.background
    )) {
      updateVisit(visitId, debouncedReportFields);
    }
  }, [debouncedReportFields, visit?.background, visitId, updateVisit]);
  
  // Auto-save observations
  useEffect(() => {
    if (visit) {
      const observationsText = observationInputs
        .map((obs, index) => {
          if (!obs.trim()) return '';
          const cleanObs = obs.replace(/^[\t\s]+/, ''); // Remove existing tabs/spaces
          return tabbedObservations[index] ? `\t${cleanObs}` : cleanObs;
        })
        .filter(obs => obs.trim())
        .join('\n');
      
      if (visit.observations !== observationsText) {
        updateVisit(visitId, { observations: observationsText });
      }
    }
  }, [debouncedObservations, tabbedObservations, visit?.observations, visitId, updateVisit]);
  
  // Auto-save follow-ups
  useEffect(() => {
    if (visit) {
      const followupsText = followupInputs
        .map((followup, index) => {
          if (!followup.trim()) return '';
          const cleanFollowup = followup.replace(/^[\t\s]+/, ''); // Remove existing tabs/spaces
          return tabbedFollowups[index] ? `\t${cleanFollowup}` : cleanFollowup;
        })
        .filter(followup => followup.trim())
        .join('\n');
      
      if (visit.followups !== followupsText) {
        updateVisit(visitId, { followups: followupsText });
      }
    }
  }, [debouncedFollowups, tabbedFollowups, visit?.followups, visitId, updateVisit]);
  
  const handleObservationChange = (index: number, value: string) => {
    const newInputs = [...observationInputs];
    // Clean the value to remove any existing tabs/spaces at the beginning
    newInputs[index] = value.replace(/^[\t\s]+/, '');
    
    // If user typed in the last input and it's not empty, add a new empty input
    if (index === newInputs.length - 1 && value.trim() !== '') {
      newInputs.push('');
      setTabbedObservations([...tabbedObservations, false]);
    }
    
    setObservationInputs(newInputs);
  };
  
  const toggleObservationTab = (index: number) => {
    const newTabbedObservations = [...tabbedObservations];
    newTabbedObservations[index] = !newTabbedObservations[index];
    setTabbedObservations(newTabbedObservations);
    triggerHaptic('light');
  };
  
  const handleFollowupChange = (index: number, value: string) => {
    const newInputs = [...followupInputs];
    // Clean the value to remove any existing tabs/spaces at the beginning
    newInputs[index] = value.replace(/^[\t\s]+/, '');
    
    // If user typed in the last input and it's not empty, add a new empty input
    if (index === newInputs.length - 1 && value.trim() !== '') {
      newInputs.push('');
      setTabbedFollowups([...tabbedFollowups, false]);
    }
    
    setFollowupInputs(newInputs);
  };
  
  const toggleFollowupTab = (index: number) => {
    const newTabbedFollowups = [...tabbedFollowups];
    newTabbedFollowups[index] = !newTabbedFollowups[index];
    setTabbedFollowups(newTabbedFollowups);
    triggerHaptic('light');
  };

  // Auto-collapse header when form is complete
  useEffect(() => {
    if (visit && visit.clientName && visit.siteName && visit.projectNo && visit.visitDate && visit.preparedBy && !isEditing) {
      const timer = setTimeout(() => setIsHeaderCollapsed(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [visit, isEditing]);

  const handlePublish = () => {
    setShowPublishModal(true);
    triggerHaptic('light');
  };

  const handleExport = async (format: 'pdf' | 'docx') => {
    if (!visit) return;

    setIsExporting(true);
    setShowPublishModal(false);
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

  // Expose handlePublish to parent component
  useImperativeHandle(ref, () => ({
    handlePublish
  }), []);

  if (!visit) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Visit not found
        </div>
      </div>
    );
  }

  const toggleHeaderCollapse = () => {
    setIsHeaderCollapsed(!isHeaderCollapsed);
    if (!isHeaderCollapsed) {
      setIsEditing(false);
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (isHeaderCollapsed) {
      setIsHeaderCollapsed(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                📤 Publish Report
              </h3>
              <button
                onClick={() => setShowPublishModal(false)}
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

      {/* Loading overlay when exporting */}
      {isExporting && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-gray-900 dark:text-white font-medium">Publishing report...</span>
            </div>
          </div>
        </div>
      )}

      {/* Visit Header */}
      <div className="m-4 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="p-5 relative">
          <button
            onClick={toggleEdit}
            className={`absolute top-4 right-4 p-2 rounded-lg transition-colors touch-manipulation ${
              isHeaderCollapsed
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
            style={{ display: isHeaderCollapsed ? 'block' : 'none' }}
          >
            <Edit3 size={16} />
          </button>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Site Visit Details
            </h2>
            <button
              onClick={toggleHeaderCollapse}
              className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              {isHeaderCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </button>
          </div>

          {isHeaderCollapsed && (
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <div className="font-semibold text-blue-800 dark:text-blue-300">
                <User size={16} className="inline mr-1" />{visit.clientName}   |   <MapPin size={16} className="inline mr-1" />{visit.siteName}   |   <Hash size={16} className="inline mr-1" />{visit.projectNo}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {format(new Date(visit.visitDate), 'MMM dd, yyyy')}
              </div>
            </div>
          )}

          {!isHeaderCollapsed && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Client Name
                </label>
                <input
                  {...register('clientName')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter client name"
                />
                {errors.clientName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.clientName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Site Name
                </label>
                <input
                  {...register('siteName')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter site name"
                />
                {errors.siteName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.siteName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project No.
                </label>
                <input
                  {...register('projectNo')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter project number"
                />
                {errors.projectNo && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.projectNo.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Visit Date
                </label>
                <input
                  {...register('visitDate')}
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.visitDate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.visitDate.message}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mx-4 mb-4 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="flex">
          <button
            onClick={() => setActiveTab('report')}
            className={`flex-1 py-4 px-6 font-medium transition-colors ${
              activeTab === 'report'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            📝 Report
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex-1 py-4 px-6 font-medium transition-colors ${
              activeTab === 'photos'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            📸 Photos ({visit.photos.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 mx-4 mb-4">
        {activeTab === 'report' ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3 pb-2 border-b-2 border-blue-600">
                Background & Purpose
              </h3>
              <textarea
                value={reportFields.background}
                onChange={(e) =>
                  setReportFields((prev) => ({ ...prev, background: e.target.value }))
                }
                className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                placeholder="Describe the background and purpose of this site visit..."
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3 pb-2 border-b-2 border-blue-600">
                Site Observations
              </h3>
              <div className="space-y-3">
                {observationInputs.map((observation, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className={`flex-shrink-0 w-8 h-10 flex items-center justify-center rounded-lg font-semibold ${
                      tabbedObservations[index] 
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' 
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                    }`}>
                      {getDisplayNumber(index, tabbedObservations[index], tabbedObservations)}.
                    </div>
                    <button
                      onClick={() => toggleObservationTab(index)}
                      className={`flex-shrink-0 p-2 rounded-lg transition-colors touch-manipulation ${
                        tabbedObservations[index]
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                      title={tabbedObservations[index] ? 'Convert to numbered item' : 'Convert to bullet point'}
                    >
                      <Indent size={16} />
                    </button>
                    <input
                      type="text"
                      value={observation.replace(/^[\t\s]+/, '')} // Display clean value without tabs
                      onChange={(e) => handleObservationChange(index, e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder={tabbedObservations[index] ? `Bullet point...` : `Observation ${index + 1}...`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3 pb-2 border-b-2 border-blue-600">
                Recommendations & Follow-up Actions
              </h3>
              <div className="space-y-3">
                {followupInputs.map((followup, index) => {
                  return (
                    <div key={index} className="flex items-center space-x-2">
                      <div className={`flex-shrink-0 w-8 h-10 flex items-center justify-center rounded-lg font-semibold ${
                        tabbedFollowups[index] 
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' 
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                      }`}>
                        {getDisplayLetter(index, tabbedFollowups[index], tabbedFollowups)}.
                      </div>
                      <button
                        onClick={() => toggleFollowupTab(index)}
                        className={`flex-shrink-0 p-2 rounded-lg transition-colors touch-manipulation ${
                          tabbedFollowups[index]
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                        title={tabbedFollowups[index] ? 'Convert to lettered item' : 'Convert to bullet point'}
                      >
                        <Indent size={16} />
                      </button>
                      <input
                        type="text"
                        value={followup.replace(/^[\t\s]+/, '')} // Display clean value without tabs
                        onChange={(e) => handleFollowupChange(index, e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder={tabbedFollowups[index] ? `Bullet point...` : `Recommendation ${getDisplayLetter(index, tabbedFollowups[index], tabbedFollowups)}...`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <PhotoGrid visitId={visitId} />
        )}
      </div>
    </div>
  );
});

VisitDetail.displayName = 'VisitDetail';

export default VisitDetail;