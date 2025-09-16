// server/middleware/upload.js
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Use disk storage with dynamic folder creation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = req.body.categoryName || "uncategorized"; // fallback if missing
    const uploadPath = path.join(__dirname, "..", "public", "assets", "imgs", category);

    // Create folder if it doesn't exist
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

const upload = multer({ storage });

module.exports = upload;
