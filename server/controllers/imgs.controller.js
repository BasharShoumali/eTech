import { pool } from "../db.js";
import { pick, buildInsert, buildUpdate } from "../helpers/sql.js";

const TABLE = "product_images";
const ID = "image_id";
const ALLOWED = ["file_name", "url", "product_id", "sort_order"];

// Get all images
export async function getAllImgs(req, res) {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} ORDER BY ${ID} DESC`);
  res.json(rows);
}

// Get image by ID
export async function getImgById(req, res) {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE ${ID} = ?`, [
    req.params.id,
  ]);
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  res.json(rows[0]);
}

// Create image
export async function createImg(req, res) {
  const data = pick(req.body, ALLOWED);
  const { sql, params } = buildInsert(TABLE, data);
  const [r] = await pool.execute(sql, params);
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE ${ID} = ?`, [
    r.insertId,
  ]);
  res.status(201).json(rows[0]);
}

// Update image
export async function updateImg(req, res) {
  const data = pick(req.body, ALLOWED);
  const b = buildUpdate(TABLE, data, ID);
  b.params[b.params.length - 1] = req.params.id;
  const [r] = await pool.execute(b.sql, b.params);
  if (!r.affectedRows) return res.status(404).json({ error: "Not found" });
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE ${ID} = ?`, [
    req.params.id,
  ]);
  res.json(rows[0]);
}

// Delete image by ID
export async function deleteImg(req, res) {
  try {
    const [r] = await pool.query(`DELETE FROM ${TABLE} WHERE ${ID} = ?`, [
      req.params.id,
    ]);
    if (!r.affectedRows)
      return res.status(404).json({ error: "Image not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete image" });
  }
}

// Get all images for a specific product
export async function getImgsByProduct(req, res) {
  const { product_id } = req.params;
  const [rows] = await pool.query(
    `SELECT * FROM ${TABLE} WHERE product_id = ? ORDER BY sort_order ASC`,
    [product_id]
  );
  res.json(rows);
}

// Delete all images for a specific product
export async function deleteImgsByProduct(req, res) {
  const { product_id } = req.params;
  const [r] = await pool.execute(`DELETE FROM ${TABLE} WHERE product_id = ?`, [
    product_id,
  ]);
  res.json({ ok: true, deleted: r.affectedRows });
}
