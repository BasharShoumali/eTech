import { Router } from "express";
import {
  getPaymentsByUser,
  getDefaultPaymentByUser,
  createPayment,
  updatePayment,
  deletePayment,
  setDefaultPayment,
} from "../controllers/paymentMethods.controller.js";

const router = Router();

// list all payment methods for a user
router.get("/user/:userNumber", getPaymentsByUser);

// get default payment method for a user
router.get("/user/:userNumber/default", getDefaultPaymentByUser);

// create a payment method
router.post("/", createPayment);

// update a payment method
router.patch("/:id", updatePayment);

// delete a payment method
router.delete("/:id", deletePayment);

// explicitly set a payment method as default
router.post("/:id/default", setDefaultPayment);

export default router;
