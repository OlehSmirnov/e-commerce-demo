import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import { useSelector, useDispatch } from "react-redux";
import { getCartItems, setShowRedirect } from "../../redux/appSlice";

export default function PaymentButtons() {
  const cartItems = useSelector(getCartItems);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState("");

  const handlePayment = async (provider) => {
    setLoading(provider);
    dispatch(setShowRedirect(true));

    try {
      let endpoint = "";
      switch (provider) {
        case "stripe":
          endpoint = process.env.REACT_APP_BACKEND_URL + "/pay/stripe";
          break;
        case "paypal":
          endpoint = process.env.REACT_APP_BACKEND_URL + "/pay/paypal";
          break;
        case "liqpay":
          endpoint = process.env.REACT_APP_BACKEND_URL + "/pay/liqpay";
          break;
        case "fondy":
          endpoint = process.env.REACT_APP_BACKEND_URL + "/pay/fondy";
          break;
        case "wayforpay":
          endpoint = process.env.REACT_APP_BACKEND_URL + "/pay/wayforpay";
          break;
        default:
          break;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cartItems)
      });

      if (provider === "stripe" || provider === "paypal") {
        const { url } = await res.json();
        window.location.href = url;
      } else {
        // LiqPay/Fondy/WayForPay повертають HTML форми
        const formHtml = await res.text();
        const container = document.createElement("div");
        container.innerHTML = formHtml;
        document.body.appendChild(container);
        const form = container.querySelector("form");
        form.submit();
      }
    } catch (err) {
      console.error(provider, err);
      setLoading("");
    }
  };

  return (
    <div className="d-flex flex-column gap-2">
      <Button variant="success" onClick={() => handlePayment("stripe")} disabled={loading}>
        {loading === "stripe" ? "Redirecting..." : "Pay with Stripe"}
      </Button>
      <Button variant="primary" onClick={() => handlePayment("paypal")} disabled={loading}>
        {loading === "paypal" ? "Redirecting..." : "Pay with PayPal"}
      </Button>
      <Button variant="warning" onClick={() => handlePayment("liqpay")} disabled={loading}>
        {loading === "liqpay" ? "Redirecting..." : "Pay with LiqPay"}
      </Button>
      <Button variant="info" onClick={() => handlePayment("fondy")} disabled={loading}>
        {loading === "fondy" ? "Redirecting..." : "Pay with Fondy"}
      </Button>
      <Button variant="secondary" onClick={() => handlePayment("wayforpay")} disabled={loading}>
        {loading === "wayforpay" ? "Redirecting..." : "Pay with WayForPay"}
      </Button>
    </div>
  );
}
