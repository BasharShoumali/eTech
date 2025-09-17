// src/routes/imgs.routes.js
import { Router } from "express";
import {
  getAllImgs,
  getImgById,
  createImg,
  updateImg,
  deleteImg,
  getImgsByProduct,
  deleteImgsByProduct,
} from "../controllers/imgs.controller.js";

const r = Router();

// Place these first — specific routes must come before "/:id"
r.delete("/product-images/:id", deleteImg); // ✅ handles: /api/products/product-images/4
r.get("/by-product/:productNumber", getImgsByProduct);
r.delete("/by-product/:productNumber", deleteImgsByProduct);

// Base CRUD (these come LAST to avoid conflict)
r.get("/", getAllImgs);
r.get("/:id", getImgById);
r.post("/", createImg);
r.put("/:id", updateImg);
r.delete("/:id", deleteImg);

export default r;
