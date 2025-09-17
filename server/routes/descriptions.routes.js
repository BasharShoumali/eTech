// server/routes/descriptions.routes.js
import { Router } from "express";
import {
  getAllDescriptions,
  getDescriptionById,
  createDescription,
  updateDescription,
  deleteDescription,
  getDescriptionsByProduct,
  deleteDescriptionsByProduct,
} from "../controllers/descriptions.controller.js";

const r = Router();

/* ===== By productNumber utilities ===== */
r.get("/by-product/:productNumber", getDescriptionsByProduct);
r.delete("/by-product/:productNumber", deleteDescriptionsByProduct);

/* ===== Base CRUD ===== */
r.get("/", getAllDescriptions);
r.post("/", createDescription); // single insert; body must include productNumber
r.get("/:id", getDescriptionById);
r.put("/:id", updateDescription);
r.delete("/:id", deleteDescription);

export default r;
