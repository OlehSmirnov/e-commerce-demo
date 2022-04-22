import React, {useEffect, useState} from "react"
import Card from "react-bootstrap/Card"
import Col from "react-bootstrap/Col"
import Button from "react-bootstrap/Button"

import classes from "./ProductCard.module.css"
import {useDispatch, useSelector} from "react-redux";
import {getCartItems, setItem, setShowCart} from "../../redux/cartSlice";

const ProductCard = ({id, image, title, price}) => {

  const dispatch = useDispatch()
  const [addedToCart, setAddedToCart] = useState(false)
  const cartItems = useSelector(getCartItems)

  const addToCart = () => {
    if (addedToCart) {
      dispatch(setShowCart(true))
    } else {
      setAddedToCart(true)
      dispatch(setItem({count: 1, id, title, price, image}))
    }
  }

  const isItemAdded = () => cartItems.filter(item => item.id === id).length !== 0

  useEffect(() => {
    setAddedToCart(isItemAdded())
  }, [cartItems])

  return (
    <Col>
      <Card className={classes.card}>
        <div className={classes.image_container}>
          <Card.Img className={classes.image} variant="top" src={image}/>
        </div>
        <Card.Body className={classes.card_body}>
          <Card.Text className={classes.title}>{title}</Card.Text>
          <Card.Subtitle className={classes.card_subtitle}>${price}
            <Button onClick={addToCart}>
              {addedToCart
                ?
                <i className="fa-solid fa-check"/>
                :
                <i className="fa-solid fa-cart-arrow-down cart"/>}
            </Button>
          </Card.Subtitle>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default ProductCard;