const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "duthy2ppn",
  api_key: "546633485986518",
  api_secret: "GR11cK5mDns4sV7BVDCekUKFhLo",
});

module.exports = cloudinary;