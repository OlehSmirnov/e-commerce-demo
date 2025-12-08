import express from "express";
import cors from "cors";
import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import paypal from "@paypal/checkout-server-sdk";

// Load .env located in the same folder as this file (robust if process is started from project root)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const allowedOrigins = [
  "https://e-commerce-client-305h.onrender.com",
  "http://localhost:3000",
];

app.use(cors({
  origin: function(origin, callback) {

    if (!origin) return callback(null, true); // дозволити curl/Postman
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

// In-memory orders store for demo/testing
const orders = new Map();

// Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
app.post("/pay/stripe", async (req, res) => {
  try {
    // Accept both { items: [...] } and direct array bodies
    let items = req.body && req.body.items ? req.body.items : req.body || [];
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
      success_url: process.env.SUCCESS_URL + "?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: process.env.CANCEL_URL,
      payment_intent_data: {
        setup_future_usage: "off_session"
      }
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
  const items = req.body && req.body.items ? req.body.items : req.body || [];
  const total = items.reduce((s,i)=>s + (i.price||0)*(i.count||1),0).toFixed(2);

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [{
      amount: { currency_code: "USD", value: total }
    }],
    application_context: {
      return_url: process.env.SUCCESS_URL,
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


// WAYFORPAY 
app.post('/pay/wayforpay', express.json(), (req, res) => {
  try {
    const items = req.body && req.body.items ? req.body.items : req.body.items || [];
    const customer = req.body && req.body.customer ? req.body.customer : {};

    const total = items.reduce((s, i) => s + (i.price || 0) * (i.count || 1), 0);
    const amount = Number(total).toFixed(2);

    const merchantAccount = process.env.WAYFORPAY_MERCHANT_ACCOUNT;
    const merchantDomainName = process.env.WAYFORPAY_MERCHANT_DOMAIN || req.hostname;
    const merchantSecret = process.env.WAYFORPAY_SECRET;
    const currency = process.env.WAYFORPAY_CURRENCY || 'USD';

    if (!merchantAccount || !merchantSecret) {
      console.error('WayForPay keys missing');
      return res.status(500).json({ error: 'WayForPay not configured on server' });
    }

    const orderReference = `order_${Date.now()}`;
    const orderDate = Math.floor(Date.now() / 1000);

    const productName = items.map(i => i.title || i.name || 'Product');
    const productCount = items.map(i => i.count || 1);
    const productPrice = items.map(i => (i.price || 0).toFixed(2));

    // Build canonical string as per WayForPay: fields joined by ';'
    const signatureParts = [
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
    const signatureString = signatureParts.join(';');
    // HMAC-MD5 with merchant secret
    const merchantSignature = crypto.createHmac('md5', merchantSecret).update(signatureString, 'utf8').digest('hex');

    // Return the parameters that the frontend widget needs to run
    const payload = {
      merchantAccount,
      merchantDomainName,
      orderReference,
      orderDate,
      amount,
      currency,
      productName,
      productCount,
      productPrice,
      clientFirstName: customer.firstName || customer.clientFirstName || '',
      clientLastName: customer.lastName || customer.clientLastName || '',
      clientEmail: customer.email || customer.clientEmail || '',
      clientPhone: customer.phone || customer.clientPhone || '',
      language: customer.language || 'EN',
      authorizationType: 'SimpleSignature',
      merchantSignature
    };

    res.json(payload);
  } catch (err) {
    console.error('WayForPay create error', err);
    res.status(500).json({ error: 'wayforpay_failed', message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>console.log(`Server running on port ${PORT}`));