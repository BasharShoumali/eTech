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

// --- core CRUD ---
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

// --- patch updates ---
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

export async function decrementStock(req, res) {
  const [r] = await pool.execute(
    `UPDATE ${TABLE}
       SET inStock = inStock - 1
     WHERE ${ID}=? AND inStock > 0`,
    [req.params.id]
  );
  if (!r.affectedRows) {
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

// --- images ---
export async function uploadProductImages(req, res, next, err) {
  if (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message, code: err.code });
    }
    return next(err);
  }

  try {
    const productId = Number(req.params.id);
    if (!Number.isInteger(productId)) {
      return res.status(400).json({ error: "invalid id" });
    }
    if (!req.files?.length) {
      return res.status(400).json({ error: "No images uploaded" });
    }

    const subdir = (req._imagesSubdir || "").replaceAll("\\", "/");
    const files = req.files.map((f, idx) => ({
      file_name: f.filename,
      url: `/assets/imgs/${subdir}/${f.filename}`,
      sort_order: idx,
    }));

    const placeholders = files.map(() => "(?,?,?,?)").join(",");
    const params = files.flatMap((f) => [productId, f.file_name, f.url, f.sort_order]);

    await pool.query(
      `INSERT INTO product_images (product_id, file_name, url, sort_order)
       VALUES ${placeholders}`,
      params
    );

    return res.status(201).json({
      uploaded: true,
      files: files.map((f) => f.url),
    });
  } catch (e) {
    if (e?.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({ error: "product not found (FK)", code: e.code });
    }
    next(e);
  }
}

export async function getProductImages(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "invalid id" });

    const [rows] = await pool.query(
      `SELECT image_id AS id, file_name, url
         FROM product_images
        WHERE product_id = ?
        ORDER BY sort_order, image_id`,
      [id]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
}

// --- descriptions ---
export async function postProductDescriptions(req, res, next) {
  try {
    const productId = Number(req.params.id);
    if (!Number.isInteger(productId)) {
      return res.status(400).json({ error: "invalid id" });
    }

    const items = Array.isArray(req.body?.descriptions) ? req.body.descriptions : [];
    const rows = items
      .map(({ title = "", text = "" }) => ({
        title: title.trim(),
        text: text.trim(),
      }))
      .filter((d) => d.title || d.text);

    if (rows.length === 0) return res.status(400).json({ error: "no descriptions" });

    const placeholders = rows.map(() => "(?,?,?)").join(",");
    const params = rows.flatMap((d) => [productId, d.title || null, d.text || null]);

    await pool.query(
      `INSERT INTO product_descriptions (product_id, title, text) VALUES ${placeholders}`,
      params
    );

    return res.status(201).json({ created: rows.length });
  } catch (err) {
    next(err);
  }
}

export async function getProductDescriptions(req, res, next) {
  try {
    const productId = Number(req.params.id);
    if (!Number.isInteger(productId)) return res.status(400).json({ error: "invalid id" });

    const [rows] = await pool.query(
      `SELECT id, title, text
         FROM product_descriptions
        WHERE product_id = ? 
        ORDER BY sort_order, id`,
      [productId]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
}
