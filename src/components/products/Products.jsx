import React, {useEffect, useState} from 'react'
import Row from "react-bootstrap/Row"

import ProductCard from '../product-card/ProductCard'
import {useDispatch, useSelector} from "react-redux";
import {getLoading, setLoading} from "../../redux/cartSlice";
import styles from "./Products.module.css"

const Products = () => {

  const [productsJSON, setProductsJSON] = useState([])
  const loading = useSelector(getLoading)
  const dispatch = useDispatch()

  useEffect(() => {
    if (productsJSON.length === 0) {
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
    }
  }, [])

  const products = productsJSON.map(product => {
    return <ProductCard
      key={product.id}
      id={product.id}
      image={product.image}
      price={product.price}
      description={product.description}
      title={product.title}
    />
  })

  if (loading) return <h2 className={styles.loading}>Loading items...</h2>

  return (
    <Row xs={2} sm={3} lg={5} className="row g-0">
      {products}
    </Row>
  );
};

export default Products;