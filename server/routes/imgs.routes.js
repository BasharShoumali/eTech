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

// base CRUD
r.get("/", getAllImgs);
r.get("/:id", getImgById);
r.post("/", createImg);
r.put("/:id", updateImg);
r.delete("/:id", deleteImg);

// by product
r.get("/by-product/:productNumber", getImgsByProduct);
r.delete("/by-product/:productNumber", deleteImgsByProduct);

export default r;
