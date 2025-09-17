// server/app.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";

// If you aggregate routers in routes/index.js, great.
// But mount highly-specific routers BEFORE the aggregator to avoid path shadowing.
import usersRouter from "./routes/users.routes.js";
import apiRouter from "./routes/index.js"; // should internally .use('/products', ...), .use('/descriptions', ...)

const app = express();

/* ---------- Core middleware ---------- */
app.use(cors()); // allow http://localhost:* by default; customize if needed
app.use(express.json({ limit: "1mb" })); // JSON bodies
app.use(express.urlencoded({ extended: true, limit: "1mb" })); // form bodies (not file uploads)

/* ---------- Static assets ---------- */
// Serve images saved by multer: /assets/imgs/** -> public/assets/imgs/**
app.use(
  "/assets/imgs",
  express.static(path.resolve("public", "assets", "imgs"))
);

// Optional legacy uploads dir (safe to remove if unused)
app.use(
  "/uploads",
  express.static(path.resolve("uploads"), { fallthrough: false })
);

/* ---------- Health ---------- */
app.get("/api/health", (_, res) => res.json({ ok: true }));

/* ---------- API routers (ORDER MATTERS) ---------- */
/**
 * Mount more-specific routers first to prevent a generic "/:id" in another router
 * from catching paths like "/api/users" or "/api/products/...".
 */
app.use("/api/users", usersRouter); // specific

// Aggregate API router that mounts products/descriptions/etc. under "/api"
app.use("/api", apiRouter);

/* ---------- Not-found for /api (helps debug 404s) ---------- */
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not Found", path: req.originalUrl });
});

/* ---------- Global error handler (last) ---------- */
// If you're using multer, this will also catch MulterError and expose code/message.
app.use((err, req, res, _next) => {
  // Minimal safe logging
  console.error("GLOBAL ERR:", {
    path: `${req.method} ${req.originalUrl}`,
    code: err?.code,
    name: err?.name,
    message: err?.message,
    sqlMessage: err?.sqlMessage,
    stack: process.env.NODE_ENV === "production" ? undefined : err?.stack,
  });

  // Handle known bad-request cases cleanly
  if (err?.name === "MulterError") {
    return res.status(400).json({ error: err.message, code: err.code });
  }

  // MySQL common dev-time errors -> surface a bit more detail during local dev
  if (err?.code && err?.sqlMessage && process.env.NODE_ENV !== "production") {
    return res.status(500).json({
      error: "Internal Server Error",
      code: err.code,
      detail: err.sqlMessage,
    });
  }

  res.status(500).json({ error: "Internal Server Error" });
});

/* ---------- Start ---------- */
const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
