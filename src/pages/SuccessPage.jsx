import React, {useEffect} from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000";
const SuccessPage = () => {
  const navigate = useNavigate();

 useEffect(() => {
    const pending = localStorage.getItem("pending_payment");
    if (!pending) return;

    const { provider, paymentId, startTime } = JSON.parse(pending);
    const endTime = Date.now();

    fetch(`${API}/payment-success`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        paymentId,
        startTime,
        endTime,
      }),
    })
      .then(() => console.log("Час оплати залоговано:", provider))
      .catch((err) => console.error("Помилка логування:", err))
      .finally(() => localStorage.removeItem("pending_payment"))}, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Оплата успішна!</h2>
      <p>Дякуємо за покупку.</p>
      <Button variant="primary" onClick={() => navigate("/")}>
        Повернутися до магазину
      </Button>
    </div>
  );
};

export default SuccessPage;
