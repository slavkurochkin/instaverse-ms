import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdir } from 'fs/promises';
import imageRoutes from './routes/image.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5005;
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Allow large base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create upload directory if it doesn't exist
try {
  await mkdir(UPLOAD_DIR, { recursive: true });
  console.log(`✅ Upload directory ready: ${UPLOAD_DIR}`);
} catch (error) {
  console.error('Failed to create upload directory:', error);
}

// Serve static files from uploads directory
app.use('/uploads', express.static(UPLOAD_DIR));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'image-service' });
});

// Routes
app.use('/api/images', imageRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Image Service running on port ${PORT}`);
  console.log(`📁 Serving images from: ${UPLOAD_DIR}`);
});

export default app;

