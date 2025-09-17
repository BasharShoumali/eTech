// server/controllers/descriptions.controller.js
import { pool } from "../db.js";

const TABLE = "product_descriptions";
const ID = "descriptionID";

// helpers
function toInt(v) {
  const n = Number(v);
  return Number.isInteger(n) ? n : NaN;
}

export async function getAllDescriptions(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT ${ID}, productNumber, title, \`text\`, sort_order
         FROM ${TABLE}
        ORDER BY ${ID} DESC`
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

export async function getDescriptionById(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT ${ID}, productNumber, title, \`text\`, sort_order
         FROM ${TABLE}
        WHERE ${ID}=?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
}

export async function createDescription(req, res, next) {
  const conn = await pool.getConnection(); // get a dedicated connection

  try {
    const { productNumber, descriptions } = req.body;

    if (!Array.isArray(descriptions) || descriptions.length === 0) {
      return res.status(400).json({ error: "descriptions required" });
    }

    const pid = Number(productNumber);
    if (!Number.isInteger(pid)) {
      return res.status(400).json({ error: "valid productNumber required" });
    }

    await conn.beginTransaction(); // start transaction

    const values = descriptions.map((d) => [
      pid,
      d.title?.trim() || null,
      d.text?.trim() || null,
    ]);

    await conn.query(
      "INSERT INTO product_descriptions (productNumber, title, text) VALUES ?",
      [values]
    );

    await conn.commit(); // commit if all successful
    res.status(201).json({ ok: true });
  } catch (err) {
    await conn.rollback(); // rollback on error
    console.error("ERR POST /api/descriptions →", err);
    next(err);
  } finally {
    conn.release(); // always release the connection
  }
}

export async function updateDescription(req, res, next) {
  try {
    const id = toInt(req.params.id);
    if (!Number.isInteger(id))
      return res.status(400).json({ error: "invalid id" });

    const fields = [];
    const params = [];

    if (typeof req.body?.title !== "undefined") {
      const title = String(req.body.title).trim();
      if (title && title.length > 50) {
        return res.status(400).json({ error: "title too long (max 50)" });
      }
      fields.push("title=?");
      params.push(title || null);
    }

    if (typeof req.body?.text !== "undefined") {
      const text = String(req.body.text).trim();
      if (text && text.length > 300) {
        return res.status(400).json({ error: "text too long (max 300)" });
      }
      fields.push("`text`=?");
      params.push(text || null);
    }

    if (typeof req.body?.sort_order !== "undefined") {
      const sort = toInt(req.body.sort_order);
      if (!Number.isInteger(sort) || sort < 0) {
        return res
          .status(400)
          .json({ error: "sort_order must be a non-negative integer" });
      }
      fields.push("sort_order=?");
      params.push(sort);
    }

    if (!fields.length) {
      return res.status(400).json({ error: "no updatable fields provided" });
    }

    params.push(id);
    const [r] = await pool.query(
      `UPDATE ${TABLE} SET ${fields.join(", ")} WHERE ${ID}=?`,
      params
    );
    if (!r.affectedRows) return res.status(404).json({ error: "Not found" });

    const [[row]] = await pool.query(
      `SELECT ${ID}, productNumber, title, \`text\`, sort_order
         FROM ${TABLE}
        WHERE ${ID}=?`,
      [id]
    );
    res.json(row);
  } catch (e) {
    next(e);
  }
}

export async function deleteDescription(req, res, next) {
  try {
    const [r] = await pool.query(`DELETE FROM ${TABLE} WHERE ${ID}=?`, [
      req.params.id,
    ]);
    if (!r.affectedRows) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

// get all descriptions for a specific product
export async function getDescriptionsByProduct(req, res, next) {
  try {
    const productNumber = toInt(req.params.productNumber);
    if (!Number.isInteger(productNumber)) {
      return res.status(400).json({ error: "invalid productNumber" });
    }
    const [rows] = await pool.query(
      `SELECT ${ID}, productNumber, title, \`text\`, sort_order
         FROM ${TABLE}
        WHERE productNumber=?
        ORDER BY sort_order, ${ID}`,
      [productNumber]
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

// delete all descriptions for a specific product
export async function deleteDescriptionsByProduct(req, res, next) {
  try {
    const productNumber = toInt(req.params.productNumber);
    if (!Number.isInteger(productNumber)) {
      return res.status(400).json({ error: "invalid productNumber" });
    }
    const [r] = await pool.query(`DELETE FROM ${TABLE} WHERE productNumber=?`, [
      productNumber,
    ]);
    res.json({ ok: true, deleted: r.affectedRows });
  } catch (e) {
    next(e);
  }
}
