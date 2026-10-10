const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function readImageFile(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    return Promise.reject(new Error('Please upload an image file.'));
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return Promise.reject(new Error('Image must be 5MB or smaller.'));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('The image could not be read.'));
        return;
      }
      resolve(reader.result);
    };
    reader.onerror = () => reject(new Error('The image could not be read.'));
    reader.readAsDataURL(file);
  });
}
