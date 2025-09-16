import "dotenv/config";
import express from "express";
import cors from "cors";
import router from "./routes/index.js";
import usersRouter from "./routes/users.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_, res) => res.json({ ok: true }));
app.use("/api", router);
app.use("/api/users", usersRouter); 
const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
