import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Allowed file types
const allowedTypes = /jpeg|jpg|png|gif/;

// Absolute path for uploads
const uploadDir = path.join(process.cwd(), 'uploads', 'profile-pics');

// Ensure folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Created folder: ${uploadDir}`);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const userId = req.user?.id || 'guest';
    const filename = `${userId}_${Date.now()}${ext}`;
    console.log(`Saving profile pic as: ${filename}`);
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (allowedTypes.test(ext) && allowedTypes.test(mime)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB max
});

export const uploadProfilePic = [
  // First check that user is authenticated
  (req, res, next) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized: No user found in request' });
    }
    console.log('Authenticated user for upload:', req.user);
    next();
  },

  // Handle upload with multer
  (req, res, next) => {
    upload.single('profilePic')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },

  // Update DB with path
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Convert to relative path for DB storage
      const filePath = path.relative(process.cwd(), req.file.path).replace(/\\/g, '/');

      await prisma.user.update({
        where: { id: req.user.id },
        data: { profilePicture: filePath }
      });

      console.log('File saved at:', req.file.path);

      res.json({ 
        message: 'Profile picture uploaded successfully', 
        profilePicture: filePath 
      });

    } catch (err) {
      console.error('Error uploading profile picture:', err);
      res.status(500).json({ error: 'Failed to upload profile picture' });
    }
  }
];


// Controller to get profile picture URL for logged in user
export const getProfilePic = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { profilePicture: true } // Make sure this matches your DB field exactly
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profilePicUrl = user.profilePicture
      ? `${process.env.BASE_URL}/${user.profilePicture}`
      : `${process.env.BASE_URL}/uploads/default-profile.png`;

    res.json({ profilePicUrl });
  } catch (err) {
    console.error('Error fetching profile picture:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
