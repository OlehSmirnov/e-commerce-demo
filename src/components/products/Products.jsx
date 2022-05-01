import React, {useEffect, useState} from 'react'
import Row from "react-bootstrap/Row"
import {useSelector} from "react-redux"

import ProductCard from '../product-card/ProductCard'
import {getSortBy} from "../../redux/cartSlice"
import sortItems from "../../utils/sortItems"
import {Spinner} from "react-bootstrap"

const Products = () => {

  const [products, setProducts] = useState()
  const sortBy = useSelector(getSortBy)
  console.log("Sort by: " + sortBy)

  useEffect( () => {
    const fetchData = async () => {
      try {
        const res = await fetch('https://fakestoreapi.com/products')
        const products = await res.json()
        setProducts(products)
      } catch (error) {
        console.error(error)
      }
    }
    fetchData()
  }, [])

  if (!products) return <div className="d-flex justify-content-center">
    <Spinner animation="grow"/>
  </div>

  return (
    <>
      <Row xs={2} sm={3} lg={5} className="row g-0">
        {products.sort(sortItems(sortBy)).map(product => {
          return <ProductCard
            key={product.id}
            id={product.id}
            image={product.image}
            rating={product.rating}
            price={product.price}
            title={product.title}
          />
        })}
      </Row>
    </>
  )
}

export default Products