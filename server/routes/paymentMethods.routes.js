import { Router } from "express";
import {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
} from "../controllers/paymentMethods.controller.js";
const r = Router();
r.get("/", getAllPayments);
r.get("/:id", getPaymentById);
r.post("/", createPayment);
r.put("/:id", updatePayment);
r.delete("/:id", deletePayment);
export default r;
