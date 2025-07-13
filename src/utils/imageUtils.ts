// HEIC conversion utility
const convertHeicToJpeg = async (file: File): Promise<File> => {
  try {
    const heic2any = (await import('heic2any')).default;
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9
    }) as Blob;
    
    return new File([convertedBlob], file.name.replace(/\.heic$/i, '.jpg'), {
      type: 'image/jpeg',
      lastModified: file.lastModified
    });
  } catch (error) {
    console.error('HEIC conversion failed:', error);
    throw new Error('Failed to convert HEIC image. Please try a different format.');
  }
};

export const compressImage = (file: File, maxSizeMB: number = 5): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      const maxWidth = 1920;
      const maxHeight = 1080;
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Start with high quality and reduce if needed
      let quality = 0.9;
      let dataUrl = canvas.toDataURL('image/jpeg', quality);
      
      // Reduce quality until under size limit
      while (dataUrl.length > maxSizeMB * 1024 * 1024 * 0.75 && quality > 0.1) {
        quality -= 0.1;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
      }

      resolve(dataUrl);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

export const processImageFile = async (file: File, maxSizeMB: number = 5): Promise<string> => {
  let processedFile = file;
  
  // Convert HEIC to JPEG if needed
  if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
    processedFile = await convertHeicToJpeg(file);
  }
  
  // Compress the image
  return compressImage(processedFile, maxSizeMB);
};

export const validateImageFile = (file: File): string | null => {
  const isValidImageType = file.type.startsWith('image/') || 
                          file.type === 'image/heic' || 
                          file.type === 'image/heif' ||
                          file.name.toLowerCase().endsWith('.heic') ||
                          file.name.toLowerCase().endsWith('.heif');
  
  if (!isValidImageType) {
    return 'Please select an image file';
  }
  
  if (file.size > 10 * 1024 * 1024) { // 10MB limit before compression
    return 'Image file is too large (max 10MB)';
  }
  
  return null;
};