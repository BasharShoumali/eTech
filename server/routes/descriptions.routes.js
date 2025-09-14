import { Router } from "express";
import {
  getAllDescriptions,
  getDescriptionById,
  createDescription,
  updateDescription,
  deleteDescription,
} from "../controllers/descriptions.controller.js";
const r = Router();
r.get("/", getAllDescriptions);
r.get("/:id", getDescriptionById);
r.post("/", createDescription);
r.put("/:id", updateDescription);
r.delete("/:id", deleteDescription);
export default r;
