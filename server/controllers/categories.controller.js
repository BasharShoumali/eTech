import { pool } from "../db.js";
import { pick, buildInsert, buildUpdate } from "../helpers/sql.js";

const TABLE = "categories";
const ID = "categoryNumber";
const ALLOWED = ["categoryName"];

/* ================================
   Helpers
================================ */
const latestImageJoin = `
  LEFT JOIN (
    SELECT i.category_id, i.url
    FROM category_images i
    JOIN (
      SELECT category_id, MAX(image_id) AS max_id
      FROM category_images
      GROUP BY category_id
    ) m ON m.category_id = i.category_id AND m.max_id = i.image_id
  ) ci ON ci.category_id = c.${ID}
`;

/* ================================
   CRUD
================================ */
export async function getAllCategories(req, res) {
  try {
    const [rows] = await pool.query(
      `
      SELECT c.*,
             ci.url AS imageUrl
      FROM ${TABLE} c
      ${latestImageJoin}
      ORDER BY c.${ID} DESC
      `
    );
    res.json(rows);
  } catch (err) {
    console.error("getAllCategories error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getCategoryById(req, res) {
  try {
    const [rows] = await pool.query(
      `
      SELECT c.*,
             ci.url AS imageUrl
      FROM ${TABLE} c
      ${latestImageJoin}
      WHERE c.${ID} = ?
      LIMIT 1
      `,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("getCategoryById error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function createCategory(req, res) {
  try {
    const data = pick(req.body, ALLOWED);
    const name = String(data.categoryName || "").trim();
    if (!name)
      return res.status(400).json({ error: "categoryName is required" });

    const norm = name.replace(/\s+/g, " ");
    const { sql, params } = buildInsert(TABLE, { categoryName: norm });

    const [r] = await pool.execute(sql, params);
    const [[row]] = await pool.query(
      `
      SELECT c.*,
             ci.url AS imageUrl
      FROM ${TABLE} c
      ${latestImageJoin}
      WHERE c.${ID} = ?
      LIMIT 1
      `,
      [r.insertId]
    );
    return res.status(201).json(row);
  } catch (err) {
    if (err?.code === "ER_DUP_ENTRY") {
      // Return existing row (idempotent create by unique name)
      const [[row]] = await pool.query(
        `
        SELECT c.*,
               ci.url AS imageUrl
        FROM ${TABLE} c
        ${latestImageJoin}
        WHERE c.categoryName = ?
        LIMIT 1
        `,
        [
          String(req.body.categoryName || "")
            .trim()
            .replace(/\s+/g, " "),
        ]
      );
      return res.status(200).json(row);
    }
    console.error("createCategory error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function updateCategory(req, res) {
  try {
    const data = pick(req.body, ALLOWED);
    if (typeof data.categoryName === "string") {
      data.categoryName = data.categoryName.trim().replace(/\s+/g, " ");
    }

    const b = buildUpdate(TABLE, data, ID);
    // buildUpdate puts the id placeholder at the end; set it now:
    b.params[b.params.length - 1] = req.params.id;

    const [r] = await pool.execute(b.sql, b.params);
    if (!r.affectedRows) return res.status(404).json({ error: "Not found" });

    const [[row]] = await pool.query(
      `
      SELECT c.*,
             ci.url AS imageUrl
      FROM ${TABLE} c
      ${latestImageJoin}
      WHERE c.${ID} = ?
      LIMIT 1
      `,
      [req.params.id]
    );
    res.json(row);
  } catch (err) {
    if (err?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "categoryName already exists" });
    }
    console.error("updateCategory error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function deleteCategory(req, res) {
  try {
    const [r] = await pool.execute(`DELETE FROM ${TABLE} WHERE ${ID} = ?`, [
      req.params.id,
    ]);
    if (!r.affectedRows) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error("deleteCategory error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

/* ================================
   Upload category image
   Saves file via multer to: public/assets/imgs/<subdir>/<file>
   Inserts into category_images and updates categories.imageUrl.
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

    // Ensure category exists (FK would fail, but this gives a nicer message)
    const [[cat]] = await pool.query(
      `SELECT * FROM ${TABLE} WHERE ${ID} = ? LIMIT 1`,
      [categoryId]
    );
    if (!cat) return res.status(400).json({ error: "Category not found" });

    // Subdir set by your multer middleware (e.g., "categories" or "categories/<slug>")
    const subdir = req._categorySubdir || "categories";
    const fileName = req.file.filename;
    const url = `/assets/imgs/${subdir}/${fileName}`;

    // Save metadata
    await pool.query(
      `INSERT INTO category_images (category_id, file_name, url)
       VALUES (?, ?, ?)`,
      [categoryId, fileName, url]
    );

    // Convenience: store latest url on categories table too
    await pool.query(`UPDATE ${TABLE} SET imageUrl = ? WHERE ${ID} = ?`, [
      url,
      categoryId,
    ]);

    // Return the updated row including latest image
    const [[updated]] = await pool.query(
      `
      SELECT c.*,
             ci.url AS imageUrl
      FROM ${TABLE} c
      ${latestImageJoin}
      WHERE c.${ID} = ?
      LIMIT 1
      `,
      [categoryId]
    );

    res.status(201).json({ uploaded: true, file: url, category: updated });
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
