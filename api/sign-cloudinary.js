import { v2 as cloudinary } from 'cloudinary';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // The cloudinary config picks up CLOUDINARY_URL or CLOUDINARY_API_KEY from env automatically
    cloudinary.config({
      cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    const timestamp = Math.round((new Date).getTime() / 1000);
    
    // Additional parameters to sign (must match what frontend sends)
    const paramsToSign = {
      timestamp,
      folder: 'vinayaka-frames/products',
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    res.status(200).json({ timestamp, signature });
  } catch (error) {
    console.error('Cloudinary Sign Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
