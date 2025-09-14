import { Router } from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/products.controller.js";
const r = Router();
r.get("/", getAllProducts);
r.get("/:id", getProductById);
r.post("/", createProduct);
r.put("/:id", updateProduct);
r.delete("/:id", deleteProduct);
export default r;
