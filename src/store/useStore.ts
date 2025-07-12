import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Visit, Photo, Theme } from '../types';

interface StoreState {
  // State
  visits: Visit[];
  currentVisitId: string | null;
  theme: Theme;
  isOffline: boolean;
  
  // Visit actions
  addVisit: (visit: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateVisit: (id: string, updates: Partial<Visit>) => void;
  deleteVisit: (id: string) => void;
  setCurrentVisit: (id: string | null) => void;
  
  // Photo actions
  addPhoto: (visitId: string, photo: Omit<Photo, 'id' | 'createdAt'>) => void;
  updatePhoto: (visitId: string, photoId: string, updates: Partial<Photo>) => void;
  deletePhoto: (visitId: string, photoId: string) => void;
  
  // App actions
  setTheme: (theme: Theme) => void;
  setOfflineStatus: (isOffline: boolean) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      visits: [],
      currentVisitId: null,
      theme: 'light',
      isOffline: false,
      
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
        set((state) => ({
          visits: state.visits.filter((visit) => visit.id !== id),
          currentVisitId: state.currentVisitId === id ? null : state.currentVisitId,
        }));
      },
      
      setCurrentVisit: (id) => {
        set({ currentVisitId: id });
      },
      
      // Photo actions
      addPhoto: (visitId, photoData) => {
        const photoId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const photo: Photo = {
          ...photoData,
          id: photoId,
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          visits: state.visits.map((visit) =>
            visit.id === visitId
              ? {
                  ...visit,
                  photos: [...visit.photos, photo],
                  updatedAt: new Date().toISOString(),
                }
              : visit
          ),
        }));
      },
      
      updatePhoto: (visitId, photoId, updates) => {
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
      
      deletePhoto: (visitId, photoId) => {
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
      
      // App actions
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },
      
      setOfflineStatus: (isOffline) => {
        set({ isOffline });
      },
    }),
    {
      name: 'site-visits-storage',
      partialize: (state) => ({
        visits: state.visits,
        theme: state.theme,
      }),
    }
  )
);