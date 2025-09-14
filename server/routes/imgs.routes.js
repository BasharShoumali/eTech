import { Router } from "express";
import {
  getAllImgs,
  getImgById,
  createImg,
  updateImg,
  deleteImg,
} from "../controllers/imgs.controller.js";
const r = Router();
r.get("/", getAllImgs);
r.get("/:id", getImgById);
r.post("/", createImg);
r.put("/:id", updateImg);
r.delete("/:id", deleteImg);
export default r;
