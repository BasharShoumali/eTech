import { pool } from "../db.js";
import { pick, buildInsert, buildUpdate } from "../helpers/sql.js";

const TABLE = "orders";
const ID = "orderNumber";
const ALLOWED = [
  "userNumber",
  "orderStatus",
  "totalPrice",
  "paymentID",
  "arrayOfProducts",
];

export async function getAllOrders(req, res) {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} ORDER BY ${ID} DESC`);
  res.json(rows);
}
export async function getOrderById(req, res) {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE ${ID}=?`, [
    req.params.id,
  ]);
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  res.json(rows[0]);
}
export async function createOrder(req, res) {
  const data = pick(req.body, ALLOWED);
  const { sql, params } = buildInsert(TABLE, data);
  const [r] = await pool.execute(sql, params);
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE ${ID}=?`, [
    r.insertId,
  ]);
  res.status(201).json(rows[0]);
}
export async function updateOrder(req, res) {
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
export async function deleteOrder(req, res) {
  const [r] = await pool.execute(`DELETE FROM ${TABLE} WHERE ${ID}=?`, [
    req.params.id,
  ]);
  if (!r.affectedRows) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
}

// get all closed orders for a user (history)
export async function getClosedOrdersByUser(req, res) {
  const { userNumber } = req.params;
  const [rows] = await pool.query(
    `SELECT * FROM ${TABLE} WHERE userNumber=? AND orderStatus='closed' ORDER BY ${ID} DESC`,
    [userNumber]
  );
  res.json(rows);
}

// get the single open order (cart) for a user
export async function getOpenOrderByUser(req, res) {
  const { userNumber } = req.params;
  const [rows] = await pool.query(
    `SELECT * FROM ${TABLE} WHERE userNumber=? AND orderStatus='open' ORDER BY ${ID} DESC LIMIT 1`,
    [userNumber]
  );
  res.json(rows[0] || null);
}

// place order: transition OPEN -> ORDERED, then create a fresh OPEN cart
export async function placeOrder(req, res) {
  const { id } = req.params; // orderNumber to place
  // start a transaction
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // verify the order is OPEN
    const [curRows] = await conn.query(
      `SELECT * FROM ${TABLE} WHERE ${ID}=? FOR UPDATE`,
      [id]
    );
    if (!curRows.length) {
      await conn.rollback();
      return res.status(404).json({ error: "Order not found" });
    }
    const cur = curRows[0];
    if (cur.orderStatus !== "open") {
      await conn.rollback();
      return res.status(400).json({ error: "Only open orders can be placed" });
    }

    // set to ORDERED
    await conn.execute(
      `UPDATE ${TABLE} SET orderStatus='ordered' WHERE ${ID}=?`,
      [id]
    );

    // create a new OPEN cart for that user
    const [ins] = await conn.execute(
      `INSERT INTO ${TABLE} (userNumber, orderStatus, totalPrice, paymentID, arrayOfProducts)
       VALUES (?, 'open', 0, NULL, '[]')`,
      [cur.userNumber]
    );

    await conn.commit();

    // return both: the ordered one + the new open cart
    const [[ordered]] = await pool.query(
      `SELECT * FROM ${TABLE} WHERE ${ID}=?`,
      [id]
    );
    const [[newOpen]] = await pool.query(
      `SELECT * FROM ${TABLE} WHERE ${ID}=?`,
      [ins.insertId]
    );
    res.status(200).json({ ordered, newOpen });
  } catch (e) {
    await conn.rollback();
    console.error(e);
    res.status(500).json({ error: "placeOrder failed" });
  } finally {
    conn.release();
  }
}

// cancel: only allowed for ORDERED orders (per your rule)
export async function cancelOrdered(req, res) {
  const { id } = req.params;
  const [rows] = await pool.query(
    `SELECT orderStatus FROM ${TABLE} WHERE ${ID}=?`,
    [id]
  );
  if (!rows.length) return res.status(404).json({ error: "Order not found" });
  if (rows[0].orderStatus !== "ordered") {
    return res
      .status(400)
      .json({ error: "Only ordered orders can be canceled" });
  }
  const [r] = await pool.execute(
    `UPDATE ${TABLE} SET orderStatus='canceled' WHERE ${ID}=?`,
    [id]
  );
  res.json({ ok: true, affected: r.affectedRows });
}

// mark delivered: ORDERED -> CLOSED
export async function markDelivered(req, res) {
  const { id } = req.params;
  const [rows] = await pool.query(
    `SELECT orderStatus FROM ${TABLE} WHERE ${ID}=?`,
    [id]
  );
  if (!rows.length) return res.status(404).json({ error: "Order not found" });
  if (rows[0].orderStatus !== "ordered") {
    return res.status(400).json({ error: "Only ordered orders can be closed" });
  }
  const [r] = await pool.execute(
    `UPDATE ${TABLE} SET orderStatus='closed' WHERE ${ID}=?`,
    [id]
  );
  res.json({ ok: true, affected: r.affectedRows });
}
