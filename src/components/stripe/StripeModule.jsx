import React, {useState} from "react"
import Button from "react-bootstrap/Button"

import {getCartItems} from "../../redux/cartSlice"
import {useSelector} from "react-redux"
import {Alert} from "react-bootstrap";

const APP_PROD = "https://oleh-fake-shop.herokuapp.com/create-checkout-session"
const APP_DEV = "http://localhost:5000/create-checkout-session"

export default function StripeModule() {

  const [isClicked, setIsClicked] = useState(false)
  const cartItems = useSelector(getCartItems)

  const sendRequest = () => {
    setIsClicked(true)
    fetch(APP_PROD, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cartItems)
    }).then(res => res.json())
      .then(({url}) => window.location = url)
      .catch(err => console.log(err))
  }

  return (
    <>
      <Button variant="success" onClick={sendRequest}>
        Checkout
      </Button>
      {isClicked && <Alert variant="success" className="position-absolute top-0">
        You are being redirected to Stripe checkout!
      </Alert>}
    </>
  )

}