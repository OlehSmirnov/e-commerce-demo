import React, {useState} from "react"
import sortItems from "../../utils/sortItems"
import {CART, FILTER_ALL, SORT_MOST_POPULAR} from "../../constants"
import ProductCard from "../product-card/ProductCard"
import Row from "react-bootstrap/Row"
import TopPanel from "../top-panel/TopPanel";
import {useSelector} from "react-redux";
import {getCartItems} from "../../redux/appSlice";
import auth, {database} from "../../firebase/firebase";
import {ref, onValue} from "firebase/database";

const Favorites = () => {

  const products = useSelector(getCartItems)
  const [sortBy, setSortBy] = useState(SORT_MOST_POPULAR)
  const [filterBy, setFilterBy] = useState(FILTER_ALL)
  const [categories, setCategories] = useState([])
  const [activeGridButtonIndex, setActiveGridButtonIndex] = useState(0)


  return (
    <>
      <TopPanel categories={categories}
                activeGridButtonIndex={activeGridButtonIndex}
                setSortBy={(value) => setSortBy(value)}
                setActiveGridButtonIndex={(index) => setActiveGridButtonIndex(index)}
                setFilterBy={(value) => setFilterBy(value)}
      />
      <Row xs={2} sm={3} lg={5} className="row g-0">
        {/*{products.sort(sortItems(sortBy))*/}
        {/*  .filter(product => product.category === filterBy || filterBy === FILTER_ALL)*/}
        {/*  .map(product => {*/}
        {/*    return <ProductCard*/}
        {/*      key={product.id}*/}
        {/*      id={product.id}*/}
        {/*      image={product.image}*/}
        {/*      rating={product.rating}*/}
        {/*      price={product.price}*/}
        {/*      title={product.title}*/}
        {/*    />*/}
        {/*  })}*/}
        {products.map(product => {
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

export default Favorites