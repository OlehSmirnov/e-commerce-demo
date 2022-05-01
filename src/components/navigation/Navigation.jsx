import React from "react"
import Navbar from "react-bootstrap/Navbar"
import {useDispatch} from "react-redux"

import Cart from "../cart/Cart"
import {Link} from "react-router-dom"
import {setSortBy} from "../../redux/cartSlice"
import {CHEAPEST, MOST_POPULAR, PRICIEST, BEST_RATING} from "../../constants"

const Navigation = () => {

  const dispatch = useDispatch()

  const handleChange = (e) => {
    dispatch(setSortBy(e.target.value))
  }

  return (
    <>
      <Navbar className="p-1 sticky-top" bg="light">
        <Navbar.Brand>
          <Link to="/">Oleh's shop</Link>
        </Navbar.Brand>
        <div className="ms-auto">
          <select className="form-select-sm me-3" onChange={handleChange} defaultValue={MOST_POPULAR}>
            <option value={MOST_POPULAR}>Most popular</option>
            <option value={BEST_RATING}>Best rating</option>
            <option value={CHEAPEST}>Cheapest</option>
            <option value={PRICIEST}>Priciest</option>
          </select>
          <Cart/>
        </div>
      </Navbar>
    </>
  )
}

export default Navigation