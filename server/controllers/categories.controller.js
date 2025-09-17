import { pool } from "../db.js";
import { pick, buildInsert, buildUpdate } from "../helpers/sql.js";

const TABLE = "categories";
const ID = "categoryNumber";
const ALLOWED = ["categoryName"];

/* ================================
   CRUD
================================ */
export async function getAllCategories(req, res) {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} ORDER BY ${ID} DESC`);
  res.json(rows);
}

export async function getCategoryById(req, res) {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE ${ID} = ?`, [
    req.params.id,
  ]);
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  res.json(rows[0]);
}

export async function createCategory(req, res) {
  try {
    const data = pick(req.body, ALLOWED);
    const name = String(data.categoryName || "").trim();
    if (!name)
      return res.status(400).json({ error: "categoryName is required" });

    // Normalize (optional): collapse spaces
    const norm = name.replace(/\s+/g, " ");
    const { sql, params } = buildInsert(TABLE, { categoryName: norm });

    const [r] = await pool.execute(sql, params);
    const [[row]] = await pool.query(`SELECT * FROM ${TABLE} WHERE ${ID}=?`, [
      r.insertId,
    ]);
    return res.status(201).json(row);
  } catch (err) {
    if (err?.code === "ER_DUP_ENTRY") {
      // Name already exists → return the existing category (idempotent)
      const [[row]] = await pool.query(
        `SELECT * FROM ${TABLE} WHERE categoryName = ?`,
        [
          String(req.body.categoryName || "")
            .trim()
            .replace(/\s+/g, " "),
        ]
      );
      return res.status(200).json(row); // 200 OK with existing row
    }
    console.error("createCategory error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function updateCategory(req, res) {
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

export async function deleteCategory(req, res) {
  const [r] = await pool.execute(`DELETE FROM ${TABLE} WHERE ${ID} = ?`, [
    req.params.id,
  ]);
  if (!r.affectedRows) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
}

/* ================================
   Upload category image
   Saves image in:
   public/assets/imgs/categories/[categoryName]/file.jpg
   and inserts metadata in category_images
================================ */
export async function uploadCategoryImage(req, res, next) {
  try {
    const categoryId = Number(req.params.id);
    if (!Number.isInteger(categoryId)) {
      return res.status(400).json({ error: "Invalid category id" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    // Get the safe category subdir from the multer middleware
    const subdir = req._categorySubdir || "categories";
    const fileName = req.file.filename;
    const url = `/assets/imgs/${subdir}/${fileName}`;

    await pool.query(
      `INSERT INTO category_images (category_id, file_name, url)
       VALUES (?, ?, ?)`,
      [categoryId, fileName, url]
    );

    res.status(201).json({ uploaded: true, file: url });
  } catch (e) {
    if (e?.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        error: "Category not found (foreign key failed)",
        code: e.code,
      });
    }
    next(e);
  }
}
