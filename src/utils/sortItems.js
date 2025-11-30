import {SORT_BEST_RATING, SORT_CHEAPEST, SORT_MOST_POPULAR, SORT_PRICIEST} from "../constants"

const sortItems = (sortBy) => {
  return (a, b) => {
    switch (sortBy) {
      case SORT_CHEAPEST :
        if (a.price > b.price) {
          return 1
        }
        return -1
      case SORT_PRICIEST :
        if (a.price > b.price) {
          return -1
        }
        return 1
      case SORT_BEST_RATING :
        if (a.rating.rate > b.rating.rate) {
          return -1
        }
        return 1
      case SORT_MOST_POPULAR :
        if (a.rating.count > b.rating.count) {
          return -1
        }
        return 1
    }
  }
}

export default sortItems