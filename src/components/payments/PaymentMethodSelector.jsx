import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getCartItems } from "../../redux/appSlice";
import { handlePayment as handlePaymentService } from "../../services/paymentHandler";
import { usePaymentPerformanceLogging } from "../../hooks/usePaymentPerformanceLogging";
import { firestore } from "../../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";

import styles from "../../styles/cart/cart.module.css";

//const API = "http://localhost:5000";

const API = "https://e-commerce-client-305h.onrender.com/";

const PaymentMethodSelector = () => {
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

  usePaymentPerformanceLogging(methods);

  if (!methods) return <p>Loading payment options...</p>;

  const handlePayment = async (provider) => {
    await handlePaymentService(provider, cartItems, API, setLoading);
  };

  return (
    <div className={styles.buttonContainer}>
      {methods.stripe && (
        <button
          className={styles.btnStripe}
          onClick={() => handlePayment("stripe")}
          disabled={loading.stripe}
        >
          {loading.stripe ? <span className={styles.loader}></span> : "Pay with Stripe"}
        </button>
      )}

      {methods.paypal && (
        <button
          className={styles.btnPaypal}
          onClick={() => handlePayment("paypal")}
          disabled={loading.paypal}
        >
          {loading.paypal ? <span className={styles.loader}></span> : "Pay with PayPal"}
        </button>
      )}

      {methods.wayforpay && (
        <button
          className={styles.btnWayForPay}
          onClick={() => handlePayment("wayforpay")}
          disabled={loading.wayforpay}
        >
          {loading.wayforpay ? <span className={styles.loader}></span> : "Pay with WayForPay"}
        </button>
      )}
    </div>
  );
};

export default PaymentMethodSelector;