/**
 * Client-side image compression for profile/vacancy photos.
 * Resizes and compresses to stay under a max size in KB.
 */

const DEFAULT_MAX_WIDTH = 800;
const MIN_QUALITY = 0.2;

/**
 * Process an image file to a JPEG data URL under maxKb.
 * Resizes (max width 800px) then reduces quality until under limit.
 */
export function processImageToMaxKb(
  file: File,
  maxKb: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Not an image"));
      return;
    }
    const maxBytes = maxKb * 1024;
    // Base64 is ~4/3 of raw bytes; data URL has prefix so we allow a bit more for the string
    const maxDataUrlLength = Math.floor(maxBytes * (4 / 3)) + 200;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > DEFAULT_MAX_WIDTH) {
          h = Math.round((h * DEFAULT_MAX_WIDTH) / w);
          w = DEFAULT_MAX_WIDTH;
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);

        let quality = 0.85;
        let result = canvas.toDataURL("image/jpeg", quality);
        while (result.length > maxDataUrlLength && quality > MIN_QUALITY) {
          quality -= 0.1;
          result = canvas.toDataURL("image/jpeg", Math.max(MIN_QUALITY, quality));
        }
        if (result.length > maxDataUrlLength) {
          reject(new Error(`Image is too large. Keep it under ${maxKb} KB.`));
          return;
        }
        resolve(result);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = dataUrl;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
