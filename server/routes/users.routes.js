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
} from "../controllers/users.controller.js";

const r = Router();

// base CRUD
r.get("/", getAllUsers);
r.get("/:id", getUserById);
r.post("/", createUser);
r.put("/:id", updateUser);
r.delete("/:id", deleteUser);

// search (for login UI, no password hash)
r.get("/find/user", findUser); // /api/users/find/user?username=foo OR ?email=bar@x.com

// login (server verifies password with bcrypt)
r.post("/login", loginUser);

// change role
r.patch("/:id/role", changeUserRole);

export default r;
