import { pool } from "../db.js";
import { pick, buildInsert, buildUpdate } from "../helpers/sql.js";

const TABLE = "products";
const ID = "productNumber";
const ALLOWED = [
  "productName",
  "barcode",
  "brand",
  "categoryNumber",
  "buyingPrice",
  "sellingPrice",
  "inStock",
];

export async function getAllProducts(req, res) {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} ORDER BY ${ID} DESC`);
  res.json(rows);
}

export async function getProductById(req, res) {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE ${ID}=?`, [
    req.params.id,
  ]);
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  res.json(rows[0]);
}

export async function createProduct(req, res) {
  const data = pick(req.body, ALLOWED);
  const { sql, params } = buildInsert(TABLE, data);
  const [r] = await pool.execute(sql, params);
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE ${ID}=?`, [
    r.insertId,
  ]);
  res.status(201).json(rows[0]);
}

export async function updateProduct(req, res) {
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

export async function deleteProduct(req, res) {
  const [r] = await pool.execute(`DELETE FROM ${TABLE} WHERE ${ID}=?`, [
    req.params.id,
  ]);
  if (!r.affectedRows) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
}

// --- filters ---
export async function getProductsByBrand(req, res) {
  const { brand } = req.params;
  const [rows] = await pool.query(
    `SELECT * FROM ${TABLE} WHERE brand = ? ORDER BY ${ID} DESC`,
    [brand]
  );
  res.json(rows);
}

export async function getProductsByCategory(req, res) {
  const { categoryNumber } = req.params;
  const [rows] = await pool.query(
    `SELECT * FROM ${TABLE} WHERE categoryNumber = ? ORDER BY ${ID} DESC`,
    [categoryNumber]
  );
  res.json(rows);
}

// --- partial updates (PATCH-style) ---
export async function updateBarcode(req, res) {
  const barcode = String(req.body.barcode || "").trim();
  if (!barcode) return res.status(400).json({ error: "barcode required" });

  const [r] = await pool.execute(
    `UPDATE ${TABLE} SET barcode=? WHERE ${ID}=?`,
    [barcode, req.params.id]
  );
  if (!r.affectedRows) return res.status(404).json({ error: "Not found" });

  const [[row]] = await pool.query(`SELECT * FROM ${TABLE} WHERE ${ID}=?`, [
    req.params.id,
  ]);
  res.json(row);
}

export async function updatePrices(req, res) {
  const buyingPrice = Number(req.body.buyingPrice);
  const sellingPrice = Number(req.body.sellingPrice);
  if (
    Number.isNaN(buyingPrice) ||
    Number.isNaN(sellingPrice) ||
    buyingPrice < 0 ||
    sellingPrice < 0
  ) {
    return res.status(400).json({ error: "Invalid prices" });
  }
  const [r] = await pool.execute(
    `UPDATE ${TABLE} SET buyingPrice=?, sellingPrice=? WHERE ${ID}=?`,
    [buyingPrice, sellingPrice, req.params.id]
  );
  if (!r.affectedRows) return res.status(404).json({ error: "Not found" });

  const [[row]] = await pool.query(`SELECT * FROM ${TABLE} WHERE ${ID}=?`, [
    req.params.id,
  ]);
  res.json(row);
}

export async function updateStock(req, res) {
  const inStock = Number(req.body.inStock);
  if (!Number.isInteger(inStock) || inStock < 0) {
    return res
      .status(400)
      .json({ error: "inStock must be a non-negative integer" });
  }
  const [r] = await pool.execute(
    `UPDATE ${TABLE} SET inStock=? WHERE ${ID}=?`,
    [inStock, req.params.id]
  );
  if (!r.affectedRows) return res.status(404).json({ error: "Not found" });

  const [[row]] = await pool.query(`SELECT * FROM ${TABLE} WHERE ${ID}=?`, [
    req.params.id,
  ]);
  res.json(row);
}

// --- decrement stock by one (atomic) ---
export async function decrementStock(req, res) {
  const [r] = await pool.execute(
    `UPDATE ${TABLE}
       SET inStock = inStock - 1
     WHERE ${ID}=? AND inStock > 0`,
    [req.params.id]
  );
  if (!r.affectedRows) {
    // either not found or stock already 0
    const [[exists]] = await pool.query(
      `SELECT ${ID}, inStock FROM ${TABLE} WHERE ${ID}=?`,
      [req.params.id]
    );
    if (!exists) return res.status(404).json({ error: "Not found" });
    return res.status(409).json({ error: "Stock is already 0" });
  }
  const [[row]] = await pool.query(`SELECT * FROM ${TABLE} WHERE ${ID}=?`, [
    req.params.id,
  ]);
  res.json(row);
}
