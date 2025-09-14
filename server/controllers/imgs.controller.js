import { pool } from "../db.js";
import { pick, buildInsert, buildUpdate } from "../helpers/sql.js";

const TABLE = "imgs";
const ID = "imgID"; // <-- requires schema change
const ALLOWED = ["imgSrc", "productNumber", "imgNumberOfProduct"];

export async function getAllImgs(req, res) {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} ORDER BY ${ID} DESC`);
  res.json(rows);
}
export async function getImgById(req, res) {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE ${ID}=?`, [
    req.params.id,
  ]);
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  res.json(rows[0]);
}
export async function createImg(req, res) {
  const data = pick(req.body, ALLOWED);
  const { sql, params } = buildInsert(TABLE, data);
  const [r] = await pool.execute(sql, params);
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE ${ID}=?`, [
    r.insertId,
  ]);
  res.status(201).json(rows[0]);
}
export async function updateImg(req, res) {
  const data = pick(req.body, ALLOWED);
  const b = buildUpdate(TABLE, data, ID);
  b.params[b.params.length - 1] = req.params.id;
  const [r] = await pool.execute(b.sql, b.params);
  if (!r.affectedRows) return res.status(404).json({ error: "Not found" });
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE ${ID}=?`, [
    req.params.id,
  ]);
  res.json(rows[0]);
}
export async function deleteImg(req, res) {
  const [r] = await pool.execute(`DELETE FROM ${TABLE} WHERE ${ID}=?`, [
    req.params.id,
  ]);
  if (!r.affectedRows) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
}
