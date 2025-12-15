import React, { useState, useEffect } from "react";
import { Card, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";

import auth, { firestore, signOutUser } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

import Favorites from "../components/favorites/Favorites";

const UserCabinet = () => {
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);

  // --- Auth State ---
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsub();
  }, []);

  // --- Load payment methods ---
  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(collection(firestore, "payment_methods"));
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPaymentMethods(arr);
    };
    load();
  }, []);

  const toggleMethod = async (id, current) => {
  // t₀ — момент кліку адміна
  const t0 = performance.now();

  sessionStorage.setItem("provider_switch_t0", t0.toString());
  sessionStorage.setItem("provider_switch_name", id);

  await updateDoc(doc(firestore, "payment_methods", id), {
    enabled: !current,
  });

  setPaymentMethods((prev) =>
    prev.map((m) => (m.id === id ? { ...m, enabled: !current } : m))
  );
};

  // --- Log out ---
  const handleLogOut = () => {
    signOutUser();
    navigate("/");
  };

  // --- UI states ---
  if (isAuthenticated === null)
    return (
      <div className="d-flex justify-content-center">
        <Spinner animation="grow" />
      </div>
    );

  if (!isAuthenticated)
    return <h2 className="text-center">You are not logged in!</h2>;

  return (
    <Card>
      <Card.Body>
        <h2>Hello {auth.currentUser.email}!</h2>

        {auth.currentUser.email === "admin@admin.com" ? (
          <>
            <h3 className="mt-4">Manage Payment Methods</h3>

            {paymentMethods.map((method) => (
              <Card className="p-2 mt-2" key={method.id}>
                <div className="d-flex justify-content-between align-items-center">
                  <span style={{ fontSize: "18px" }}>
                    {method.id.toUpperCase()}
                  </span>

                  <Form.Check
                    type="switch"
                    id={method.id}
                    label={method.enabled ? "Enabled" : "Disabled"}
                    checked={method.enabled}
                    onChange={() => toggleMethod(method.id, method.enabled)}
                  />
                </div>
              </Card>
            ))}
          </>
        ) : (
          <Favorites />
        )}

        <Button variant="danger" className="mt-2" onClick={handleLogOut}>
          Log out
        </Button>
      </Card.Body>
    </Card>
  );
};

export default UserCabinet;
