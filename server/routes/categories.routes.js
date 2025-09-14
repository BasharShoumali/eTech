import { Router } from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categories.controller.js";
const r = Router();
r.get("/", getAllCategories);
r.get("/:id", getCategoryById);
r.post("/", createCategory);
r.put("/:id", updateCategory);
r.delete("/:id", deleteCategory);
export default r;
