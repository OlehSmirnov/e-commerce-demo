import React from 'react';
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";

import classes from "./Nav.module.css";

const Nav = () => {
  return (
    <>
    <Navbar className={classes.navbar} bg="light" expand="lg">
      <Button>Filters</Button>
    </Navbar>
    </>
  );
};

export default Nav;