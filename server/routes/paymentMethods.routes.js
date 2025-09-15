import { Router } from "express";
import {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  getPaymentsByUser,
  getDefaultPaymentByUser,
  setDefaultPayment,
} from "../controllers/paymentMethods.controller.js";

const r = Router();

r.get("/", getAllPayments);
r.get("/:id", getPaymentById);
r.post("/", createPayment);
r.put("/:id", updatePayment);
r.delete("/:id", deletePayment);

// user-scoped helpers
r.get("/user/:userNumber", getPaymentsByUser);
r.get("/user/:userNumber/default", getDefaultPaymentByUser);

// set default explicitly
r.post("/:id/default", setDefaultPayment);

export default r;
