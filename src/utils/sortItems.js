import {BEST_RATING, CHEAPEST, MOST_POPULAR, PRICIEST} from "../constants"

const sortItems = (sortBy) => {
  return (a, b) => {
    switch (sortBy) {
      case CHEAPEST :
        if (a.price > b.price) {
          return 1
        }
        return -1
      case PRICIEST :
        if (a.price > b.price) {
          return -1
        }
        return 1
      case BEST_RATING :
        if (a.rating.rate > b.rating.rate) {
          return -1
        }
        return 1
      case MOST_POPULAR :
        if (a.rating.count > b.rating.count) {
          return -1
        }
        return 1
    }
  }
}

export default sortItems