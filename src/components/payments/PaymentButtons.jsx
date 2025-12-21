import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getCartItems } from "../../redux/appSlice";
import { firestore } from "../../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";

import styles from "../../styles/cart/cart.module.css";

const API = "http://localhost:5000";

const PaymentButtons = () => {
  const cartItems = useSelector(getCartItems);

  const [methods, setMethods] = useState(null);
  const [loading, setLoading] = useState({
    stripe: false,
    paypal: false,
    wayforpay: false,
  });

  useEffect(() => {
    const loadMethods = async () => {
      const snap = await getDocs(collection(firestore, "payment_methods"));
      const data = {};
      snap.forEach((doc) => {
        data[doc.id.toLowerCase()] = doc.data().enabled;
      });
      setMethods(data);
    };

    loadMethods();
  }, []);

  useEffect(() => {
  if (!methods) return;

  const t1 = performance.now();
  const t0 = sessionStorage.getItem("provider_switch_t0");
  const provider = sessionStorage.getItem("provider_switch_name");

  if (t0 && provider) {
    const duration = t1 - Number(t0);

    console.log(
      `[SWITCH PERFORMANCE] ${provider}: ${duration.toFixed(2)} ms`
    );

    sessionStorage.removeItem("provider_switch_t0");
    sessionStorage.removeItem("provider_switch_name");
  }
}, [methods]);

  if (!methods) return <p>Loading payment options...</p>;

  const handlePayment = async (provider) => {
    // Генеруємо унікальний ID і фіксуємо час початку
    const paymentId = crypto.randomUUID();
    const startTime = Date.now();

    // Зберігаємо в localStorage — success-сторінка прочитає
    localStorage.setItem(
      "pending_payment",
      JSON.stringify({
        provider,
        paymentId,
        startTime,
      })
    );

    if (provider === "wayforpay") {
      // WayForPay — твій робочий код без змін
      setLoading((prev) => ({ ...prev, wayforpay: true }));
      try {
        const resp = await fetch(`${API}/pay/wayforpay`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: cartItems }),
        });

        if (!resp.ok) throw new Error(await resp.text());

        const params = await resp.json();

        if (!window.Wayforpay) {
          await new Promise((resolve, reject) => {
            const s = document.createElement("script");
            s.src = "https://secure.wayforpay.com/server/pay-widget.js";
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
          });
        }

        const wayforpay = new window.Wayforpay();
        wayforpay.run(
          params,
          async function onApproved(response) {
            const endTime = Date.now();
            const clientData = JSON.parse(params.clientData || "{}");
            const startTime = clientData.startTime || Date.now();

            try {
              await fetch(`${API}/payment-success`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  provider: "wayforpay",
                  paymentId: params.orderReference,
                  startTime: startTime,
                  endTime: endTime,
                }),
              });
            } catch (err) {
              console.error("Не вдалося надіслати час оплати", err);
            }

            window.location.href = window.location.origin;
          }
        );
      } catch (err) {
        alert("Помилка WayForPay: " + err.message);
        localStorage.removeItem("pending_payment");
      } finally {
        setLoading((prev) => ({ ...prev, wayforpay: false }));
      }
      return;
    }

    // Stripe і PayPal — просто редирект, без змін URL
    setLoading((prev) => ({ ...prev, [provider]: true }));

    try {
      const res = await fetch(`${API}/pay/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cartItems }),
      });

      if (!res.ok) {
        const errorBody = await res.text();
        alert(`Помилка ${provider}: ${errorBody}`);
        localStorage.removeItem("pending_payment");
        return;
      }

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url; // ← без жодних додавань!
      }
    } catch (err) {
      alert(`Помилка ${provider}: ${err.message}`);
      localStorage.removeItem("pending_payment");
    } finally {
      setLoading((prev) => ({ ...prev, [provider]: false }));
    }
  };

  return (
    <div className={styles.paymentButtonsContainer}>
      {methods.stripe && (
        <button
          className={styles.btnStripe}
          disabled={loading.stripe}
          onClick={() => handlePayment("stripe")}
        >
          {loading.stripe ? "Loading..." : "Оплатити через Stripe"}
        </button>
      )}
      {methods.paypal && (
        <button
          className={styles.btnPaypal}
          disabled={loading.paypal}
          onClick={() => handlePayment("paypal")}
        >
          {loading.paypal ? "Loading..." : "Оплатити через PayPal"}
        </button>
      )}
      {methods.wayforpay && (
        <button
          className={styles.btnWayForPay}
          disabled={loading.wayforpay}
          onClick={() => handlePayment("wayforpay")}
        >
          {loading.wayforpay ? "Loading..." : "Оплатити через WayForPay"}
        </button>
      )}
    </div>
  );
};

export default PaymentButtons;