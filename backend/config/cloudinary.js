require('dotenv').config({ path: __dirname + '/../.env', debug: true });
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "agrilink_products", // all uploads go in this folder
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

module.exports = { cloudinary, storage };
