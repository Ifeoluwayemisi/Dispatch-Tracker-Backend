import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { uploadProfilePic, getProfilePic } from '../controllers/userController.js';

const router = express.Router();

// Route to upload profile picture
router.post('/upload-profile-pic', protect, uploadProfilePic);
router.get('/profile-pic', protect, getProfilePic);

export default router;