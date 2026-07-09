import { Router, Request, Response } from 'express';
import multer from 'multer';
import cloudinary, { uploadImage, deleteImage } from '../../lib/cloudinary';

const router = Router();

// Configure multer for temporary file storage
const upload = multer({
  dest: '/tmp/uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// POST /api/admin/media/upload
router.post('/upload', upload.array('images', 10), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    const folder = (req.body.folder as string) || 'bekollo-clone/products';

    const uploads = await Promise.all(
      files.map((file) => uploadImage(file.path, folder))
    );

    res.json({ images: uploads });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// DELETE /api/admin/media/:publicId
router.delete('/:publicId(*)', async (req: Request, res: Response) => {
  try {
    const publicId = req.params.publicId as string;
    await deleteImage(publicId);
    res.json({ message: 'Image deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// GET /api/admin/media - List images from Cloudinary
router.get('/', async (req: Request, res: Response) => {
  try {
    const { folder = 'bekollo-clone' } = req.query;

    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folder as string,
      max_results: 100,
    });

    res.json({
      images: result.resources.map((r: any) => ({
        publicId: r.public_id,
        url: r.secure_url,
        width: r.width,
        height: r.height,
        format: r.format,
        bytes: r.bytes,
        createdAt: r.created_at,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

export default router;
