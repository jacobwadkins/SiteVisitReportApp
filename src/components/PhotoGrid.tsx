import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Edit3, Trash2, Save, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { photoSchema, PhotoFormData } from '../utils/validation';
import { processImageFile, validateImageFile } from '../utils/imageUtils';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { photoDB } from '../utils/indexedDB';

interface PhotoGridProps {
  visitId: string;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({ visitId }) => {
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [photoSources, setPhotoSources] = useState<Record<string, string>>({});
  const [fullscreenPhotoId, setFullscreenPhotoId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visit = useStore((state) => state.visits.find((v) => v.id === visitId));
  const addPhoto = useStore((state) => state.addPhoto);
  const updatePhoto = useStore((state) => state.updatePhoto);
  const deletePhoto = useStore((state) => state.deletePhoto);
  const triggerHaptic = useHapticFeedback();

  // Load photo sources from IndexedDB when component mounts or visit changes
  useEffect(() => {
    const loadPhotoSources = async () => {
      if (!visit || !visit.photos.length) {
        setPhotoSources({});
        return;
      }
      
      try {
        const photoData = await photoDB.getPhotosByVisitId(visitId);
        const sources: Record<string, string> = {};
        photoData.forEach(photo => {
          if (photo.src && photo.src.startsWith('data:')) {
            sources[photo.id] = photo.src;
          }
        });
        setPhotoSources(sources);
      } catch (error) {
        console.error('Failed to load photo sources:', error);
        setPhotoSources({});
      }
    };
    
    loadPhotoSources();
  }, [visitId, visit?.photos.length, visit?.photos.map(p => p.id).join(',')]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PhotoFormData>({
    resolver: zodResolver(photoSchema),
  });

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    triggerHaptic('light');

    for (const file of Array.from(files)) {
      const validationError = validateImageFile(file);
      if (validationError) {
        alert(validationError);
        continue;
      }

      try {
        const processedImage = await processImageFile(file);
        await addPhoto(visitId, {
          description: '',
          notes: '',
        }, processedImage);
      } catch (error) {
        console.error('Error processing image:', error);
        alert(error instanceof Error ? error.message : 'Failed to process image. Please try again.');
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const startEditing = (photoId: string, photo: any) => {
    setEditingPhotoId(photoId);
    reset({
      description: photo.description,
      notes: photo.notes,
    });
    triggerHaptic('light');
  };

  const savePhoto = (data: PhotoFormData) => {
    if (editingPhotoId) {
      updatePhoto(visitId, editingPhotoId, data).catch(error => {
        console.error('Failed to update photo:', error);
        alert('Failed to update photo. Please try again.');
      });
      setEditingPhotoId(null);
      triggerHaptic('medium');
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    triggerHaptic('medium');
    if (window.confirm('Are you sure you want to delete this photo?')) {
      deletePhoto(visitId, photoId).catch(error => {
        console.error('Failed to delete photo:', error);
        alert('Failed to delete photo. Please try again.');
      });
    }
  };

  if (!visit) return null;

  const fullscreenPhoto = fullscreenPhotoId ? visit.photos.find(p => p.id === fullscreenPhotoId) : null;

  return (
    <>
      {/* Fullscreen Photo Modal */}
      {fullscreenPhotoId && fullscreenPhoto && photoSources[fullscreenPhotoId] && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setFullscreenPhotoId(null)}
        >
          <div className="relative max-w-full max-h-full">
            <button
              onClick={() => setFullscreenPhotoId(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/30 transition-colors"
            >
              <X size={24} />
            </button>
            <img
              src={photoSources[fullscreenPhotoId]}
              alt={fullscreenPhoto.description || 'Site photo'}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {(fullscreenPhoto.description || fullscreenPhoto.notes) && (
              <div className="absolute bottom-4 left-4 right-4 bg-black/30 text-white p-2 rounded-lg">
                {fullscreenPhoto.description && (
                  <h3 className="font-semibold mb-2">{fullscreenPhoto.description}</h3>
                )}
                {fullscreenPhoto.notes && (
                  <p className="text-sm opacity-90">{fullscreenPhoto.notes}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        className="border-3 border-dashed border-blue-600 dark:border-blue-400 rounded-xl p-8 text-center cursor-pointer mb-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30 transition-all duration-200 active:scale-[0.98]"
      >
        <Camera size={48} className="mx-auto mb-4 text-blue-600 dark:text-blue-400" />
        <p className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">
          📸 Tap to take photo or select from gallery
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isUploading ? 'Processing images...' : 'Drag and drop images here'}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.heic,.heif"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Photo Grid */}
      {visit.photos.length > 0 && (
        <div className="space-y-6">
          {visit.photos.map((photo, index) => (
            <div
              key={photo.id}
              className="bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden shadow-sm"
            >
              <div className="bg-blue-600 text-white px-4 py-2 font-bold text-center">
                Photo {index + 1}
              </div>
              
              {photoSources[photo.id] ? (
                <img
                  src={photoSources[photo.id]}
                  alt={photo.description || `Site photo ${index + 1}`}
                  className="w-full h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setFullscreenPhotoId(photo.id)}
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400">Loading photo...</span>
                </div>
              )}
              
              <div className="p-4">
                {editingPhotoId === photo.id ? (
                  <form onSubmit={handleSubmit(savePhoto)} className="space-y-4">
                    <div>
                      <input
                        {...register('description')}
                        placeholder="Photo of ________"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.description.message}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <textarea
                        {...register('notes')}
                        placeholder="Notes or comments..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                      />
                      {errors.notes && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.notes.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors touch-manipulation"
                      >
                        <Save size={16} />
                        <span>Save</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingPhotoId(null)}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors touch-manipulation"
                      >
                        <X size={16} />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <div className="mb-4">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {photo.description || 'No description'}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">
                        {photo.notes || 'No notes'}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEditing(photo.id, photo)}
                        className="flex items-center space-x-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors touch-manipulation"
                      >
                        <Edit3 size={14} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="flex items-center space-x-2 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors touch-manipulation"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </>
  );
};