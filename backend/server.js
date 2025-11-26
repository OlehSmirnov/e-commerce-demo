import express from "express";
import cors from "cors";
import crypto from "crypto";

const app = express();
<<<<<<< HEAD
=======
app.use(cors({
  origin: ["http://localhost:3000", "https://e-commerce-demo-fivi.onrender.com"],
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true
}));
>>>>>>> 9a47eae187ff89d7ba8eb27255f2eb9750546646
app.use(express.json());

// =================== CORS ===================
app.use(cors({
  origin: ["http://localhost:3000", "https://e-commerce-demo-fivi.onrender.com"],
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true
}));

// відповідаємо на preflight OPTIONS
app.options("*", (req, res) => {
  res.sendStatus(200);
});

// =================== HELPER: LiqPay ===================
function liqpayMakeData(params) {
  const json = JSON.stringify(params);
  return Buffer.from(json).toString("base64");
}

function liqpayMakeSignature(privateKey, data) {
  const str = privateKey + data + privateKey;
  const hash = crypto.createHash("sha256").update(str, "utf8").digest();
  return Buffer.from(hash).toString("base64");
}

// =================== PAYMENTS ===================

// Stripe
app.post("/pay/stripe", (req, res) => {
  const items = req.body || [];
  const total = items.reduce((s, i) => s + (i.price || 0) * (i.count || 1), 0).toFixed(2);
  // Тут логіка створення Stripe session (тестові ключі)
  res.json({ url: "https://checkout.stripe.com/test_session_id" });
});

// PayPal
app.post("/pay/paypal", (req, res) => {
  const items = req.body || [];
  const total = items.reduce((s, i) => s + (i.price || 0) * (i.count || 1), 0).toFixed(2);
  // Логіка PayPal Sandbox
  res.json({ url: "https://www.sandbox.paypal.com/checkoutnow?token=test_token" });
});

// LiqPay
app.post("/pay/liqpay", (req, res) => {
  const items = req.body || [];
  const amount = items.reduce((s, i) => s + (i.price || 0) * (i.count || 1), 0).toFixed(2);

  const params = {
    public_key: process.env.LIQPAY_PUBLIC_KEY,
    version: "3",
    action: "pay",
    amount,
    currency: "USD",
    description: `Order ${Date.now()}`,
    order_id: `order_${Date.now()}`,
    result_url: process.env.SUCCESS_URL,
    server_url: process.env.SUCCESS_URL
  };

  const data = liqpayMakeData(params);
  const signature = liqpayMakeSignature(process.env.LIQPAY_PRIVATE_KEY, data);

  const form = `
    <form method="POST" action="https://www.liqpay.ua/api/3/checkout" accept-charset="utf-8">
      <input type="hidden" name="data" value="${data}" />
      <input type="hidden" name="signature" value="${signature}" />
      <input type="submit" value="Pay with LiqPay" />
    </form>
  `;

  res.send(form);
});

// Fondy
app.post("/pay/fondy", (req, res) => {
  const items = req.body || [];
  const amount = items.reduce((s, i) => s + (i.price || 0) * (i.count || 1), 0).toFixed(2);

  const form = `
    <form method="POST" action="https://pay.fondy.eu/api/checkout" accept-charset="utf-8">
      <input type="hidden" name="merchant_id" value="${process.env.FONDY_MERCHANT_ID}" />
      <input type="hidden" name="order_desc" value="Order ${Date.now()}" />
      <input type="hidden" name="amount" value="${amount}" />
      <input type="hidden" name="currency" value="USD" />
      <input type="hidden" name="server_callback_url" value="${process.env.SUCCESS_URL}" />
      <input type="submit" value="Pay with Fondy" />
    </form>
  `;

  res.send(form);
});

// WayForPay
app.post("/pay/wayforpay", (req, res) => {
  const items = req.body || [];
  const amount = items.reduce((s, i) => s + (i.price || 0) * (i.count || 1), 0).toFixed(2);

  const form = `
    <form method="POST" action="https://secure.wayforpay.com/pay" accept-charset="utf-8">
      <input type="hidden" name="merchantAccount" value="${process.env.WFP_MERCHANT_ACCOUNT}" />
      <input type="hidden" name="orderReference" value="order_${Date.now()}" />
      <input type="hidden" name="amount" value="${amount}" />
      <input type="hidden" name="currency" value="USD" />
      <input type="submit" value="Pay with WayForPay" />
    </form>
  `;

  res.send(form);
});

// =================== SERVER ===================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
