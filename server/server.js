// server/app.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";

import usersRouter from "./routes/users.routes.js";
import apiRouter from "./routes/index.js"; // Must include /products router with /product-images support

const app = express();

/* ---------- Middleware ---------- */
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

/* ---------- Static Assets ---------- */
app.use(
  "/assets/imgs",
  express.static(path.resolve("public", "assets", "imgs"))
);
app.use(
  "/uploads",
  express.static(path.resolve("uploads"), { fallthrough: false })
);

/* ---------- Health Check ---------- */
app.get("/api/health", (_, res) => res.json({ ok: true }));

/* ---------- API Routes (order matters!) ---------- */
app.use("/api/users", usersRouter); // Always mount user routes first

// Main API router that must include `/products` and `/products/product-images`
app.use("/api", apiRouter);

/* ---------- Fallback for unknown API routes ---------- */
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not Found", path: req.originalUrl });
});

/* ---------- Global Error Handler ---------- */
app.use((err, req, res, _next) => {
  console.error("GLOBAL ERR:", {
    path: `${req.method} ${req.originalUrl}`,
    code: err?.code,
    name: err?.name,
    message: err?.message,
    sqlMessage: err?.sqlMessage,
    stack: process.env.NODE_ENV === "production" ? undefined : err?.stack,
  });

  if (err?.name === "MulterError") {
    return res.status(400).json({ error: err.message, code: err.code });
  }

  if (err?.code && err?.sqlMessage && process.env.NODE_ENV !== "production") {
    return res.status(500).json({
      error: "Internal Server Error",
      code: err.code,
      detail: err.sqlMessage,
    });
  }

  res.status(500).json({ error: "Internal Server Error" });
});

/* ---------- Start Server ---------- */
const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
