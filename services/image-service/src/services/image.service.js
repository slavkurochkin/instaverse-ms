import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
const IMAGE_SERVICE_URL = process.env.IMAGE_SERVICE_URL || 'http://localhost:5005';

/**
 * Save base64 image to disk and return URL
 * @param {string} base64Image - Base64 encoded image (with data:image/... prefix)
 * @returns {Promise<{filename: string, url: string, path: string}>}
 */
export const saveImageFromBase64 = async (base64Image) => {
  try {
    // Extract image data and mime type
    const matches = base64Image.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 image format');
    }

    const imageType = matches[1]; // e.g., 'jpeg', 'png', 'gif'
    const base64Data = matches[2];
    
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Generate unique filename
    const filename = `${uuidv4()}.${imageType === 'jpeg' ? 'jpg' : imageType}`;
    const filepath = path.join(UPLOAD_DIR, filename);
    
    // Save to disk
    await writeFile(filepath, imageBuffer);
    
    // Return URL that will be stored in database
    const url = `${IMAGE_SERVICE_URL}/uploads/${filename}`;
    
    console.log(`✅ Image saved: ${filename} (${(imageBuffer.length / 1024).toFixed(2)} KB)`);
    
    return {
      filename,
      url,
      path: filepath
    };
  } catch (error) {
    console.error('Error saving image:', error);
    throw error;
  }
};

/**
 * Delete image file from disk
 * @param {string} filename - Name of the file to delete
 */
export const deleteImageFile = async (filename) => {
  try {
    const filepath = path.join(UPLOAD_DIR, filename);
    await unlink(filepath);
    console.log(`✅ Image deleted: ${filename}`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn(`⚠️  Image not found: ${filename}`);
    } else {
      throw error;
    }
  }
};

