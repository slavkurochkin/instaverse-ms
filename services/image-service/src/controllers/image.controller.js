import { saveImageFromBase64, deleteImageFile } from '../services/image.service.js';

export const uploadImage = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ message: 'No image provided' });
    }

    // Check if it's already a URL
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return res.json({ url: image });
    }

    // Check if it's base64
    if (!image.startsWith('data:image/')) {
      return res.status(400).json({ message: 'Invalid image format. Expected base64 or URL' });
    }

    // Save base64 image to disk
    const { filename, url } = await saveImageFromBase64(image);

    res.json({ 
      message: 'Image uploaded successfully',
      filename,
      url 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload image', error: error.message });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;

    await deleteImageFile(filename);

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Failed to delete image', error: error.message });
  }
};

