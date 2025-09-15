import { Router } from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categories.controller.js";

const r = Router();

// GET all or one
r.get("/", getAllCategories);
r.get("/:id", getCategoryById);

// CREATE a new category
r.post("/", createCategory);

// UPDATE (name only) – prefer PATCH for partial updates
r.patch("/:id", async (req, res, next) => {
  // force only categoryName to be updated
  req.body = { categoryName: String(req.body.categoryName || "").trim() };
  if (!req.body.categoryName) {
    return res.status(400).json({ error: "categoryName is required" });
  }
  return updateCategory(req, res, next);
});

// DELETE
r.delete("/:id", deleteCategory);

export default r;
