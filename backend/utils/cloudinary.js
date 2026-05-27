const cloudinary = require('cloudinary').v2;

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.warn('[cloudinary] Missing CLOUDINARY_* env vars. Uploads will fail.');
} else {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });
}

async function uploadFile(filePath, { folder, resourceType = 'image' } = {}) {
  return cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: resourceType
  });
}

module.exports = { cloudinary, uploadFile };

