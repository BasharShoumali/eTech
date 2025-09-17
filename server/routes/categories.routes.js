import { Router } from "express";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";

import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
} from "../controllers/categories.controller.js";

const r = Router();

/* ========= Multer Setup ========= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const raw = String(req.body?.categoryName || "misc").trim();
    const safe = raw.replace(/[^a-z0-9-_]/gi, "_").toLowerCase();
    const dir = path.resolve("public", "assets", "imgs", "categories", safe);
    fs.mkdirSync(dir, { recursive: true });
    req._categorySubdir = `categories/${safe}`; // so controller builds correct URL
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base =
      Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
    cb(null, `${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
});

/* ========= Category Routes ========= */

// GET all or one
r.get("/", getAllCategories);
r.get("/:id", getCategoryById);

// CREATE a new category
r.post("/", createCategory);

// PATCH name (safe)
r.patch("/:id", async (req, res, next) => {
  req.body = { categoryName: String(req.body.categoryName || "").trim() };
  if (!req.body.categoryName) {
    return res.status(400).json({ error: "categoryName is required" });
  }
  return updateCategory(req, res, next);
});

// DELETE
r.delete("/:id", deleteCategory);

// ✅ Upload image for category
r.post("/:id/image", upload.single("image"), uploadCategoryImage);

export default r;
