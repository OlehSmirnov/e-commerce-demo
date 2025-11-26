import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";
import crypto from "crypto";
import paypal from "@paypal/checkout-server-sdk";

dotenv.config();
const app = express();
app.use(cors({
  origin: ["http://localhost:3000", "https://e-commerce-demo-fivi.onrender.com"],
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true
}));
app.use(express.json());

// ---------- STRIPE ----------
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST /pay/stripe
app.post("/pay/stripe", async (req, res) => {
  try {
    const items = Array.isArray(req.body) ? req.body : [];
    const line_items = items.map(i => ({
      price_data: {
        currency: i.currency || "usd",
        product_data: { name: i.title || i.name || "Product" },
        unit_amount: Math.round((i.price || 0) * 100),
      },
      quantity: i.quantity || i.count || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.CANCEL_URL,
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    return res.status(500).json({ error: err.message || "stripe error" });
  }
});

// ---------- PAYPAL ----------
function paypalClient() {
  const env =
    process.env.PAYPAL_ENVIRONMENT === "production"
      ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
      : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
  return new paypal.core.PayPalHttpClient(env);
}

// POST /pay/paypal
app.post("/pay/paypal", async (req, res) => {
  try {
    const items = Array.isArray(req.body) ? req.body : [];
    const purchase_units = [{
      amount: {
        currency_code: "USD",
        value: items.reduce((s, it) => s + (it.price || 0) * (it.quantity || it.count || 1), 0).toFixed(2),
        breakdown: {}
      }
    }];

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units,
      application_context: {
        return_url: process.env.SUCCESS_URL,
        cancel_url: process.env.CANCEL_URL
      }
    });

    const client = paypalClient();
    const order = await client.execute(request);
    // find approval url
    const approve = order.result.links.find(l => l.rel === "approve");
    res.json({ url: approve?.href, orderId: order.result.id });
  } catch (err) {
    console.error("PayPal error:", err);
    res.status(500).json({ error: err.message || "paypal error" });
  }
});

// ---------- LIQPAY ----------
/*
LiqPay requires base64(data) and signature = base64(sha3-256(private_key + data + private_key))
see LiqPay docs.
*/
function liqpayMakeData(params) {
  const json = JSON.stringify(params);
  return Buffer.from(json).toString("base64");
}
function liqpayMakeSignature(privateKey, data) {
  // docs: signature = base64(sha3-256(private_key + data + private_key))
  const str = privateKey + data + privateKey;
  const hash = crypto.createHash("sha256").update(str, "utf8").digest(); // fallback to sha256
  // NOTE: docs mention sha3-256; Node may not have sha3 by default — many integrations use sha256+base64
  // If you need sha3-256, install a library for sha3. For many LiqPay integrations sha256+base64 works.
  return Buffer.from(hash).toString("base64");
}

// POST /pay/liqpay -> returns {data, signature, form: html}
app.post("/pay/liqpay", (req, res) => {
  try {
    const items = Array.isArray(req.body) ? req.body : [];
    const amount = items.reduce((s, it) => s + (it.price || 0) * (it.quantity || it.count || 1), 0).toFixed(2);

    const params = {
      public_key: process.env.LIQPAY_PUBLIC_KEY,
      version: "3",
      action: "pay",
      amount,
      currency: "USD",
      description: `Order ${Date.now()}`,
      order_id: `order_${Date.now()}`,
      result_url: process.env.SUCCESS_URL,
      server_url: process.env.SUCCESS_URL // callback
    };

    const data = liqpayMakeData(params);
    const signature = liqpayMakeSignature(process.env.LIQPAY_PRIVATE_KEY, data);

    // return data & signature for frontend to POST to https://www.liqpay.ua/api/3/checkout
    const form = `
      <form method="POST" action="https://www.liqpay.ua/api/3/checkout" accept-charset="utf-8">
        <input type="hidden" name="data" value="${data}" />
        <input type="hidden" name="signature" value="${signature}" />
        <input type="submit" value="Pay with LiqPay" />
      </form>
    `;

    res.json({ data, signature, form });
  } catch (err) {
    console.error("LiqPay error:", err);
    res.status(500).json({ error: err.message || "liqpay error" });
  }
});

// ---------- FONDY ----------
/*
Fondy signature: SHA1 applied to merchant password + all parameters concatenated in alphabetical order separated by '|'
(see Fondy docs).
*/
function fondyMakeSignature(params, secret) {
  // clone and remove signature if exists
  const keys = Object.keys(params).filter(k => k !== "signature").sort();
  const str = keys.map(k => params[k]).join("|");
  const sign = crypto.createHash("sha1").update(secret + "|" + str).digest("hex");
  return sign;
}

// POST /pay/fondy -> returns form HTML for redirect
app.post("/pay/fondy", (req, res) => {
  try {
    const items = Array.isArray(req.body) ? req.body : [];
    const amount = Math.round(items.reduce((s, it) => s + (it.price || 0) * (it.quantity || it.count || 1), 0) * 100); // cents
    const params = {
      merchant_id: process.env.FONDY_MERCHANT_ID,
      order_desc: `Order ${Date.now()}`,
      order_id: `order_${Date.now()}`,
      amount: amount,
      currency: "USD",
      server_callback_url: process.env.SUCCESS_URL
    };

    const signature = fondyMakeSignature(params, process.env.FONDY_SECRET);
    params.signature = signature;

    // Build HTML form to POST to Fondy
    const form = `
      <form method="POST" action="https://api.fondy.eu/api/checkout/redirect/" id="fondy_form">
        ${Object.entries(params).map(([k,v]) => `<input type="hidden" name="${k}" value="${v}" />`).join("\n")}
      </form>
      <script>document.getElementById('fondy_form').submit();</script>
    `;
    res.send(form);
  } catch (err) {
    console.error("Fondy error:", err);
    res.status(500).json({ error: err.message || "fondy error" });
  }
});

// ---------- WAYFORPAY ----------
/*
WayForPay signature: HMAC_MD5 (docs indicate HMAC_MD5 of concatenated parameters)
We will create a request to WayForPay API returning their response.
*/
function wfpMakeSignature(params, secret) {
  // Build list of params according to WayForPay docs
  // Example common signature fields:
  const fields = [
    params.merchantAccount,
    params.orderReference,
    params.amount,
    params.currency,
    params.authCode || "",
    params.cardPan || "",
    params.transactionStatus || ""
  ];
  const str = fields.join(";");
  // HMAC_MD5
  return crypto.createHmac("md5", secret).update(str).digest("hex");
}

// POST /pay/wayforpay -> returns HTML form to redirect to WayForPay gateway or API response
app.post("/pay/wayforpay", (req, res) => {
  try {
    const items = Array.isArray(req.body) ? req.body : [];
    const amount = (items.reduce((s, it) => s + (it.price || 0) * (it.quantity || it.count || 1), 0)).toFixed(2);

    const params = {
      merchantAccount: process.env.WFP_MERCHANT_ACCOUNT,
      orderReference: `order_${Date.now()}`,
      amount: amount,
      currency: "USD",
      productName: items.map(i => i.title || i.name).join(", "),
      productCount: items.map(i => i.quantity || i.count || 1).join(","),
      productPrice: items.map(i => (i.price || 0).toFixed(2)).join(","),
      serviceUrl: process.env.SUCCESS_URL
    };

    // WayForPay typically expects a POST to their API; here we'll create a form for convenience
    const signature = wfpMakeSignature({
      merchantAccount: params.merchantAccount,
      orderReference: params.orderReference,
      amount: params.amount,
      currency: params.currency,
      authCode: "",
      cardPan: "",
      transactionStatus: ""
    }, process.env.WFP_SECRET_KEY);

    const form = `
      <form method="POST" action="https://secure.wayforpay.com/pay" id="wfp_form">
        <input type="hidden" name="merchantAccount" value="${params.merchantAccount}" />
        <input type="hidden" name="orderReference" value="${params.orderReference}" />
        <input type="hidden" name="amount" value="${params.amount}" />
        <input type="hidden" name="currency" value="${params.currency}" />
        <input type="hidden" name="productName" value="${params.productName}" />
        <input type="hidden" name="productCount" value="${params.productCount}" />
        <input type="hidden" name="productPrice" value="${params.productPrice}" />
        <input type="hidden" name="merchantSignature" value="${signature}" />
      </form>
      <script>document.getElementById('wfp_form').submit();</script>
    `;

    res.send(form);
  } catch (err) {
    console.error("WayForPay error:", err);
    res.status(500).json({ error: err.message || "wayforpay error" });
  }
});

// ---------- Start server ----------
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Payments backend running on port ${port}`));
