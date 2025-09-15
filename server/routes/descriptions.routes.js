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

// base CRUD
r.get("/", getAllDescriptions);
r.get("/:id", getDescriptionById);
r.post("/", createDescription); // insert one
r.put("/:id", updateDescription);
r.delete("/:id", deleteDescription); // delete one by ID

// by product
r.get("/by-product/:productNumber", getDescriptionsByProduct);
r.delete("/by-product/:productNumber", deleteDescriptionsByProduct);

export default r;
