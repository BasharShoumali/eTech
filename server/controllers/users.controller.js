import { pool } from "../db.js";
import { pick, buildInsert, buildUpdate } from "../helpers/sql.js";

const TABLE = "users";
const ID = "userNumber";
const ALLOWED = [
  "firstName",
  "lastName",
  "userName",
  "password_hash",
  "email",
  "phoneNumber",
  "userID",
  "userRole",
  "dateOfBirth",
  "address",
  "created",
];

export async function getAllUsers(req, res) {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} ORDER BY ${ID} DESC`);
  // SECURITY NOTE: consider omitting password_hash in responses
  rows.forEach((r) => delete r.password_hash);
  res.json(rows);
}

export async function getUserById(req, res) {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE ${ID}=?`, [
    req.params.id,
  ]);
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  const row = rows[0];
  delete row.password_hash;
  res.json(row);
}

export async function createUser(req, res) {
  const data = pick(req.body, ALLOWED);
  const { sql, params } = buildInsert(TABLE, data);
  const [r] = await pool.execute(sql, params);
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE ${ID}=?`, [
    r.insertId,
  ]);
  delete rows[0].password_hash;
  res.status(201).json(rows[0]);
}

export async function updateUser(req, res) {
  const data = pick(req.body, ALLOWED);
  const b = buildUpdate(TABLE, data, ID);
  b.params[b.params.length - 1] = req.params.id;
  const [r] = await pool.execute(b.sql, b.params);
  if (!r.affectedRows) return res.status(404).json({ error: "Not found" });
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE ${ID}=?`, [
    req.params.id,
  ]);
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  delete rows[0].password_hash;
  res.json(rows[0]);
}

export async function deleteUser(req, res) {
  const [r] = await pool.execute(`DELETE FROM ${TABLE} WHERE ${ID}=?`, [
    req.params.id,
  ]);
  if (!r.affectedRows) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
}
// SEARCH: find by username or email (sanitized for UI)
export async function findUser(req, res) {
  const { username, email } = req.query;
  if (!username && !email) {
    return res.status(400).json({ error: "username or email is required" });
  }
  const [rows] = await pool.query(
    `SELECT ${ID}, firstName, lastName, userName, email, phoneNumber, userRole, userID, dateOfBirth, address, created
     FROM ${TABLE}
     WHERE ${username ? "userName=?" : "email=?"}
     LIMIT 1`,
    [username || email]
  );
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  res.json(rows[0]);
}
// LOGIN: usernameOrEmail + password -> verify with bcrypt, return sanitized user
// npm i bcryptjs
import bcrypt from "bcryptjs";

export async function loginUser(req, res) {
  const { usernameOrEmail, password } = req.body;
  if (!usernameOrEmail || !password) {
    return res
      .status(400)
      .json({ error: "usernameOrEmail and password are required" });
  }

  const [rows] = await pool.query(
    `SELECT ${ID}, userName, email, password_hash, userRole, firstName, lastName
     FROM ${TABLE}
     WHERE userName=? OR email=?
     LIMIT 1`,
    [usernameOrEmail, usernameOrEmail]
  );
  if (!rows.length)
    return res.status(401).json({ error: "Invalid credentials" });

  const user = rows[0];
  const ok = await bcrypt.compare(password, user.password_hash || "");
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  delete user.password_hash; // never expose hashes
  res.json({ user });
}
// ROLE: change a user's role (user/admin) with validation
export async function changeUserRole(req, res) {
  const role = String(req.body.userRole || "").toLowerCase();
  if (!["user", "admin"].includes(role)) {
    return res
      .status(400)
      .json({ error: "userRole must be 'user' or 'admin'" });
  }
  const [r] = await pool.execute(
    `UPDATE ${TABLE} SET userRole=? WHERE ${ID}=?`,
    [role, req.params.id]
  );
  if (!r.affectedRows) return res.status(404).json({ error: "Not found" });

  const [[row]] = await pool.query(
    `SELECT ${ID}, firstName, lastName, userName, email, phoneNumber, userRole, userID, dateOfBirth, address, created
     FROM ${TABLE} WHERE ${ID}=?`,
    [req.params.id]
  );
  res.json(row);
}
