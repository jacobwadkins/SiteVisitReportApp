export interface Visit {
  id: string;
  clientName: string;
  siteName: string;
  projectNo: string;
  visitDate: string;
  preparedBy: string;
  background: string;
  observations: string;
  followups: string;
  photos: Photo[];
  createdAt: string;
  updatedAt: string;
}

export interface Photo {
  id: string;
  description: string;
  notes: string;
  createdAt: string;
}

export interface VisitFormData {
  clientName: string;
  siteName: string;
  projectNo: string;
  visitDate: string;
  preparedBy: string;
}

export interface PhotoFormData {
  description: string;
  notes: string;
}

export type Theme = 'light' | 'dark';

export interface AppState {
  visits: Visit[];
  currentVisitId: string | null;
  theme: Theme;
  isOffline: boolean;
}