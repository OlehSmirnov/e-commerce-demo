import express from "express";
import cors from "cors";
import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import paypal from "@paypal/checkout-server-sdk";
import sqlite3 from "sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const DB_PATH = path.join(__dirname, "payment_performance.db");

// Підключення до SQLite
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Помилка підключення до SQLite:", err);
  } else {
    console.log("SQLite база підключена:", DB_PATH);
  }
});

// Створення спрощеної таблиці (лише потрібні поля)
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS payment_performance (
      payment_id TEXT PRIMARY KEY,      -- унікальний ID платежу
      provider TEXT NOT NULL,
      duration_ms INTEGER NOT NULL      -- час оплати в мілісекундах
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_provider ON payment_performance(provider)`);
});

// Спрощена функція логування — тільки duration_ms
function logPayment(provider, paymentId, durationMs) {
  if (!provider || !paymentId || durationMs == null) {
    console.error("[Payment Log] Помилка: неповні дані для логування");
    return;
  }

  db.run(
    `INSERT OR REPLACE INTO payment_performance 
     (payment_id, provider, duration_ms)
     VALUES (?, ?, ?)`,
    [paymentId, provider, durationMs],
    function (err) {
      if (err) {
        console.error("Помилка запису в SQLite:", err.message);
      } else {
        console.log(`[Payment Log] ${provider} | ${paymentId} | ${durationMs}ms`);
      }
    }
  );
}

const app = express();

const allowedOrigins = [
  "https://e-commerce-client-305h.onrender.com",
  "http://localhost:3000",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (typeof origin === 'string' && origin.startsWith('file:')) return callback(null, true);
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true
}));

app.options("*", cors());
app.use(express.json());

// Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post("/pay/stripe", async (req, res) => {
  try {
    const items = req.body?.items || [];
    const paymentId = crypto.randomUUID();
    const startTime = Date.now();

    const lineItems = items.map(item => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.name || "Product" },
        unit_amount: Math.round((item.price || 0) * 100),
      },
      quantity: item.count || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "link"],
      mode: "payment",
      line_items: lineItems,
      success_url: process.env.SUCCESS_URL + `?session_id={CHECKOUT_SESSION_ID}&paymentId=${paymentId}`,
      cancel_url: process.env.CANCEL_URL,
      metadata: { paymentId, startTime: startTime.toString() }
    });


    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Stripe failed", message: err.message });
  }
});

// PayPal
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
const client = new paypal.core.PayPalHttpClient(environment);

app.post("/pay/paypal", async (req, res) => {
  const items = req.body?.items || [];
  const total = items.reduce((s, i) => s + (i.price || 0) * (i.count || 1), 0).toFixed(2);
  const paymentId = crypto.randomUUID();
  const startTime = Date.now();

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [{ amount: { currency_code: "USD", value: total } }],
    application_context: {
      return_url: `${process.env.SUCCESS_URL}?paymentId=${paymentId}`,
      cancel_url: process.env.CANCEL_URL
    }
  });

  try {
    const order = await client.execute(request);

    res.json({ url: order.result.links.find(l => l.rel === "approve").href });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "PayPal failed", message: err.message });
  }
});

// WayForPay
app.post('/pay/wayforpay', express.json(), async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    const customer = req.body?.customer || {};

    const total = items.reduce((sum, item) => sum + (item.price || 0) * (item.count || 1), 0);
    const amount = Number(total.toFixed(2));

    const merchantAccount = process.env.WAYFORPAY_MERCHANT_ACCOUNT;
    const merchantDomainName = process.env.WAYFORPAY_MERCHANT_DOMAIN || req.hostname;
    const merchantSecret = process.env.WAYFORPAY_SECRET;
    const currency = process.env.WAYFORPAY_CURRENCY || "USD";

    const orderReference = `wfp_${Date.now()}`;
    const orderDate = Math.floor(Date.now() / 1000);
    const startTime = Date.now();

    const productName = items.map(i => i.title || i.name || "Товар");
    const productCount = items.map(i => i.count || 1);
    const productPrice = items.map(i => Number(i.price || 0).toFixed(2));

    const signatureFields = [
      merchantAccount,
      merchantDomainName,
      orderReference,
      orderDate,
      amount,
      currency,
      ...productName,
      ...productCount.map(String),
      ...productPrice
    ];

    const signatureString = signatureFields.join(";");
    const merchantSignature = crypto
      .createHmac("md5", merchantSecret)
      .update(signatureString, "utf8")
      .digest("hex");


    const payload = {
      merchantAccount,
      merchantDomainName,
      orderReference,
      orderDate,
      amount: amount.toString(),
      currency,
      productName,
      productCount,
      productPrice,
      clientFirstName: customer.firstName || customer.clientFirstName || "",
      clientLastName: customer.lastName || customer.clientLastName || "",
      clientEmail: customer.email || customer.clientEmail || "",
      clientPhone: customer.phone || customer.clientPhone || "",
      language: "UK",
      authorizationType: "SimpleSignature",
      merchantSignature,
      clientData: JSON.stringify({ orderReference, startTime })
    };


    res.json(payload);
  } catch (err) {
    console.error("WayForPay create error:", err);
    res.status(500).json({ error: "wayforpay_failed", message: err.message || "Internal server error" });
  }
});

app.post("/payment-success", express.json(), (req, res) => {
  const { provider, paymentId, startTime, endTime } = req.body;

  if (!provider || !paymentId || !startTime || !endTime) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const durationMs = endTime - startTime;

  logPayment(provider, paymentId, durationMs);

  res.json({ success: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));