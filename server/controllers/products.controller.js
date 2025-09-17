// server/controllers/products.controllers.js
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

/* =========================
   Core CRUD
   ========================= */
export async function getAllProducts(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM ${TABLE} ORDER BY ${ID} DESC`
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

export async function getAllProductsFull(req, res, next) {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.productNumber,
        p.productName,
        p.barcode,
        p.brand,
        p.buyingPrice,
        p.sellingPrice,
        p.inStock,
        p.categoryNumber,
        c.categoryName,
        i.url AS image
      FROM products p
      LEFT JOIN categories c ON p.categoryNumber = c.categoryNumber
      LEFT JOIN (
        SELECT product_id, MIN(url) AS url
        FROM product_images
        GROUP BY product_id
      ) i ON p.productNumber = i.product_id
      ORDER BY p.productNumber DESC
    `);
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

export async function getProductById(req, res, next) {
  try {
    const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE ${ID}=?`, [
      req.params.id,
    ]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
}

export async function createProduct(req, res, next) {
  try {
    const data = pick(req.body, ALLOWED);
    const { sql, params } = buildInsert(TABLE, data);
    const [r] = await pool.execute(sql, params);
    // Return only the new id so frontend can chain uploads
    res.status(201).json({ productNumber: r.insertId });
  } catch (e) {
    next(e);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const data = pick(req.body, ALLOWED);
    const b = buildUpdate(TABLE, data, ID);
    b.params[b.params.length - 1] = req.params.id;
    const [r] = await pool.execute(b.sql, b.params);
    if (!r.affectedRows) return res.status(404).json({ error: "Not found" });

    const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE ${ID}=?`, [
      req.params.id,
    ]);
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const [r] = await pool.execute(`DELETE FROM ${TABLE} WHERE ${ID}=?`, [
      req.params.id,
    ]);
    if (!r.affectedRows) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

/* =========================
   Filters
   ========================= */
export async function getProductsByBrand(req, res, next) {
  try {
    const { brand } = req.params;
    const [rows] = await pool.query(
      `SELECT * FROM ${TABLE} WHERE brand = ? ORDER BY ${ID} DESC`,
      [brand]
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

export async function getProductsByCategory(req, res, next) {
  try {
    const { categoryNumber } = req.params;
    const [rows] = await pool.query(
      `SELECT * FROM ${TABLE} WHERE categoryNumber = ? ORDER BY ${ID} DESC`,
      [categoryNumber]
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

/* =========================
   Patch updates
   ========================= */
export async function updateBarcode(req, res, next) {
  try {
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
  } catch (e) {
    next(e);
  }
}

export async function updatePrices(req, res, next) {
  try {
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
  } catch (e) {
    next(e);
  }
}

export async function updateStock(req, res, next) {
  try {
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
  } catch (e) {
    next(e);
  }
}

export async function decrementStock(req, res, next) {
  try {
    const [r] = await pool.execute(
      `UPDATE ${TABLE} SET inStock = inStock - 1 WHERE ${ID}=? AND inStock > 0`,
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
  } catch (e) {
    next(e);
  }
}

/* =========================
   Images
   ========================= */
export async function uploadProductImages(req, res, next) {
  try {
    const productId = Number(req.params.id);
    if (!Number.isInteger(productId)) {
      return res.status(400).json({ error: "invalid id" });
    }

    const files = req.files?.images || [];
    if (!files.length)
      return res.status(400).json({ error: "No images uploaded" });

    const subdir =
      req._imagesSubdir || path.posix.join("products", String(productId));
    const rows = files.map((f, idx) => ({
      file_name: f.filename,
      url: `/assets/imgs/${subdir}/${f.filename}`,
      sort_order: idx,
    }));

    const placeholders = rows.map(() => "(?,?,?,?)").join(",");
    const params = rows.flatMap((f) => [
      productId,
      f.file_name,
      f.url,
      f.sort_order,
    ]);

    await pool.query(
      `INSERT INTO product_images (product_id, file_name, url, sort_order)
       VALUES ${placeholders}`,
      params
    );

    res.status(201).json({ uploaded: true, files: rows.map((f) => f.url) });
  } catch (e) {
    if (e?.code === "ER_NO_REFERENCED_ROW_2") {
      return res
        .status(400)
        .json({ error: "product not found (FK)", code: e.code });
    }
    next(e);
  }
}

export async function getProductImages(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "invalid id" });
    }

    const [rows] = await pool.query(
      `SELECT image_id AS id, file_name, url
         FROM product_images
        WHERE product_id = ?
        ORDER BY sort_order, image_id`,
      [id]
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
}
