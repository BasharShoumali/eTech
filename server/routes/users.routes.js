import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/users.controller.js";

const r = Router();
r.get("/", getAllUsers);
r.get("/:id", getUserById);
r.post("/", createUser);
r.put("/:id", updateUser);
r.delete("/:id", deleteUser);
export default r;
