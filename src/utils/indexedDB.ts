// IndexedDB utilities for photo storage
const DB_NAME = 'SiteVisitPhotos';
const DB_VERSION = 1;
const PHOTO_STORE = 'photos';

export interface PhotoData {
  id: string;
  visitId: string;
  src: string; // base64 data URL
  description: string;
  notes: string;
  createdAt: string;
}

class PhotoDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create photos store if it doesn't exist
        if (!db.objectStoreNames.contains(PHOTO_STORE)) {
          const store = db.createObjectStore(PHOTO_STORE, { keyPath: 'id' });
          store.createIndex('visitId', 'visitId', { unique: false });
        }
      };
    });
  }

  async addPhoto(photo: PhotoData): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PHOTO_STORE], 'readwrite');
      const store = transaction.objectStore(PHOTO_STORE);
      const request = store.add(photo);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to add photo'));
    });
  }

  async updatePhoto(photoId: string, updates: Partial<PhotoData>): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PHOTO_STORE], 'readwrite');
      const store = transaction.objectStore(PHOTO_STORE);
      
      // First get the existing photo
      const getRequest = store.get(photoId);
      
      getRequest.onsuccess = () => {
        const existingPhoto = getRequest.result;
        if (!existingPhoto) {
          reject(new Error('Photo not found'));
          return;
        }
        
        // Update the photo with new data
        const updatedPhoto = { ...existingPhoto, ...updates };
        const putRequest = store.put(updatedPhoto);
        
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(new Error('Failed to update photo'));
      };
      
      getRequest.onerror = () => reject(new Error('Failed to get photo'));
    });
  }

  async deletePhoto(photoId: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PHOTO_STORE], 'readwrite');
      const store = transaction.objectStore(PHOTO_STORE);
      const request = store.delete(photoId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to delete photo'));
    });
  }

  async getPhotosByVisitId(visitId: string): Promise<PhotoData[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PHOTO_STORE], 'readonly');
      const store = transaction.objectStore(PHOTO_STORE);
      const index = store.index('visitId');
      const request = index.getAll(visitId);

      request.onsuccess = () => {
        const photos = request.result || [];
        // Sort by creation date
        photos.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        resolve(photos);
      };
      request.onerror = () => reject(new Error('Failed to get photos'));
    });
  }

  async deletePhotosByVisitId(visitId: string): Promise<void> {
    if (!this.db) await this.init();
    
    const photos = await this.getPhotosByVisitId(visitId);
    const deletePromises = photos.map(photo => this.deletePhoto(photo.id));
    await Promise.all(deletePromises);
  }

  async getAllPhotos(): Promise<PhotoData[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PHOTO_STORE], 'readonly');
      const store = transaction.objectStore(PHOTO_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(new Error('Failed to get all photos'));
    });
  }
}

// Singleton instance
export const photoDB = new PhotoDB();

// Initialize on module load
photoDB.init().catch(console.error);