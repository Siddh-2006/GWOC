import uploadToCloudinary from '../utils/uploadToCloudinary.js';

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const folder = req.body.folder || 'general';

    // Upload to Cloudinary
    const fileUrl = await uploadToCloudinary(req.file.buffer, folder);

    res.json({
      success: true,
      data: {
        url: fileUrl,
        format: req.file.mimetype,
        size: req.file.size
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
};

// Keep for backward compatibility if needed, or alias
export const uploadImage = uploadFile;
