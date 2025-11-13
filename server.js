import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// 1. API ROUTES
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// 2. SERVE FRONTEND (DÔLEŽITÉ)
app.use(express.static(path.join(__dirname, "frontend/dist")));

// 3. CATCH ALL – VRÁŤ FRONTEND
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/dist/index.html"));
});

// 4. START SERVER
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
