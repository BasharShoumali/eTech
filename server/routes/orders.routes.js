import { Router } from "express";
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} from "../controllers/orders.controller.js";
const r = Router();
r.get("/", getAllOrders);
r.get("/:id", getOrderById);
r.post("/", createOrder);
r.put("/:id", updateOrder);
r.delete("/:id", deleteOrder);
export default r;
