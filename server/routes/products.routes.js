import { Router } from "express";
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
} from "../controllers/products.controller.js";

const r = Router();

// base CRUD
r.get("/", getAllProducts);
r.get("/:id", getProductById);
r.post("/", createProduct);
r.put("/:id", updateProduct);
r.delete("/:id", deleteProduct);

// filters
r.get("/brand/:brand", getProductsByBrand);
r.get("/category/:categoryNumber", getProductsByCategory);

// targeted edits
r.patch("/:id/barcode", updateBarcode);
r.patch("/:id/prices", updatePrices);
r.patch("/:id/stock", updateStock);

// decrement one from stock
r.post("/:id/stock/decrement", decrementStock);

export default r;
