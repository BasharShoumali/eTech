// server/middleware/upload.js
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sanitize category folder names (letters, numbers, -, _)
function safeCategoryName(name) {
  return String(name || "uncategorized")
    .trim()
    .replace(/[^a-z0-9-_]/gi, "_")
    .toLowerCase();
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // categoryName is a regular field in the same multipart form as the files
    const category = safeCategoryName(req.body?.categoryName);
    const uploadPath = path.resolve(
      __dirname,
      "..",
      "public",
      "assets",
      "imgs",
      category
    );

    // Make sure folder exists
    fs.mkdirSync(uploadPath, { recursive: true });

    // Store the relative subdir so controllers can compose URL easily
    req._imagesSubdir = path.posix.join(category);
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const base =
      Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
    const ext = path.extname(file.originalname);
    cb(null, base + ext);
  },
});

// Optional: restrict to images and set size limits
function fileFilter(_req, file, cb) {
  if (/^image\/(png|jpe?g|gif|webp|bmp|svg\+xml)$/.test(file.mimetype))
    return cb(null, true);
  cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "images"));
}

const upload = multer({
  storage,
  fileFilter,
  limits: { files: 12, fileSize: 10 * 1024 * 1024 }, // 12 files, 10MB each (adjust)
});

export default upload;
