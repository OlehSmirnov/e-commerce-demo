const sortItems = (sortBy) => {
  return (a, b) => {
    switch (sortBy) {
      case "cheapest" :
        if (a.price > b.price) {
          return 1
        }
        return -1
      case "priciest" :
        if (a.price > b.price) {
          return -1
        }
        return 1
      case "best_rating" :
        if (a.rating.rate > b.rating.rate) {
          return -1
        }
        return 1
      case "most_popular" :
        if (a.rating.count > b.rating.count) {
          return -1
        }
        return 1
    }
  }
}

export default sortItems