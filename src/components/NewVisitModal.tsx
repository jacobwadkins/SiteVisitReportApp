import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { visitSchema, VisitFormData } from '../utils/validation';
import { useHapticFeedback } from '../hooks/useHapticFeedback';

interface NewVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVisitCreated: (visitId: string) => void;
}

export const NewVisitModal: React.FC<NewVisitModalProps> = ({
  isOpen,
  onClose,
  onVisitCreated,
}) => {
  const addVisit = useStore((state) => state.addVisit);
  const triggerHaptic = useHapticFeedback();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VisitFormData>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      visitDate: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = (data: VisitFormData) => {
    triggerHaptic('medium');
    const visitId = addVisit({
      ...data,
      background: '',
      observations: '',
      followups: '',
      photos: [],
    });
    
    reset();
    onClose();
    onVisitCreated(visitId);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            New Site Visit
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Client Name *
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
              Site Name *
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
              Project No. *
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
              Visit Date *
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Prepared by *
            </label>
            <input
              {...register('preparedBy')}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter your name"
            />
            {errors.preparedBy && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.preparedBy.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            {isSubmitting ? 'Creating...' : 'Create Visit'}
          </button>
        </form>
      </div>
    </div>
  );
};