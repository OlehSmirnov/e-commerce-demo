import React, {useState} from "react"
import Navbar from "react-bootstrap/Navbar"
import {Link} from "react-router-dom"

import Cart from "../cart/Cart"
import Button from "react-bootstrap/Button"
import auth from "../../firebase/firebase"
import {onAuthStateChanged} from "firebase/auth"

const Navigation = () => {

  const [isAuthenticated, setIsAuthenticated] = useState(false)

  onAuthStateChanged(auth, (user) => {
    if (user)
      setIsAuthenticated(true)
    else
      setIsAuthenticated(false)
  })

  return (
    <>
      <Navbar className="p-1 sticky-top" bg="light">
        <Navbar.Brand className="me-auto">
          <Link to="/">Oleh's shop</Link>
        </Navbar.Brand>
        {isAuthenticated
          ?
          <Link to="/user-cabinet">
            <Button>My cabinet</Button>
          </Link>
          :
          <Link to="/login">
            <Button>Login</Button>
          </Link>
        }
        <Cart/>
      </Navbar>
    </>
  )
}

export default Navigation