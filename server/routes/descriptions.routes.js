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
// canonical path
r.get("/by-product/:productNumber", getDescriptionsByProduct);
r.delete("/by-product/:productNumber", deleteDescriptionsByProduct);

// alias to match older frontend calls like /byProduct/123
r.get("/byProduct/:productNumber", getDescriptionsByProduct);
r.delete("/byProduct/:productNumber", deleteDescriptionsByProduct);

/* ===== Base CRUD ===== */
r.get("/", getAllDescriptions);
// NOTE: This endpoint supports bulk create: { productNumber, descriptions: [{title,text}, ...] }
r.post("/", createDescription);
r.get("/:id", getDescriptionById);
r.put("/:id", updateDescription);
r.delete("/:id", deleteDescription);

export default r;
