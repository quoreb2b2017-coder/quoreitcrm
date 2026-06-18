import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { multerUpload } from '../middleware/upload.js';
import { config } from '../config/index.js';
import {
  uploadResume,
  uploadDocument,
  uploadProfilePhoto,
  uploadIntroVideo,
  removeUpload,
  parseResume,
  parseJobDescriptionPdf,
  signedUrl,
} from '../controllers/uploadController.js';

const router = Router();

// No auth: so you can open in browser to verify Cloudinary env is loaded
router.get('/config-status', (_req, res) => {
  const { cloudName, apiKey, apiSecret } = config.cloudinary;
  const configured = !!(cloudName && apiKey && apiSecret);
  res.json({
    success: true,
    data: {
      uploadConfigured: configured,
      message: configured
        ? 'Cloudinary is configured.'
        : 'Missing CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET in apps/backend/.env',
    },
  });
});

router.use(authMiddleware);

router.post('/resume', multerUpload('resume'), uploadResume);
router.post('/parse-resume', multerUpload('resume'), parseResume);
router.post('/parse-jd', multerUpload('resume'), parseJobDescriptionPdf);
router.get('/signed-url', signedUrl);
router.post('/document', multerUpload('document'), uploadDocument);
router.post('/profile-photo', multerUpload('profile'), uploadProfilePhoto);
router.post('/image', multerUpload('profile'), uploadProfilePhoto); // Alias for frontend api.upload.image
router.post('/intro-video', multerUpload('video'), uploadIntroVideo);
router.delete('/', removeUpload);

export default router;
