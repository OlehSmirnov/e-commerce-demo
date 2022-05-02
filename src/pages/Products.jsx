import React, {useEffect, useState} from 'react'
import Row from "react-bootstrap/Row"

import ProductCard from '../components/product-card/ProductCard'
import sortItems from "../utils/sortItems"
import {Navbar, Spinner, Button} from "react-bootstrap"
import {
  FILTER_ALL,
  SORT_BEST_RATING,
  SORT_CHEAPEST,
  SORT_MOST_POPULAR,
  SORT_PRICIEST,
  SMALL_SCREEN_MAX_WIDTH
} from "../constants"

const Products = () => {

  const [products, setProducts] = useState()
  const [sortBy, setSortBy] = useState(SORT_MOST_POPULAR)
  const [filterBy, setFilterBy] = useState(FILTER_ALL)
  const [categories, setCategories] = useState([])
  const [activeGridButtonIndex, setActiveGridButtonIndex] = useState(0)
  const [errorFetching, setErrorFetching] = useState(false)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('https://fakestoreapi.com/products')
        const products = await res.json()
        setProducts(products)
        fillCategories(products)
      } catch (error) {
        setErrorFetching(true)
        console.error("Error in Products: " + error)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const listener = () => setWindowWidth(window.innerWidth)
    window.addEventListener("resize", listener)
    return () => window.removeEventListener("resize", listener)
  }, [])

  const fillCategories = (products) => {
    const arr = []
    products.forEach(product => {
      if (!arr.includes(product.category)) {
        arr.push(product.category)
      }
    })
    setCategories(arr)
  }

  const handleSort = (e) => {
    setSortBy(e.target.value)
  }

  const handleFilter = (e) => {
    setFilterBy(e.target.value)
  }

  if (errorFetching) return <div className="d-flex justify-content-center">
    <h2>There was an error connecting to server, please try again later!</h2>
  </div>

  if (!products) return <div className="d-flex justify-content-center">
    <Spinner animation="grow"/>
  </div>

  return (
    <>
      <Navbar className="sticky-top d-flex p-1 gap-3 justify-content-end"
              style={{top: "48px", backgroundColor: "#fcfcfc"}}>
        <select className="form-select-sm" onChange={handleFilter} defaultValue={FILTER_ALL} title="Filter by">
          <option value={FILTER_ALL}>{FILTER_ALL}</option>
          {categories.map(category => {
            return <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          })}
        </select>
        <select className="form-select-sm" onChange={handleSort} defaultValue={SORT_MOST_POPULAR} title="Sort by">
          <option value={SORT_MOST_POPULAR}>{SORT_MOST_POPULAR}</option>
          <option value={SORT_BEST_RATING}>{SORT_BEST_RATING}</option>
          <option value={SORT_CHEAPEST}>{SORT_CHEAPEST}</option>
          <option value={SORT_PRICIEST}>{SORT_PRICIEST}</option>
        </select>
        {windowWidth > SMALL_SCREEN_MAX_WIDTH && <div>
          <Button
            className="border"
            onClick={() => setActiveGridButtonIndex(0)}
            variant={activeGridButtonIndex === 0 ? "primary" : ""}
            style={{border: "1px solid #f8f8f8"}}>
            <i className="bi-grid-fill"
               style={{color: activeGridButtonIndex === 0 ? "white" : "black"}}/>
          </Button>
          <Button
            className="border"
            onClick={() => setActiveGridButtonIndex(1)}
            variant={activeGridButtonIndex === 1 ? "primary" : ""}>
            <i className="bi bi-grid-3x3-gap-fill"
               style={{color: activeGridButtonIndex === 1 ? "white" : "black"}}/>
          </Button>
        </div>}
      </Navbar>
      <Row xs={2}
           sm={activeGridButtonIndex === 0 ? 3 : 4}
           lg={activeGridButtonIndex === 0 ? 5 : 6}
           className="row g-0">
        {products.sort(sortItems(sortBy))
          .filter(product => product.category === filterBy || filterBy === FILTER_ALL)
          .map(product => {
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