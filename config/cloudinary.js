const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("SECRET CHECK:", process.env.CLOUDINARY_API_SECRET);
console.log("NAME CHECK:", process.env.CLOUDINARY_CLOUD_NAME);

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => ({
    folder: "myListingproject_images",
    allowedFormats: ["jpg", "png", "jpeg"],   //  ✔ correct
    transformation: [{ width: 800, height: 600, crop: "limit" }],
  }),
});

module.exports = {
  cloudinary,
  storage
};
