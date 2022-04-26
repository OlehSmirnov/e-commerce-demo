import React from "react"
import Navbar from "react-bootstrap/Navbar"

import classes from "./Navigation.module.css"
import Cart from "../cart/Cart";

const Navigation = () => {
  return (
    <>
      <Navbar className={classes.navbar} bg="light" expand="lg">
        <Navbar.Brand href="#home">Fake Shop</Navbar.Brand>
        <Cart/>
      </Navbar>
    </>
  );
};

export default Navigation;