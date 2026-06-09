const cloudinary = require("../config/cloudinary");

const uploadImage = async (req, res) => {
  try {
    const fileStr = req.body.image;

    const uploadedResponse = await cloudinary.uploader.upload(fileStr, {
      folder: "fitmatch_profiles",
    });

    res.status(200).json({
      imageUrl: uploadedResponse.secure_url,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Image upload failed" });
  }
};

module.exports = { uploadImage };