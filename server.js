import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import pkg from "pg";
import dotenv from "dotenv";
import cors from "cors";
import QRCode from "qrcode";

// Load env variables
dotenv.config();

const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// CORS – allow explicit origins so credentials work
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean)
  .concat([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://vouchers-blkg.onrender.com'
  ]);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.options('*', cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
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
app.get("/api/companies/public/:slug", (req, res) => {
  const slug = (req.params.slug || "").toLowerCase();
  if (slug !== "magmas") {
    return res.status(404).json({ success: false, message: "Company not found" });
  }
  return res.json({
    success: true,
    data: {
      company: {
        id: 1,
        name: "Magmas",
        slug: "magmas",
        email: "info@magmas.test",
        description: "Demo company stub served from port 4000",
        phone: "+421000000000",
        address: "Test Street 1",
        city: "Bratislava",
        postalCode: "81101",
        country: "Slovakia",
        website: "https://magmas.test",
        logoUrl: null,
        settings: { industry: "demo" }
      }
    }
  });
});

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

    // 🔥 Transformácia dát pre frontend
    const mapped = result.rows.map(v => ({
      id: v.id,
      code: v.code,
      amount: v.value_cents / 100,       // pôvodne value_cents → EUR
      available_count: 1,                // Render vouchers nemajú sklad, dáme aspoň 1
      validity_days: 365,                // Render nemá validity_days, doplníme
      description: v.status,             // alebo daj '' keď nechceš
      expires_at: v.expires_at,
      status: v.status,
      created_at: v.created_at
    }));

    res.json(mapped);
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

    // Pre Render voucher systém musíme mapovať správne stĺpce
    const value_cents = Math.round(amount * 100); // EUR -> centy
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + validity_days); // pridáme dni
    
    // Generujeme unikátny kód
    const code = `VOUCH-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // 1️⃣ Vytvoríme voucher v Render štruktúre
    const result = await client.query(
      `INSERT INTO vouchers (code, value_cents, currency, expires_at, status, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [code, value_cents, 'EUR', expires_at, 'active', new Date()]
    );

    const voucher = result.rows[0];

    // 2️⃣ QR kód bude obsahovať URL na zobrazenie voucheru
    const qrData = `https://terminar-vouchers.onrender.com/voucher/${voucher.code}`;
    
    // 3️⃣ Generovanie Base64 QR kódu
    const qrImage = await QRCode.toDataURL(qrData);

    // 4️⃣ Skúsime pridať QR kód (ak stĺpec existuje)
    try {
      await client.query(
        "UPDATE vouchers SET qr_code = $1 WHERE id = $2",
        [qrImage, voucher.id]
      );
      voucher.qr_code = qrImage;
    } catch (qrError) {
      console.log("QR kód sa nepodarilo uložiť (stĺpec možno neexistuje):", qrError.message);
      // Nevadí, pokračujeme bez QR kódu
    }

    // 5️⃣ Transformujeme odpoveď do frontend formátu
    const response = {
      id: voucher.id,
      code: voucher.code,
      amount: voucher.value_cents / 100,
      available_count: 1,
      validity_days: validity_days,
      description: description,
      expires_at: voucher.expires_at,
      status: voucher.status,
      created_at: voucher.created_at,
      qr_code: voucher.qr_code || null
    };

    res.json(response);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Update voucher
app.put("/api/vouchers/:id", async (req, res) => {
  try {
    const { amount, validity_days, description } = req.body;
    
    const value_cents = Math.round(amount * 100); // EUR -> centy
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + validity_days); // pridáme dni
    
    const result = await client.query(
      "UPDATE vouchers SET value_cents = $1, expires_at = $2, status = $3 WHERE id = $4 RETURNING *",
      [value_cents, expires_at, description || 'active', req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Voucher not found" });
    }

    const voucher = result.rows[0];
    
    // Transformujeme odpoveď do frontend formátu
    const response = {
      id: voucher.id,
      code: voucher.code,
      amount: voucher.value_cents / 100,
      available_count: 1,
      validity_days: validity_days,
      description: description,
      expires_at: voucher.expires_at,
      status: voucher.status,
      created_at: voucher.created_at
    };
    
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Validate voucher by code
app.get("/api/vouchers/validate/:code", async (req, res) => {
  try {
    const { code } = req.params;
    
    const result = await client.query(
      "SELECT * FROM vouchers WHERE code = $1",
      [code]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Poukaz s týmto kódom neexistuje" });
    }
    
    const voucher = result.rows[0];
    
    // Skontrolujeme či nie je expirovaný
    const isExpired = new Date(voucher.expires_at) < new Date();
    
    // Transformujeme dáta pre frontend
    const response = {
      id: voucher.id,
      code: voucher.code,
      amount: voucher.value_cents ? voucher.value_cents / 100 : voucher.amount,
      service_name: voucher.description || 'Darčekový poukaz',
      customer_name: voucher.customer_name,
      expires_at: voucher.expires_at,
      status: isExpired ? 'expired' : voucher.status,
      created_at: voucher.created_at
    };
    
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Redeem voucher
app.post("/api/vouchers/redeem/:code", async (req, res) => {
  try {
    const { code } = req.params;
    
    const result = await client.query(
      "SELECT * FROM vouchers WHERE code = $1",
      [code]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Poukaz s týmto kódom neexistuje" });
    }
    
    const voucher = result.rows[0];
    
    // Skontrolujeme stav poukazu
    if (voucher.status === 'used') {
      return res.status(400).json({ message: "Tento poukaz už bol uplatnený" });
    }
    
    if (new Date(voucher.expires_at) < new Date()) {
      return res.status(400).json({ message: "Tento poukaz expiroval" });
    }
    
    // Označíme poukaz ako použitý
    const updateResult = await client.query(
      "UPDATE vouchers SET status = 'used', used_at = NOW() WHERE code = $1 RETURNING *",
      [code]
    );
    
    if (updateResult.rows.length === 0) {
      return res.status(500).json({ message: "Chyba pri uplatňovaní poukazu" });
    }
    
    res.json({ 
      message: "Poukaz bol úspešne uplatnený",
      voucher: {
        code: updateResult.rows[0].code,
        amount: updateResult.rows[0].value_cents ? updateResult.rows[0].value_cents / 100 : updateResult.rows[0].amount,
        used_at: updateResult.rows[0].used_at
      }
    });
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

// 🔥 NEW ENDPOINT: GENERATE PDF FROM HTML
app.post("/api/vouchers/generate-pdf", async (req, res) => {
  try {
    const { html, templateId, voucherData } = req.body;
    
    if (!html) {
      return res.status(400).json({ error: "HTML content is required" });
    }

    // Pre development - jednoduchý HTML export namiesto wkhtmltopdf
    // V production by tu bolo: wkhtmltopdf generovanie
    console.log('📄 Generating PDF for template:', templateId);
    
    // Pre teraz vrátime HTML ako response pre debugging
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `inline; filename="voucher-${voucherData.code}.html"`);
    
    // Pridáme CSS pre tlač do HTML
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Poukážka - ${voucherData.customerName}</title>
        <style>
          @page { 
            size: A4; 
            margin: 0; 
          }
          body { 
            margin: 0; 
            padding: 0; 
            font-family: Arial, sans-serif;
          }
          @media print {
            body { 
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact;
            }
          }
          .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #3b82f6;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            z-index: 1000;
          }
          .print-button:hover {
            background: #2563eb;
          }
          @media print {
            .print-button { display: none; }
          }
        </style>
      </head>
      <body>
        <button class="print-button" onclick="window.print()">🖨️ Tlačiť</button>
        ${html}
      </body>
      </html>
    `;
    
    res.send(fullHtml);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: "Failed to generate PDF", details: error.message });
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
