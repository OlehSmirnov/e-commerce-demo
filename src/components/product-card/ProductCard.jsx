import React, {useEffect, useState} from "react"
import Card from "react-bootstrap/Card"
import Col from "react-bootstrap/Col"
import Button from "react-bootstrap/Button"
import {Link, useNavigate} from "react-router-dom"
import {useDispatch, useSelector} from "react-redux"
import {onValue, ref} from "firebase/database"

import styles from "../../styles/product-card/product_card.module.css"
import {getCartItems, addCartItem, setShowCart, getFavorites, setFavorites} from "../../redux/appSlice"
import auth, {database, updateFavorites} from "../../firebase/firebase"

const ProductCard = ({id, image, title, price, rating}) => {

  const dispatch = useDispatch()
  const cartItems = useSelector(getCartItems)
  const favorites = useSelector(getFavorites)
  const navigate = useNavigate()
  const [isFavorite, setIsFavorite] = useState(false)
  const [databaseIndex, setDatabaseIndex] = useState()

  const addToCart = () => {
    if (isItemAddedToCart()) {
      dispatch(setShowCart(true))
    } else {
      dispatch(addCartItem({count: 1, id, title, price, image}))
    }
  }

  useEffect(() => {
    const listen = () => {
      if (auth.currentUser) {
        const userRef = ref(database, 'users/' + auth.currentUser.uid)
        onValue(userRef, (snapshot) => {
          const favorites = snapshot.val().favorites
          dispatch(setFavorites(favorites))
          isItemFavorite(favorites)
        })
      }
    }
    listen()
  }, [])

  const handleFavorite = () => {
    if (auth.currentUser) {
      if (!favorites) {
        updateFavorites([{id, title, image, price, rating}])
      } else {
        if (isFavorite) {
          const splicedArray = [...favorites]
          splicedArray.splice(databaseIndex, 1)
          updateFavorites(splicedArray)
        } else
          updateFavorites([...favorites, {id, title, image, price, rating}])
      }
    } else {
      navigate("/login")
    }
  }

  const isItemAddedToCart = () => cartItems.filter(item => item.id == id).length !== 0

  const isItemFavorite = (favorites) => {
    if (favorites) {
      for (const [index, item] of Object.entries(favorites)) {
        if (item.id === id) {
          setIsFavorite(true)
          setDatabaseIndex(index)
          return
        }
      }
    }
    setIsFavorite(false)
  }

  return (
    <Col>
      <Card className={styles.card}>
        <Link to={`/products/${id}`}>
          <div className={styles.image_container}>
            <Card.Img className={styles.image} variant="top" src={image}/>
          </div>
        </Link>
        <Card.Body className={styles.card_body}>
          <Card.Text className={styles.title}>
            <Link to={`/products/${id}`}>{title}</Link>
          </Card.Text>
          <Button className={styles.card_favorite} onClick={handleFavorite}>
            {isFavorite
              ?
              <i className="fa-solid fa-heart"/>
              :
              <i className="fa-regular fa-heart"/>
            }
          </Button>
          <span className={styles.span}><i className="fa-solid fa-star"/>{rating.rate} ({rating.count})</span>
          <Card.Subtitle className={styles.card_subtitle}>${price}
            <Button onClick={addToCart}>
              {isItemAddedToCart()
                ?
                <i className="fa-solid fa-check"/>
                :
                <i className="fa-solid fa-cart-arrow-down cart"/>}
            </Button>
          </Card.Subtitle>
        </Card.Body>
      </Card>
    </Col>
  )
}

export default ProductCard