// routes/products.routes.js
import { Router } from "express";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";

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
} from "../controllers/products.controller.js"; // NOTE: .controller.js (singular)

const router = Router();

/* ========= Multer setup (images) ========= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const productId = String(req.params?.id || "").trim();
    const rawCategory = String(req.body?.categoryName || "").trim();

    // If a category is provided, use it; otherwise bucket under /products/<id>
    const subdir = rawCategory
      ? rawCategory.replace(/[^a-z0-9-_]/gi, "_").toLowerCase() // e.g. "phones"
      : path.posix.join("products", productId || "misc"); // e.g. "products/21"

    const uploadDir = path.resolve(
      "public",
      "assets",
      "imgs",
      ...subdir.split("/")
    );
    fs.mkdirSync(uploadDir, { recursive: true });

    // Pass subdir to controller so it can build URLs consistently
    req._imagesSubdir = subdir; // e.g. "phones" or "products/21"
    cb(null, uploadDir);
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
  limits: { files: 8, fileSize: 20 * 1024 * 1024 }, // up to 8 files, 20MB each
});

/* ========= Images ========= */
// Use .fields so both "images" (files) and "categoryName" (text) are parsed together.
router.post(
  "/:id/images",
  upload.fields([
    { name: "images", maxCount: 8 },
    { name: "categoryName", maxCount: 1 },
  ]),
  uploadProductImages
);
router.get("/:id/images", getProductImages);

/* ========= Filters ========= */
router.get("/brand/:brand", getProductsByBrand);
router.get("/category/:categoryNumber", getProductsByCategory);

/* ========= Patch updates ========= */
router.patch("/:id/barcode", updateBarcode);
router.patch("/:id/prices", updatePrices);
router.patch("/:id/stock", updateStock);

/* ========= Decrement stock ========= */
router.post("/:id/stock/decrement", decrementStock);

/* ========= Base CRUD ========= */
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
