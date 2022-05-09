import React, {useEffect, useState} from "react"
import Navbar from "react-bootstrap/Navbar"
import {Link} from "react-router-dom"

import Cart from "../cart/Cart"
import Button from "react-bootstrap/Button"
import auth from "../../firebase/firebase"
import {onAuthStateChanged} from "firebase/auth"

import {useSelector} from "react-redux"
import {getFavorites} from "../../redux/appSlice"

const Navigation = () => {

  const favorites = useSelector(getFavorites)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true)
      } else
        setIsAuthenticated(false)
    })
  }, [])

  return (
    <>
      <Navbar className="p-1 sticky-top" bg="light">
        <Navbar.Brand className="me-auto">
          <Link to="/">Oleh's shop</Link>
        </Navbar.Brand>
        {isAuthenticated
          ?
          <Link to="/user-cabinet">
            <Button className="button_nav">
              <i className="bi bi-person-fill"></i>
            </Button>
          </Link>
          :
          <Link to="/login">
            <Button className="button_nav">Login</Button>
          </Link>
        }
        {favorites && auth.currentUser ?
          <Link to="/user-cabinet">
            <Button className="text-danger bg-transparent border-danger ms-2 button_nav">
              <i className="fa-solid fa-heart"/>
              <span> {favorites.length}</span>
            </Button>
          </Link>
          :
          <></>
        }
        <Cart/>
      </Navbar>
    </>
  )
}

export default Navigation