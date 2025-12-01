import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";
import paypal from "@paypal/checkout-server-sdk";

dotenv.config();
const app = express();
const allowedOrigins = [
  "https://e-commerce-client-305h.onrender.com",
  "http://localhost:3000",
];

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

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Кошик порожній" });
    }

    const lineItems = items.map((item, i) => {
      // Безпечна назва — навіть якщо name/title взагалі немає
      const name = item.name || item.title || item.productName || `Товар ${i + 1}`;
      const price = parseFloat(item.price);
      const quantity = parseInt(item.count || item.quantity || 1, 10) || 1;

      if (!price || price <= 0) {
        throw new Error(`Невірна ціна в товарі: ${JSON.stringify(item)}`);
      }

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: name.trim() || `Товар ${i + 1}`,
          },
          unit_amount: Math.round(price * 100),
        },
        quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "google_pay", "apple_pay"],
      mode: "payment",
      line_items: lineItems,
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.CANCEL_URL,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ error: err.message });
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

app.get("/", (req,res)=>res.send("Backend is running"));
const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>console.log(`Server running on port ${PORT}`));
