import React from "react"
import ProductCard from "../product-card/ProductCard"
import Row from "react-bootstrap/Row"
import {useSelector} from "react-redux"
import {getFavorites} from "../../redux/appSlice"

const Favorites = () => {

  const favorites = useSelector(getFavorites)

  return (
    <>
      <hr/>
      {favorites
        ?
        <>
          <h3>Список обраних товарів:</h3>
          <Row xs={2} sm={3} lg={5} className="row g-0">
            {favorites.map(product => {
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
        :
        <h3>Список обраних товарів пустий!</h3>
      }
    </>
  )
}
export default Favorites