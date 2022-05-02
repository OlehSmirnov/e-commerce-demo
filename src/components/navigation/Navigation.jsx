import React from "react"
import Navbar from "react-bootstrap/Navbar"

import Cart from "../cart/Cart"
import {Link} from "react-router-dom"

const Navigation = () => {

  return (
    <>
      <Navbar className="p-1 sticky-top" bg="light">
        <Navbar.Brand>
          <Link to="/">Oleh's shop</Link>
        </Navbar.Brand>
        <Cart/>
      </Navbar>
    </>
  )
}

export default Navigation