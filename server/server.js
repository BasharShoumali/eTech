import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";

import router from "./routes/index.js";
import usersRouter from "./routes/users.routes.js";

const app = express();

/* ---------- Core middleware ---------- */
app.use(cors());                                    // allow http://localhost:* by default
app.use(express.json());                            // parse JSON bodies
app.use(express.urlencoded({ extended: true }));    // (safe) parse form bodies

/* ---------- Static assets ---------- */
// /assets/imgs/** -> public/assets/imgs/**
app.use(
  "/assets/imgs",
  express.static(path.resolve("public", "assets", "imgs"))
);
// optional legacy uploads dir, if you still use it elsewhere
const UPLOADS = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(UPLOADS, { fallthrough: false }));

/* ---------- Health ---------- */
app.get("/api/health", (_, res) => res.json({ ok: true }));

/* ---------- API routers (order matters) ---------- */
// Mount /api first so /api/products/** works as expected
app.use("/api", router);            // routes/index.js -> router.use("/products", productsRouter)
app.use("/api/users", usersRouter);

/* ---------- Not-found for /api (helps debug 404s) ---------- */
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not Found", path: req.originalUrl });
});

/* ---------- Global error handler (last) ---------- */
app.use((err, req, res, next) => {
  console.error(err);               // see real error in server console
  res.status(500).json({ error: "Internal Server Error" });
});

/* ---------- Start ---------- */
const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
