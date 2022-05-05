import React from "react"
import Button from "react-bootstrap/Button"
import {useDispatch, useSelector} from "react-redux"

import {getCartItems, setShowRedirect} from "../../redux/appSlice"
import {APP_PROD, APP_DEV} from "../../constants"

export default function StripeModule() {

  const cartItems = useSelector(getCartItems)
  const dispatch = useDispatch()

  const sendRequest = () => {
    dispatch(setShowRedirect(true))
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
    </>
  )

}