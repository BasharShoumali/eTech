// routes/orders.routes.js
import { Router } from "express";
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getClosedOrdersByUser,
  getOpenOrderByUser,
  placeOrder,
  cancelOrdered,
  markDelivered,
} from "../controllers/orders.controller.js";

const r = Router();

// CRUD
r.get("/", getAllOrders);
r.get("/:id", getOrderById);
r.post("/", createOrder);
r.put("/:id", updateOrder);
r.delete("/:id", deleteOrder);

// user-specific
r.get("/user/:userNumber/closed", getClosedOrdersByUser);
r.get("/user/:userNumber/open", getOpenOrderByUser);

// transitions
r.post("/:id/order", placeOrder); // open -> ordered + create new open
r.post("/:id/cancel", cancelOrdered); // ordered -> canceled
r.post("/:id/deliver", markDelivered); // ordered -> closed

export default r;
