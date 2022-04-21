import React from "react"
import Button from "react-bootstrap/Button"
import Modal from "react-bootstrap/Modal"
import Image from "react-bootstrap/Image";
import Card from "react-bootstrap/Card";
import {useDispatch, useSelector} from "react-redux";
import {setItem, setShowCart, getShowCart, getCartItems} from "../../redux/cartSlice";

const Cart = () => {

  const showCart = useSelector(state => state.cart.showCart)
  const cartItems = useSelector(getCartItems)
  const dispatch = useDispatch()

  const handleClose = () => dispatch(setShowCart(false))
  const handleShow = () => dispatch(setShowCart(true))

  return (
    <>
      <Button variant="success" onClick={handleShow}>
        <i className="fa-solid fa-cart-shopping cart"></i>
        <span> {cartItems.length > 0 ? cartItems.length : ""}</span>
      </Button>
      <Modal show={showCart} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Your cart</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cartItems.map((item, index) => {
            return (
              <Card key={index}>
                <Image src={item.image} width={50}/>
                {item.title}
                <p>${item.price}</p>
              </Card>
            )
          })}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Cart;