import { pool } from "../db.js";
import { pick, buildInsert, buildUpdate } from "../helpers/sql.js";

const TABLE = "paymentMethod";
const ID = "paymentID";
const ALLOWED = [
  "userNumber",
  "cardHolderName",
  "cardNumber",
  "expiryMonth",
  "expiryYear",
  "billingAddress",
  "isDefault",
];

function mask(cardNumber = "") {
  return cardNumber ? cardNumber.replace(/\d(?=\d{4})/g, "•") : cardNumber;
}

async function setOnlyDefault(conn, userNumber, paymentID) {
  await conn.execute(`UPDATE ${TABLE} SET isDefault=0 WHERE userNumber=?`, [
    userNumber,
  ]);
  await conn.execute(`UPDATE ${TABLE} SET isDefault=1 WHERE ${ID}=?`, [
    paymentID,
  ]);
}

// ---------------------- Get Methods ----------------------

export async function getPaymentsByUser(req, res) {
  const { userNumber } = req.params;

  const [rows] = await pool.query(
    `SELECT ${ID}, userNumber, cardHolderName, 
            CONCAT(LEFT(cardNumber, 0), '•••• •••• •••• ', RIGHT(cardNumber, 4)) AS cardNumber,
            expiryMonth, expiryYear, billingAddress, created_at, isDefault
     FROM ${TABLE}
     WHERE userNumber = ? AND isDeleted = 0
     ORDER BY isDefault DESC, ${ID} DESC`,
    [userNumber]
  );

  res.json(rows);
}

export async function getDefaultPaymentByUser(req, res) {
  const { userNumber } = req.params;

  const [rows] = await pool.query(
    `SELECT ${ID}, userNumber, cardHolderName, 
            CONCAT(LEFT(cardNumber, 0), '•••• •••• •••• ', RIGHT(cardNumber, 4)) AS cardNumber,
            expiryMonth, expiryYear, billingAddress, created_at, isDefault
     FROM ${TABLE}
     WHERE userNumber = ? AND isDefault = 1 AND isDeleted = 0
     LIMIT 1`,
    [userNumber]
  );

  res.json(rows[0] || null);
}

// ---------------------- Create ----------------------

export async function createPayment(req, res) {
  const data = pick(req.body, ALLOWED);
  if (!data.userNumber || !data.cardNumber)
    return res
      .status(400)
      .json({ error: "userNumber and cardNumber required" });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[cnt]] = await conn.query(
      `SELECT COUNT(*) AS c FROM ${TABLE} WHERE userNumber=?`,
      [data.userNumber]
    );
    const makeDefault = data.isDefault === 1 || cnt.c === 0;

    const { sql, params } = buildInsert(TABLE, {
      ...data,
      isDefault: makeDefault ? 1 : 0,
    });
    const [r] = await conn.execute(sql, params);

    if (makeDefault) await setOnlyDefault(conn, data.userNumber, r.insertId);

    await conn.commit();

    const [rows] = await pool.query(
      `SELECT ${ID}, userNumber, cardHolderName,
              CONCAT(LEFT(cardNumber, 0), '•••• •••• •••• ', RIGHT(cardNumber, 4)) AS cardNumber,
              expiryMonth, expiryYear, billingAddress, created_at, isDefault
       FROM ${TABLE} WHERE ${ID}=?`,
      [r.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    await conn.rollback();
    console.error(e);
    res.status(500).json({ error: "createPayment failed" });
  } finally {
    conn.release();
  }
}

// ---------------------- Update ----------------------

export async function updatePayment(req, res) {
  const data = pick(req.body, ALLOWED);
  const b = buildUpdate(TABLE, data, ID);
  b.params[b.params.length - 1] = req.params.id;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    if (data.isDefault === 1) {
      const [[row]] = await conn.query(
        `SELECT userNumber FROM ${TABLE} WHERE ${ID}=?`,
        [req.params.id]
      );
      if (!row) {
        await conn.rollback();
        return res.status(404).json({ error: "Not found" });
      }
      await setOnlyDefault(conn, row.userNumber, req.params.id);
    }

    const [r] = await conn.execute(b.sql, b.params);
    if (!r.affectedRows) {
      await conn.rollback();
      return res.status(404).json({ error: "Not found" });
    }

    await conn.commit();

    const [rows] = await pool.query(
      `SELECT ${ID}, userNumber, cardHolderName,
              CONCAT(LEFT(cardNumber, 0), '•••• •••• •••• ', RIGHT(cardNumber, 4)) AS cardNumber,
              expiryMonth, expiryYear, billingAddress, created_at, isDefault
       FROM ${TABLE} WHERE ${ID}=?`,
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (e) {
    await conn.rollback();
    console.error(e);
    res.status(500).json({ error: "updatePayment failed" });
  } finally {
    conn.release();
  }
}

// ---------------------- Delete ----------------------

export async function deletePayment(req, res) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Get the current card info
    const [[cur]] = await conn.query(
      `SELECT userNumber, isDefault FROM ${TABLE} WHERE ${ID}=? AND isDeleted=0`,
      [req.params.id]
    );

    if (!cur) {
      await conn.rollback();
      return res.status(404).json({ error: "Not found or already deleted" });
    }

    // Soft delete the card
    await conn.execute(`UPDATE ${TABLE} SET isDeleted=1 WHERE ${ID}=?`, [
      req.params.id,
    ]);

    // If the deleted card was default, promote another one
    if (cur.isDefault === 1) {
      const [[nextOne]] = await conn.query(
        `SELECT ${ID} FROM ${TABLE}
         WHERE userNumber=? AND isDeleted=0
         ORDER BY ${ID} DESC
         LIMIT 1`,
        [cur.userNumber]
      );

      if (nextOne) {
        await setOnlyDefault(conn, cur.userNumber, nextOne[ID]);
      }
    }

    await conn.commit();
    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    console.error(e);
    res.status(500).json({ error: "deletePayment failed" });
  } finally {
    conn.release();
  }
}

// ---------------------- Set Default ----------------------

export async function setDefaultPayment(req, res) {
  const { id } = req.params;
  const [[row]] = await pool.query(
    `SELECT userNumber FROM ${TABLE} WHERE ${ID}=?`,
    [id]
  );
  if (!row) return res.status(404).json({ error: "Not found" });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await setOnlyDefault(conn, row.userNumber, id);
    await conn.commit();

    const [[pm]] = await pool.query(
      `SELECT ${ID}, userNumber, cardHolderName,
              CONCAT(LEFT(cardNumber, 0), '•••• •••• •••• ', RIGHT(cardNumber, 4)) AS cardNumber,
              expiryMonth, expiryYear, billingAddress, created_at, isDefault
       FROM ${TABLE} WHERE ${ID}=?`,
      [id]
    );
    res.json(pm);
  } catch (e) {
    await conn.rollback();
    console.error(e);
    res.status(500).json({ error: "setDefault failed" });
  } finally {
    conn.release();
  }
}
