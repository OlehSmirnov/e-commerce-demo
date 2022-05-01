import React from 'react'
import Card from "react-bootstrap/Card"
import Button from "react-bootstrap/Button"
import Modal from "react-bootstrap/Modal"

import {getCartItems, updateItem} from "../../redux/cartSlice"
import {useDispatch, useSelector} from "react-redux"

import styles from "../../styles/cart/cart.module.css"
import {DELETE, DECREASE, INCREASE} from "../../constants";

const CartItems = () => {

  const cartItems = useSelector(getCartItems)
  const dispatch = useDispatch()
  const handleChange = (item, index, type) => dispatch(updateItem({item, index, type}))

  return (
    <Modal.Body>
    {cartItems.map((item, index) => {
      return <Card className={styles.card} key={index}>
        <div className={styles.card_container}>
          <div className={styles.card_image_container}>
            <Card.Img className={styles.card_image} src={item.image}/>
          </div>
          <Card.Text>{item.title}</Card.Text>
          <Button variant="danger" onClick={() => handleChange(item, index, DELETE)} className={styles.card_trash}>
            <i className="fa-solid fa-trash"/>
          </Button>
        </div>
        <Card.Title className={styles.card_footer}>
          <div className={styles.buttons_container}>
            <Button onClick={() => handleChange(item, index, DECREASE)}>-</Button>
            <input disabled={true} value={item.count}/>
            <Button onClick={() => handleChange(item, index, INCREASE)}>+</Button>
          </div>
          <span className={styles.price}>${(item.price * item.count).toFixed(2)}</span>
        </Card.Title>
      </Card>
      })}
    </Modal.Body>
  )
}

export default CartItems