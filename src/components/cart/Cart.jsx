import React from "react"
import Button from "react-bootstrap/Button"
import Modal from "react-bootstrap/Modal"
import Card from "react-bootstrap/Card";
import {useDispatch, useSelector} from "react-redux";
import {setShowCart, getShowCart, getCartItems, updateItem} from "../../redux/cartSlice";

import styles from "./Cart.module.css"

const Cart = () => {

  const showCart = useSelector(getShowCart)
  const cartItems = useSelector(getCartItems)
  const dispatch = useDispatch()

  const handleClose = () => dispatch(setShowCart(false))
  const handleShow = () => dispatch(setShowCart(true))
  const handleChange = (item, index, type) => dispatch(updateItem({item, index, type}))

  return (
    <>
      <Button variant="success" onClick={handleShow}>
        <i className="fa-solid fa-cart-shopping cart"></i>
        <span> {cartItems.length > 0 && cartItems.length}</span>
      </Button>
      <Modal show={showCart} onHide={handleClose}>
        <Modal.Header closeButton className={styles.modal_header}>
          <Modal.Title>Your cart{cartItems.length === 0 && " is empty!"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cartItems.map((item, index) => {
            return (
              <Card className={styles.card} key={index}>
                <div className={styles.card_container}>
                  <div className={styles.card_image_container}>
                    <Card.Img className={styles.card_image} src={item.image}/>
                  </div>
                  <Card.Text>{item.title}</Card.Text>
                  <Button variant="danger" onClick={() => handleChange(item, index, "DELETE")} className={styles.card_trash}>
                    <i className="fa-solid fa-trash"/>
                  </Button>
                </div>
                <Card.Title className={styles.card_footer}>
                  <div className={styles.buttons_container}>
                    <Button onClick={() => handleChange(item, index, "DECREASE")} >-</Button>
                    <input disabled={true} value={item.count}/>
                    <Button onClick={() => handleChange(item, index, "INCREASE")}>+</Button>
                  </div>
                  <span className={styles.price}>${item.price}</span>
                </Card.Title>
              </Card>
            )
          })}
        </Modal.Body>
        {cartItems.length > 0 && <Modal.Footer className={styles.modal_footer}>
          <Button variant="success" onClick={handleClose}>
            Checkout
          </Button>
        </Modal.Footer>}
      </Modal>
    </>
  );
};

export default Cart;