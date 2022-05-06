import React, {useEffect, useState} from "react"
import ProductCard from "../components/product-card/ProductCard"
import sortItems from "../utils/sortItems"
import {Spinner, Row} from "react-bootstrap"
import {FILTER_ALL, SORT_MOST_POPULAR} from "../constants"
import TopPanel from "../components/top-panel/TopPanel"

const Products = () => {

  const [products, setProducts] = useState()
  const [sortBy, setSortBy] = useState(SORT_MOST_POPULAR)
  const [filterBy, setFilterBy] = useState(FILTER_ALL)
  const [categories, setCategories] = useState([])
  const [activeGridButtonIndex, setActiveGridButtonIndex] = useState(0)
  const [errorFetching, setErrorFetching] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://fakestoreapi.com/products")
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

  const fillCategories = (products) => {
    const arr = []
    products.forEach(product => {
      if (!arr.includes(product.category)) {
        arr.push(product.category)
      }
    })
    setCategories(arr)
  }

  if (errorFetching) return <div className="d-flex justify-content-center">
    <h2>There was an error connecting to server, please try again later!</h2>
  </div>

  if (!products) return <div className="d-flex justify-content-center">
    <Spinner animation="grow"/>
  </div>

  return (
    <>
      <TopPanel categories={categories}
                activeGridButtonIndex={activeGridButtonIndex}
                setActiveGridButtonIndex={(index) => setActiveGridButtonIndex(index)}
                setSortBy={(value) => setSortBy(value)}
                setFilterBy={(value) => setFilterBy(value)}
      />
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