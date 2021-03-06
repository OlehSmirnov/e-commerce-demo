import React from "react"
import Button from "react-bootstrap/Button"
import {useDispatch, useSelector} from "react-redux"

import {getCartItems, setShowRedirect} from "../../redux/appSlice"

export default function StripeModule() {

  const cartItems = useSelector(getCartItems)
  const dispatch = useDispatch()

  const sendRequest = () => {
    dispatch(setShowRedirect(true))
    fetch(process.env.REACT_APP_BACKEND_URL, {
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
    </>
  )

}