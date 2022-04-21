import React, {useEffect, useState} from 'react'
import Row from "react-bootstrap/Row"

import ProductCard from '../product-card/ProductCard'

const Products = () => {

  const [productsJSON, setProductsJSON] = useState([])

  useEffect(() => {
    if (productsJSON.length === 0) {
      const fetchData = async () => {
        try {
          const res = await fetch('https://fakestoreapi.com/products')
          const json = await res.json()
          setProductsJSON(json)
        } catch (error) {
          console.error(error)
        }
      }
      fetchData()
    }
  }, [])

  const products = productsJSON.map((product, index) => {
    return <ProductCard
      key={index}
      image={product.image}
      price={product.price}
      description={product.description}
      title={product.title}
    />
  })

  return (
    <Row xs={2} sm={3} lg={5} className="row g-0">
      {products}
    </Row>
  );
};

export default Products;