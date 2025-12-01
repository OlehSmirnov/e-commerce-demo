import React from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const CancelPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Оплату скасовано!</h2>
      <p>Оплата не була завершена. Можете спробувати ще раз.</p>
      <Button variant="primary" onClick={() => navigate("/")}>
        Повернутися до магазину
      </Button>
    </div>
  );
};

export default CancelPage;