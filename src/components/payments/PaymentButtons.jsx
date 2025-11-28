import React, { useState } from "react";
import { useSelector } from "react-redux";
import { getCartItems } from "../../redux/appSlice";
import styles from "../../styles/cart/cart.module.css";

const API = "http://localhost:5000";

const PaymentButtons = () => {
  const cartItems = useSelector(getCartItems);
  const [loading, setLoading] = useState({ stripe: false, paypal: false });

  const handlePayment = async (provider) => {
    setLoading((prev) => ({ ...prev, [provider]: true }));
    try {
      const res = await fetch(`${API}/pay/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cartItems),
      });

      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed");
    } finally {
      setLoading((prev) => ({ ...prev, [provider]: false }));
    }
  };

  return (
    <div className={styles.buttonContainer}>
      <button
        className={styles.btnStripe}
        onClick={() => handlePayment("stripe")}
        disabled={loading.stripe}
      >
        {loading.stripe ? (
          <span className={styles.loader}></span>
        ) : (
          "Pay with Stripe"
        )}
      </button>

      <button
        className={styles.btnPaypal}
        onClick={() => handlePayment("paypal")}
        disabled={loading.paypal}
      >
        {loading.paypal ? (
          <span className={styles.loader}></span>
        ) : (
          "Pay with PayPal"
        )}
      </button>
    </div>
  );
};

export default PaymentButtons;
