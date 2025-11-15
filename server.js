import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import pkg from "pg";
import dotenv from "dotenv";
import cors from "cors";

// Load env variables
dotenv.config();

const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// 🔥 1. DATABASE CONNECTION (Render PostgreSQL)
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

client
  .connect()
  .then(async () => {
    console.log("Connected to Render PostgreSQL ✓");
   
  })
  .catch((err) => console.error("DB connection error:", err));



// 🔥 2. API: CHECK HEALTH
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// 🔥 3. API: GET ALL VOUCHERS
app.get("/api/vouchers", async (req, res) => {
  try {
    const result = await client.query(`
      SELECT id, code, value_cents, currency, expires_at, status, created_at
      FROM vouchers ORDER BY id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Voucher error:", err);
    res.status(500).json({ error: "DB error" });
  }
});

// 🔥 4. API: GET ONE VOUCHER BY CODE
app.get("/api/voucher/:code", async (req, res) => {
  try {
    const result = await client.query(
      "SELECT * FROM vouchers WHERE code = $1 LIMIT 1",
      [req.params.code]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// 🔥 5. API: MARK VOUCHER AS USED
app.post("/api/voucher/use/:code", async (req, res) => {
  try {
    const result = await client.query(
      "UPDATE vouchers SET status='used' WHERE code = $1 RETURNING *",
      [req.params.code]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// 🔥 6. API: ORDERS MANAGEMENT
// Get all orders
app.get("/api/orders", async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM orders ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Create new order
app.post("/api/orders", async (req, res) => {
  try {
    const { customer_name, customer_email, customer_phone, total_amount, items } = req.body;
    const result = await client.query(
      "INSERT INTO orders (customer_name, customer_email, customer_phone, total_amount, items) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [customer_name, customer_email, customer_phone, total_amount, JSON.stringify(items)]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Update order status
app.put("/api/orders/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const result = await client.query(
      "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// 🔥 7. API: SERVICES MANAGEMENT
// Get all services
app.get("/api/services", async (req, res) => {
  try {
    const result = await client.query(`
      SELECT id, name, price, available_count, validity_days, description, created_at
      FROM services ORDER BY id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Services error:", err);
    res.status(500).json({ error: "DB error" });
  }
});

// Create new service
app.post("/api/services", async (req, res) => {
  try {
    const { name, price, available_count, validity_days, description } = req.body;
    const result = await client.query(
      "INSERT INTO services (name, price, available_count, validity_days, description) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, price, available_count, validity_days, description]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Update service
app.put("/api/services/:id", async (req, res) => {
  try {
    const { name, price, available_count, validity_days, description } = req.body;
    const result = await client.query(
      "UPDATE services SET name = $1, price = $2, available_count = $3, validity_days = $4, description = $5 WHERE id = $6 RETURNING *",
      [name, price, available_count, validity_days, description, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Delete service
app.delete("/api/services/:id", async (req, res) => {
  try {
    const result = await client.query(
      "DELETE FROM services WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// 🔥 8. API: USED VOUCHERS MANAGEMENT
// Get all used vouchers
app.get("/api/used-vouchers", async (req, res) => {
  try {
    const result = await client.query(`
      SELECT * FROM used_vouchers ORDER BY id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Used vouchers error:", err);
    res.status(500).json({ error: "DB error" });
  }
});
// Create new used voucher
app.post("/api/used-vouchers", async (req, res) => {
  try {
    const { voucher_code, original_amount, remaining_amount, customer_name, issue_date, expiry_date } = req.body;
    const result = await client.query(
      "INSERT INTO used_vouchers (voucher_code, original_amount, remaining_amount, customer_name, issue_date, expiry_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [voucher_code, original_amount, remaining_amount, customer_name, issue_date, expiry_date]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Use voucher (reduce remaining amount)
app.post("/api/used-vouchers/use/:code", async (req, res) => {
  try {
    const { amount } = req.body;
    const code = req.params.code;
    
    // First get the current voucher
    const current = await client.query(
      "SELECT * FROM used_vouchers WHERE voucher_code = $1",
      [code]
    );
    
    if (current.rows.length === 0) {
      return res.status(404).json({ error: "Voucher not found" });
    }
    
    const voucher = current.rows[0];
    const newRemaining = Math.max(0, voucher.remaining_amount - amount);
    const newUsed = voucher.used_amount + amount;
    const newStatus = newRemaining <= 0 ? 'used' : 'active';
    
    const result = await client.query(
      "UPDATE used_vouchers SET remaining_amount = $1, used_amount = $2, status = $3 WHERE voucher_code = $4 RETURNING *",
      [newRemaining, newUsed, newStatus, code]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// 🔥 9. API: VOUCHERS MANAGEMENT (Enhanced)
// Create new voucher
app.post("/api/vouchers", async (req, res) => {
  try {
    const { amount, available_count, validity_days, description } = req.body;
    const result = await client.query(
      "INSERT INTO vouchers (amount, available_count, validity_days, description) VALUES ($1, $2, $3, $4) RETURNING *",
      [amount, available_count, validity_days, description]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Update voucher
app.put("/api/vouchers/:id", async (req, res) => {
  try {
    const { amount, available_count, validity_days, description } = req.body;
    const result = await client.query(
      "UPDATE vouchers SET amount = $1, available_count = $2, validity_days = $3, description = $4 WHERE id = $5 RETURNING *",
      [amount, available_count, validity_days, description, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Delete voucher
app.delete("/api/vouchers/:id", async (req, res) => {
  try {
    const result = await client.query(
      "DELETE FROM vouchers WHERE id = $1 RETURNING *",
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});


// 6. STATIC FRONTEND (React)
app.use(express.static(path.join(__dirname, "frontend/dist")));

// 7. CATCH-ALL FOR REACT ROUTING
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/dist/index.html"));
});

// 8. START SERVER
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

// Add global error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
