import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  findUser,
  loginUser,
  changeUserRole,
  forgotPassword,
} from "../controllers/users.controller.js";

const r = Router();

// specific first
r.get("/find/user", findUser); // /api/users/find/user?username=... OR ?email=...
r.post("/login", loginUser); // /api/users/login
r.post("/forgot-password", forgotPassword);

// base CRUD
r.get("/", getAllUsers);
r.post("/", createUser);
r.get("/:id", getUserById);
r.put("/:id", updateUser);
r.delete("/:id", deleteUser);

// change role
r.patch("/:id/role", changeUserRole);

export default r;
