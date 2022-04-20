import React, {useEffect, useState} from 'react';
import Button from 'react-bootstrap/Button';
import Row from "react-bootstrap/Row";

import ProductCard from '../product-card/ProductCard';

const Products = () => {
  const [productsJSON, setProductsJSON] = useState(() => JSON.parse(localStorage.getItem('PRODUCTS')) || [])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (productsJSON.length === 0) {
      const fetchData = async () => {
        try {
          setLoading(true)
          const res = await fetch('https://fakestoreapi.com/products')
          const json = await res.json()
          setProductsJSON(json)
          localStorage.setItem('PRODUCTS', JSON.stringify(json))
          setLoading(false)
        } catch (error) {
          console.error(error)
        }
      }
      fetchData()
    }
  }, [])

  const products = productsJSON.map(product => {
    return <ProductCard
      image={product.image}
      price={product.price}
      description={product.description}
      title={product.title}
    />
  })

  if (loading) return <h2>Loading products...</h2>

  return (
    <Row xs={2} sm={3} lg={5} className="row g-0">
      {products}
    </Row>
  );
};

export default Products;