import { Router } from "express";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { pool as db } from "../db.js";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByBrand,
  getProductsByCategory,
  updateBarcode,
  updatePrices,
  updateStock,
  decrementStock,
  uploadProductImages,
  getProductImages,
  postProductDescriptions,
  getProductDescriptions,
} from "../controllers/products.controller.js";

const router = Router();

// ========= Multer setup =========
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const productId = String(req.params?.id || "").trim();
    const categoryName = (req.body?.categoryName || "").toString().trim();
    const subdir = categoryName
      ? categoryName
      : path.posix.join("products", productId || "misc");

    const uploadDir = path.resolve("public", "assets", "imgs", ...subdir.split("/"));
    fs.mkdirSync(uploadDir, { recursive: true });

    req._imagesSubdir = subdir;
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "_")
      .slice(0, 50);
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { files: 8, fileSize: 20 * 1024 * 1024 }, // 20MB/file
});

// Inject multer into controller for image upload
router.post("/:id/images", (req, res, next) =>
  upload.array("images", 8)(req, res, (err) =>
    uploadProductImages(req, res, next, err)
  )
);

// Descriptions
router.post("/:id/descriptions", postProductDescriptions);
router.get("/:id/descriptions", getProductDescriptions);

// Images
router.get("/:id/images", getProductImages);

// Filters
router.get("/brand/:brand", getProductsByBrand);
router.get("/category/:categoryNumber", getProductsByCategory);

// PATCH updates
router.patch("/:id/barcode", updateBarcode);
router.patch("/:id/prices", updatePrices);
router.patch("/:id/stock", updateStock);

// Decrement stock
router.post("/:id/stock/decrement", decrementStock);

// Base CRUD
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
