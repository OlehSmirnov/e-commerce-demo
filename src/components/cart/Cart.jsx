import React from "react"
import Button from "react-bootstrap/Button"
import Modal from "react-bootstrap/Modal"
import Card from "react-bootstrap/Card"

import {useDispatch, useSelector} from "react-redux"
import {setShowCart, getShowCart, getCartItems, getShowRedirect} from "../../redux/cartSlice"

import styles from "./Cart.module.css"
import CartItems from "./cart-items/CartItems"
import StripeModule from "../stripe/StripeModule";
import {Alert} from "react-bootstrap";

const Cart = () => {

  const showCart = useSelector(getShowCart)
  const cartItems = useSelector(getCartItems)
  const showRedirect = useSelector(getShowRedirect)
  const dispatch = useDispatch()

  const handleClose = () => dispatch(setShowCart(false))
  const handleShow = () => dispatch(setShowCart(true))

  const countTotal = () => {
    let total = 0
    cartItems.forEach(item => {
      total += item.count * item.price
    })
    return total.toFixed(2)
  }

  return (
    <>
      <Button variant="success" onClick={handleShow}>
        <i className="fa-solid fa-cart-shopping cart"></i>
        <span> {cartItems.length > 0 && cartItems.length}</span>
      </Button>
      <Modal show={showCart} onHide={handleClose}>
        <Modal.Header closeButton className={`${styles.modal_header} sticky-top`}>
          {showRedirect ?
            <Alert variant="success">
              You will be now redirected to Stripe checkout!
            </Alert> :
            <Modal.Title>Your cart{cartItems.length === 0 && " is empty!"}</Modal.Title>
          }
        </Modal.Header>
        <CartItems/>
        {cartItems.length > 0 &&
          <Modal.Footer className={styles.modal_footer}>
            <Card.Title>
              Total: ${countTotal()}
            </Card.Title>
            <StripeModule/>
          </Modal.Footer>
        }
      </Modal>
    </>
  )
}

export default Cart;