import express from "express";
import cors from "cors";
import crypto from "crypto";
import dotenv from "dotenv";
import Stripe from "stripe";
import paypal from "@paypal/checkout-server-sdk";

dotenv.config();
const app = express();
const allowedOrigins = ["http://localhost:3000", "https://e-commerce-demo-fivi.onrender.com"];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // дозволити curl/Postman
    if (allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true
}));

// Для preflight
app.options("*", cors());

app.use(express.json());

// Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
app.post("/pay/stripe", async (req, res) => {
  try {
    const items = req.body || [];
    const lineItems = items.map(item => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.name || "Product" },
        unit_amount: Math.round((item.price || 0) * 100),
      },
      quantity: item.count || 1,
    }));
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.CANCEL_URL,
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
  const items = req.body || [];
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
      cancel_url: "http://localhost:3000/cancel"
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

app.get("/", (req,res)=>res.send("Backend is running"));
const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>console.log(`Server running on port ${PORT}`));
