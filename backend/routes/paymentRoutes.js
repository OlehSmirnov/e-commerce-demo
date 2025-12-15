/**
 * Payment routes for Stripe, PayPal, WayForPay, etc.
 */

import express from "express";
import crypto from "crypto";
import Stripe from "stripe";
import paypal from "@paypal/checkout-server-sdk";
import { logPayment } from "../config/db.js";
import { ApiError } from "../services/errorHandler.js";

const router = express.Router();

// ===== PROVIDER INITIALIZATION =====
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const paypalClient = new paypal.core.PayPalHttpClient(
  new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  )
);

const paypalOrdersCreateRequest = paypal.orders.OrdersCreateRequest;

// ===== STRIPE =====
router.post("/stripe", async (req, res, next) => {
  try {
    const items = req.body?.items;
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, "Invalid or empty cart items", "INVALID_ITEMS");
    }

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

    res.json({ success: true, url: session.url });
  } catch (err) {
    next(err);
  }
});

// ===== PAYPAL =====
router.post("/paypal", async (req, res, next) => {
  try {
    const items = req.body?.items;
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, "Invalid or empty cart items", "INVALID_ITEMS");
    }

    const total = items.reduce((s, i) => s + (i.price || 0) * (i.count || 1), 0).toFixed(2);
    const paymentId = crypto.randomUUID();

    const request = new paypalOrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [{ amount: { currency_code: "USD", value: total } }],
      application_context: {
        return_url: `${process.env.SUCCESS_URL}?paymentId=${paymentId}`,
        cancel_url: process.env.CANCEL_URL
      }
    });

    const order = await paypalClient.execute(request);
    res.json({ success: true, url: order.result.links.find(l => l.rel === "approve").href });
  } catch (err) {
    next(err);
  }
});

// ===== WAYFORPAY =====
router.post("/wayforpay", async (req, res, next) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    if (items.length === 0) {
      throw new ApiError(400, "Invalid or empty cart items", "INVALID_ITEMS");
    }

    const customer = req.body?.customer || {};

    const total = items.reduce((sum, item) => sum + (item.price || 0) * (item.count || 1), 0);
    const amount = Number(total.toFixed(2));

    const merchantAccount = process.env.WAYFORPAY_MERCHANT_ACCOUNT;
    const merchantDomainName = process.env.WAYFORPAY_MERCHANT_DOMAIN || req.hostname;
    const merchantSecret = process.env.WAYFORPAY_SECRET;
    const currency = process.env.WAYFORPAY_CURRENCY || "USD";

    if (!merchantAccount || !merchantSecret) {
      throw new ApiError(500, "WayForPay configuration missing", "CONFIG_ERROR");
    }

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

    res.json({ success: true, data: payload });
  } catch (err) {
    next(err);
  }
});

// ===== PAYMENT SUCCESS LOGGING =====
router.post("/payment-success", (req, res, next) => {
  try {
    const { provider, paymentId, startTime, endTime } = req.body;

    if (!provider || !paymentId || startTime === undefined || endTime === undefined) {
      throw new ApiError(400, "Missing required fields: provider, paymentId, startTime, endTime", "INVALID_REQUEST");
    }

    const durationMs = endTime - startTime;
    if (durationMs < 0) {
      throw new ApiError(400, "Invalid timing: endTime must be after startTime", "INVALID_REQUEST");
    }

    logPayment(provider, paymentId, durationMs);
    res.json({ success: true, message: "Payment logged successfully" });
  } catch (err) {
    next(err);
  }
});

export default router;
