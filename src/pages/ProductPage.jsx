import React, {useEffect, useState} from "react"
import {Card, Spinner} from "react-bootstrap"
import {useParams} from "react-router-dom"
import {useDispatch, useSelector} from "react-redux"
import Button from "react-bootstrap/Button"

import styles from "../styles/pages/product-page/product_page.module.css"
import {getCartItems, setItem, setShowCart} from "../redux/appSlice"


const ProductPage = () => {

  const id = useParams().id
  const [product, setProduct] = useState()
  const [errorFetching, setErrorFetching] = useState(false)
  const dispatch = useDispatch()
  const cartItems = useSelector(getCartItems)

  const addToCart = () => {
    if (isItemAdded()) {
      dispatch(setShowCart(true))
    } else {
      dispatch(setItem({count: 1, id, title: product.title, price: product.price, image: product.image}))
    }
  }

  const isItemAdded = () => cartItems.filter(item => item.id == id).length !== 0

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://fakestoreapi.com/products/" + id)
        const data = await res.json()
        setProduct(data)
      } catch (error) {
        setErrorFetching(true)
        console.error("Error in ProductPage: " + error)
      }
    }
    fetchData()
  }, [])

  if (errorFetching) return <div className="d-flex justify-content-center">
    <h2>There was an error connecting to server, please try again later!</h2>
  </div>

  if (!product) return <div className="d-flex justify-content-center">
    <Spinner animation="grow"/>
  </div>

  return (
    <Card className={styles.card}>
        <Card.Img variant="top" src={product.image}/>
      <Card.Body className={styles.card_body}>
        <Card.Title>{product.title}</Card.Title>
        <Card.Subtitle className={styles.card_subtitle}>${product.price}</Card.Subtitle>
        <Card.Text>{product.description}</Card.Text>
        <Card.Title>
          <span><i className={`fa-solid fa-star ${styles.star}`}/>
          {product.rating.rate} {product.rating.count} reviews</span>
        </Card.Title>
        <Button className={styles.card_button} onClick={addToCart}>
          {isItemAdded()
            ?
            <span>Product is in your cart <i className="fa-solid fa-check"/></span>
            :
            <span>Add to cart <i className="fa-solid fa-cart-arrow-down cart"/></span>}
        </Button>
      </Card.Body>
    </Card>
  )
}

export default ProductPage