import React, {useState, useEffect, useRef} from "react";
import Button from "react-bootstrap/Button";

const ProductDisplay = () => {

  const formRef = useRef()
  const handleSubmit = () => {
    formRef.current.submit()
  }

  return <section>
    <form ref={formRef} action={`http://localhost:5000/create-checkout-session`} method="POST">
      <Button variant="success" onClick={handleSubmit}>
        Checkout
      </Button>
    </form>
  </section>
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
        "Order canceled -- continue to shop around and checkout when you're ready."
      );
    }
  }, [])

  return message ? (
    <Message message={message}/>
  ) : (
    <ProductDisplay/>
  )
}