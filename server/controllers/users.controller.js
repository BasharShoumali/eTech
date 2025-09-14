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
