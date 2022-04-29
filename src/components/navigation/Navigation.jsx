import React from "react"
import Navbar from "react-bootstrap/Navbar"
import {useDispatch} from "react-redux"

import Cart from "../cart/Cart"
import {Link} from "react-router-dom"
import {setSortBy} from "../../redux/cartSlice";

const Navigation = () => {

  const dispatch = useDispatch()

  const handleChange = (e) => {
    dispatch(setSortBy(e.target.value))
  }

  return (
    <>
      <Navbar className="p-1 sticky-top" bg="light">
        <Navbar.Brand>
          <Link to="/">Fake Shop</Link>
        </Navbar.Brand>
        <div className="ms-auto">
          <select className="form-select-sm me-3" onChange={handleChange} defaultValue="most_popular">
            <option value="most_popular">Most popular</option>
            <option value="best_rating">Best rating</option>
            <option value="cheapest">Cheapest</option>
            <option value="priciest">Priciest</option>
          </select>
          <Cart/>
        </div>
      </Navbar>
    </>
  )
}

export default Navigation