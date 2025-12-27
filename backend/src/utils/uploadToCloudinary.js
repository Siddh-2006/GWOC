import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary.js'; // loads config from your cloudinary setup

/**
 * Upload a file buffer to Cloudinary using memoryStorage from multer
 * 
 * @param {Buffer} buffer - the file buffer from multer.memoryStorage()
 * @param {string} folder - the Cloudinary folder to save the file into (like "club_logos" or "profile_photos")
 * @returns {Promise<string>} - a Promise that resolves to the secure Cloudinary URL of the uploaded file
 */
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder }, // Cloudinary destination folder
      (error, result) => {
        if (error) return reject(error); // send error to caller
        resolve(result.secure_url); // send uploaded image URL
      }
    );

    streamifier.createReadStream(buffer).pipe(stream); // stream the buffer to Cloudinary
  });
};

export default uploadToCloudinary;
