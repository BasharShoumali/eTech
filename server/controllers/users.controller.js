import { pool } from "../db.js";
import { pick, buildInsert, buildUpdate } from "../helpers/sql.js";
import bcrypt from "bcryptjs";

const TABLE = "users";
const ID = "userNumber";
const ALLOWED = [
  "firstName",
  "lastName",
  "userName",
  "password_hash",
  "email",
  "phoneNumber",
  "userID",
  "userRole",
  "dateOfBirth",
  "address",
];

export async function forgotPassword(req, res) {
  try {
    const { email, phoneNumber, userID } = req.body || {};

    if (!email || !phoneNumber || !userID) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Find matching user
    const [rows] = await pool.query(
      `SELECT userNumber, userName FROM users WHERE email = ? AND phoneNumber = ? AND userID = ? LIMIT 1`,
      [email, phoneNumber, userID]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = rows[0];
    const tempPassword = generateTempPassword();
    const hashed = await bcrypt.hash(tempPassword, 10);

    // Update DB with new hashed password
    await pool.query(
      `UPDATE users SET password_hash = ? WHERE userNumber = ?`,
      [hashed, user.userNumber]
    );

    res.json({
      userName: user.userName,
      password: tempPassword, // ✅ plain password for UI
    });
  } catch (err) {
    console.error("forgotPassword error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
}

// helper
function generateTempPassword(length = 10) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export async function getAllUsers(req, res) {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} ORDER BY ${ID} DESC`);
  // SECURITY NOTE: consider omitting password_hash in responses
  rows.forEach((r) => delete r.password_hash);
  res.json(rows);
}

export async function getUserById(req, res) {
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE ${ID}=?`, [
    req.params.id,
  ]);
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  const row = rows[0];
  delete row.password_hash;
  res.json(row);
}

export async function createUser(req, res) {
  try {
    const { password, confirmPassword, ...rest } = req.body || {};

    // Validate required fields
    if (!rest.userName || !rest.email || !password) {
      return res
        .status(400)
        .json({ error: "userName, email, and password are required" });
    }

    // Optional double-check on password match
    if (confirmPassword != null && password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // Check for duplicate username or email
    const [[dup]] = await pool.query(
      `SELECT userName, email FROM ${TABLE} WHERE userName = ? OR email = ? LIMIT 1`,
      [rest.userName, rest.email]
    );

    if (dup) {
      if (dup.userName === rest.userName)
        return res.status(409).json({ error: "Username already taken" });
      if (dup.email === rest.email)
        return res.status(409).json({ error: "Email already registered" });
    }

    // Hash password using bcrypt (cost factor 10)
    const password_hash = await bcrypt.hash(password, 10);

    // Whitelist user fields (REMOVE the invalid 'created' field)
    const ALLOWED = [
      "firstName",
      "lastName",
      "userName",
      "email",
      "phoneNumber",
      "userID",
      "userRole",
      "dateOfBirth",
      "address",
    ];

    const data = pick(rest, ALLOWED);
    data.password_hash = password_hash;

    // Default role
    if (!["user", "admin"].includes(data.userRole)) {
      data.userRole = "user";
    }

    // Build and run insert query
    const { sql, params } = buildInsert(TABLE, data);
    const [result] = await pool.execute(sql, params);

    // Fetch the created user
    const [[user]] = await pool.query(
      `SELECT * FROM ${TABLE} WHERE ${ID} = ?`,
      [result.insertId]
    );

    if (!user) {
      return res
        .status(500)
        .json({ error: "User creation failed unexpectedly" });
    }

    delete user.password_hash;
    res.status(201).json(user);
  } catch (e) {
    console.error("createUser error:", e); // ✅ Better error context
    res.status(500).json({ error: e.message || "createUser failed" });
  }
}

export async function updateUser(req, res) {
  const data = pick(req.body, ALLOWED);
  const b = buildUpdate(TABLE, data, ID);
  b.params[b.params.length - 1] = req.params.id;
  const [r] = await pool.execute(b.sql, b.params);
  if (!r.affectedRows) return res.status(404).json({ error: "Not found" });
  const [rows] = await pool.query(`SELECT * FROM ${TABLE} WHERE ${ID}=?`, [
    req.params.id,
  ]);
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  delete rows[0].password_hash;
  res.json(rows[0]);
}

export async function deleteUser(req, res) {
  const [r] = await pool.execute(`DELETE FROM ${TABLE} WHERE ${ID}=?`, [
    req.params.id,
  ]);
  if (!r.affectedRows) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
}
// SEARCH: find by username or email (sanitized for UI)
export async function findUser(req, res) {
  const { username, email } = req.query;
  if (!username && !email) {
    return res.status(400).json({ error: "username or email is required" });
  }
  const [rows] = await pool.query(
    `SELECT ${ID}, firstName, lastName, userName, email, phoneNumber, userRole, userID, dateOfBirth, address, created
     FROM ${TABLE}
     WHERE ${username ? "userName=?" : "email=?"}
     LIMIT 1`,
    [username || email]
  );
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  res.json(rows[0]);
}

export async function loginUser(req, res) {
  const { usernameOrEmail, password } = req.body;
  if (!usernameOrEmail || !password) {
    return res
      .status(400)
      .json({ error: "usernameOrEmail and password are required" });
  }

  const [rows] = await pool.query(
    `SELECT ${ID}, userName, email, password_hash, userRole, firstName, lastName
     FROM ${TABLE}
     WHERE userName=? OR email=?
     LIMIT 1`,
    [usernameOrEmail, usernameOrEmail]
  );
  if (!rows.length)
    return res.status(401).json({ error: "Invalid credentials" });

  const user = rows[0];
  const ok = await bcrypt.compare(password, user.password_hash || "");
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  delete user.password_hash; // never expose hashes
  res.json({ user });
}
// ROLE: change a user's role (user/admin) with validation
export async function changeUserRole(req, res) {
  const role = String(req.body.userRole || "").toLowerCase();
  if (!["user", "admin"].includes(role)) {
    return res
      .status(400)
      .json({ error: "userRole must be 'user' or 'admin'" });
  }
  const [r] = await pool.execute(
    `UPDATE ${TABLE} SET userRole=? WHERE ${ID}=?`,
    [role, req.params.id]
  );
  if (!r.affectedRows) return res.status(404).json({ error: "Not found" });

  const [[row]] = await pool.query(
    `SELECT ${ID}, firstName, lastName, userName, email, phoneNumber, userRole, userID, dateOfBirth, address, created
     FROM ${TABLE} WHERE ${ID}=?`,
    [req.params.id]
  );
  res.json(row);
}
