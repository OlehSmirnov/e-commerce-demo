import React, {useState, useEffect} from "react";
import Button from "react-bootstrap/Button";

import {getCartItems} from "../../redux/cartSlice"
import {useSelector} from "react-redux"

const APP_PROD = "https://oleh-fake-shop.herokuapp.com/create-checkout-session"
const APP_DEV = "http://localhost:5000/create-checkout-session"

const ButtonProcess = () => {

  const cartItems = useSelector(getCartItems)

  const sendRequest = () => {
    fetch(APP_PROD, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cartItems)
    }).then(res => {
      if (res.ok) return res.json()
      return res.json().then(json => Promise.reject(json))
    })
      .then(({url}) => window.location = url)
      .catch(err => console.log(err))
  }

  return (
    <Button variant="success" onClick={sendRequest}>
      Checkout
    </Button>
  )

}

const Message = ({message}) => (
  <section>
    <p>{message}</p>
  </section>
)

export default function StripeModule() {
  const [message, setMessage] = useState("")

  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search)

    if (query.get("success")) {
      setMessage("Order placed! You will receive an email confirmation.")
    }

    if (query.get("canceled")) {
      setMessage(
        "Order canceled -- shop around and checkout when you're ready."
      );
    }
  }, [])

  return <ButtonProcess/>

}