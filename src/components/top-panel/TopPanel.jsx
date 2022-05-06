import React, {useState, useEffect} from "react"
import {
  FILTER_ALL,
  SMALL_SCREEN_MAX_WIDTH,
  SORT_BEST_RATING,
  SORT_CHEAPEST,
  SORT_MOST_POPULAR,
  SORT_PRICIEST
} from "../../constants"
import {Button, Navbar} from "react-bootstrap"

const TopPanel = ({categories, activeGridButtonIndex, setActiveGridButtonIndex, setSortBy, setFilterBy}) => {

  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    const listener = () => setWindowWidth(window.innerWidth)
    window.addEventListener("resize", listener)
    return () => window.removeEventListener("resize", listener)
  }, [])

  const handleSort = (e) => {
    setSortBy(e.target.value)
  }

  const handleFilter = (e) => {
    setFilterBy(e.target.value)
  }

  return (
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
  )
}

export default TopPanel