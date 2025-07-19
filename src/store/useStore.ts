import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Visit, Photo, Theme } from '../types';
import { photoDB, PhotoData } from '../utils/indexedDB';

interface StoreState {
  // State
  visits: Visit[];
  currentVisitId: string | null;
  theme: Theme;
  isOffline: boolean;
  photosPerPage: 2 | 6;
  
  // Visit actions
  addVisit: (visit: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateVisit: (id: string, updates: Partial<Visit>) => void;
  deleteVisit: (id: string) => void;
  setCurrentVisit: (id: string | null) => void;
  
  // Photo actions
  addPhoto: (visitId: string, photo: Omit<Photo, 'id' | 'createdAt'>, src: string) => Promise<void>;
  updatePhoto: (visitId: string, photoId: string, updates: Partial<Photo>) => Promise<void>;
  deletePhoto: (visitId: string, photoId: string) => Promise<void>;
  loadPhotos: (visitId: string) => Promise<Photo[]>;
  
  // App actions
  setTheme: (theme: Theme) => void;
  setOfflineStatus: (isOffline: boolean) => void;
  setPhotosPerPage: (photosPerPage: 2 | 6) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      visits: [],
      currentVisitId: null,
      theme: 'light',
      isOffline: false,
      photosPerPage: 6,
      
      // Visit actions
      addVisit: (visitData) => {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const now = new Date().toISOString();
        const visit: Visit = {
          ...visitData,
          id,
          photos: [],
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          visits: [...state.visits, visit],
        }));
        
        return id;
      },
      
      updateVisit: (id, updates) => {
        set((state) => ({
          visits: state.visits.map((visit) =>
            visit.id === id
              ? { ...visit, ...updates, updatedAt: new Date().toISOString() }
              : visit
          ),
        }));
      },
      
      deleteVisit: (id) => {
        // Delete photos from IndexedDB when visit is deleted
        photoDB.deletePhotosByVisitId(id).catch(error => {
          console.error('Failed to delete photos from IndexedDB:', error);
        });
        
        set((state) => ({
          visits: state.visits.filter((visit) => visit.id !== id),
          currentVisitId: state.currentVisitId === id ? null : state.currentVisitId,
        }));
      },
      
      setCurrentVisit: (id) => {
        set({ currentVisitId: id });
      },
      
      // Photo actions
      addPhoto: async (visitId, photoData, src) => {
        const photoId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const now = new Date().toISOString();
        
        const photo: Photo = {
          ...photoData,
          id: photoId,
          createdAt: now,
        };
        
        // Store photo data in IndexedDB
        const photoData_db: PhotoData = {
          ...photo,
          visitId,
          src,
        };
        
        try {
          await photoDB.addPhoto(photoData_db);
          
          // Only update the store after successful IndexedDB storage
          set((state) => ({
            visits: state.visits.map((visit) =>
              visit.id === visitId
                ? {
                    ...visit,
                    photos: [...visit.photos, photo],
                    updatedAt: now,
                  }
                : visit
            ),
          }));
        } catch (error) {
          console.error('Failed to store photo in IndexedDB:', error);
          throw error;
        }
      },
      
      updatePhoto: async (visitId, photoId, updates) => {
        try {
          await photoDB.updatePhoto(photoId, updates);
        } catch (error) {
          console.error('Failed to update photo in IndexedDB:', error);
          throw error;
        }
        
        set((state) => ({
          visits: state.visits.map((visit) =>
            visit.id === visitId
              ? {
                  ...visit,
                  photos: visit.photos.map((photo) =>
                    photo.id === photoId ? { ...photo, ...updates } : photo
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : visit
          ),
        }));
      },
      
      deletePhoto: async (visitId, photoId) => {
        try {
          await photoDB.deletePhoto(photoId);
        } catch (error) {
          console.error('Failed to delete photo from IndexedDB:', error);
          throw error;
        }
        
        set((state) => ({
          visits: state.visits.map((visit) =>
            visit.id === visitId
              ? {
                  ...visit,
                  photos: visit.photos.filter((photo) => photo.id !== photoId),
                  updatedAt: new Date().toISOString(),
                }
              : visit
          ),
        }));
      },
      
      loadPhotos: async (visitId) => {
        try {
          const photoData = await photoDB.getPhotosByVisitId(visitId);
          return photoData.map(({ src, visitId: _, ...photo }) => photo);
        } catch (error) {
          console.error('Failed to load photos from IndexedDB:', error);
          return [];
        }
      },
      
      // App actions
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },
      
      setOfflineStatus: (isOffline) => {
        set({ isOffline });
      },
      
      setPhotosPerPage: (photosPerPage) => {
        set({ photosPerPage });
      },
    }),
    {
      name: 'site-visits-storage',
      partialize: (state) => ({
        visits: state.visits,
        theme: state.theme,
        photosPerPage: state.photosPerPage,
      }),
    }
  )
);