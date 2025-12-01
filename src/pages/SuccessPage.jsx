import React from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const SuccessPage = () => {
  const navigate = useNavigate();

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
