const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { uploadImage } = require("../controllers/uploadController");

router.post("/", protect, uploadImage);

module.exports = router;