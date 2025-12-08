import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getCartItems } from "../../redux/appSlice";

import styles from "../../styles/cart/cart.module.css";

// Для локального тестування
//const API = "http://localhost:5000";

 const API = "https://e-commerce-backend-6y04.onrender.com";

const PaymentButtons = () => {
  const cartItems = useSelector(getCartItems);

  // Стан loading для всіх платіжок
  const [loading, setLoading] = useState({
    stripe: false,
    paypal: false,
    wayforpay: false,
  });

  const handlePayment = async (provider) => {
    if (provider === 'wayforpay') {
      setLoading((prev) => ({ ...prev, wayforpay: true }));
      try {
        const resp = await fetch(`${API}/pay/wayforpay`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: cartItems })
        });
        if (!resp.ok) {
          const body = await resp.text();
          throw new Error(body || `HTTP ${resp.status}`);
        }
        const params = await resp.json();

        // Load WayForPay widget script if not loaded
        if (!window.Wayforpay) {
          await new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://secure.wayforpay.com/server/pay-widget.js';
            s.onload = resolve;
            s.onerror = () => reject(new Error('Failed to load WayForPay widget'));
            document.head.appendChild(s);
          });
        }

        try {
          const wayforpay = new window.Wayforpay();
          wayforpay.run(
            params,
            function onApproved(response) {
              // Redirect to frontend success page with orderReference
              const ref = params.orderReference;
              window.location.href = window.location.origin + '/success' + (ref ? `?orderReference=${encodeURIComponent(ref)}` : '');
            },
            function onDeclined(response) {
              alert('Оплата відхилена');
            },
            function onPending(response) {
              alert('Оплата в обробці');
            }
          );
        } catch (err) {
          console.error('Wayforpay widget error', err);
          alert('Не вдалося запустити WayForPay віджет: ' + (err.message || err));
        }
      } catch (err) {
        console.error('WayForPay error', err);
        alert('Помилка WayForPay: ' + (err.message || err));
      } finally {
        setLoading((prev) => ({ ...prev, wayforpay: false }));
      }
      return;
    }

    setLoading((prev) => ({ ...prev, [provider]: true }));

    try {
      const res = await fetch(`${API}/pay/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cartItems }),
      });

      if (!res.ok) {
        let errorBody;
        try {
          errorBody = await res.json();
        } catch (parseErr) {
          // fallback to text if not json
          errorBody = await res.text();
        }

        console.error(`${provider} API error`, res.status, errorBody);

        // Prefer a human message if present, otherwise stringify details
        let message = `HTTP ${res.status}`;
        if (errorBody) {
          if (typeof errorBody === "string") message = errorBody;
          else if (errorBody.error) message = typeof errorBody.error === "string" ? errorBody.error : JSON.stringify(errorBody.error);
          else if (errorBody.message) message = typeof errorBody.message === "string" ? errorBody.message : JSON.stringify(errorBody.message);
          else message = JSON.stringify(errorBody);
        }

        alert(`Помилка ${provider}: ${message}`);
        setLoading((prev) => ({ ...prev, [provider]: false }));
        return;
      }

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(`${provider} error:`, err);
      // Show useful info to the user
      const info = err && err.message ? err.message : JSON.stringify(err);
      alert(`Помилка ${provider}: ${info}`);
    } finally {
      setLoading((prev) => ({ ...prev, [provider]: false }));
    }
  };

  const total = cartItems.reduce((sum, i) => sum + (i.price * (i.count || 1)), 0);

  return (
    <div className={styles.buttonContainer}>
      <button
        className={styles.btnStripe}
        onClick={() => handlePayment("stripe")}
        disabled={loading.stripe}
      >
        {loading.stripe ? <span className={styles.loader}></span> : "Pay with Stripe"}
      </button>

      <button
        className={styles.btnPaypal}
        onClick={() => handlePayment("paypal")}
        disabled={loading.paypal}
      >
        {loading.paypal ? <span className={styles.loader}></span> : "Pay with PayPal"}
      </button>

      <button
        className={styles.btnWayForPay}
        onClick={() => handlePayment("wayforpay")}
        disabled={loading.wayforpay}
      >
        {loading.wayforpay ? <span className={styles.loader}></span> : "Pay with WayForPay"}
      </button>
    </div>
  );
};

export default PaymentButtons;