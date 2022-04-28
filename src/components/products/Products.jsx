import React, {useEffect, useState} from 'react'
import Row from "react-bootstrap/Row"

import ProductCard from '../product-card/ProductCard'
import {useDispatch, useSelector} from "react-redux";
import {getLoading, getSortBy, setLoading} from "../../redux/cartSlice";
import styles from "./Products.module.css"

const Products = () => {

  const [productsJSON, setProductsJSON] = useState([])
  const sortBy = useSelector(getSortBy)
  const loading = useSelector(getLoading)
  const dispatch = useDispatch()

  const sortItems = (a, b) => {
    if (sortBy === "cheapest") {
      if (a.price > b.price) {
        return 1
      }
      return -1
    }
    if (sortBy === "priciest") {
      if (a.price > b.price) {
        return -1
      }
      return 1
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(setLoading(true))
        const res = await fetch('https://fakestoreapi.com/products')
        const json = await res.json()
        setProductsJSON(json)
        dispatch(setLoading(false))
      } catch (error) {
        console.error(error)
      }
    }
    fetchData()
  }, [])

  if (loading) return <h2 className={styles.loading}>Loading items...</h2>

  return (
    <Row xs={2} sm={3} lg={5} className="row g-0">
      {productsJSON.sort(sortItems).map(product => {
        return <ProductCard
          key={product.id}
          id={product.id}
          image={product.image}
          price={product.price}
          description={product.description}
          title={product.title}
        />
      })}
    </Row>
  );
};

export default Products;