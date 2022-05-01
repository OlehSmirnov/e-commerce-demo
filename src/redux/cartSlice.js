import {createSlice} from "@reduxjs/toolkit"
import {CART, MOST_POPULAR} from "../constants"

export const cartSlice = createSlice({

  name: "cart",
  initialState: {
    cartItems: JSON.parse(localStorage.getItem(CART)) || [],
    showCart: false,
    sortBy: MOST_POPULAR,
    showRedirect: false
  },
  reducers: {
    setItem: (state, action) => {
      state.cartItems = [...state.cartItems, action.payload]
    },
    updateItem: (state, action) => {
      const {index, item, type} = action.payload
      switch (type) {
        case "INCREASE" :
          state.cartItems[index] = {...item, count: item.count + 1}
          break
        case "DECREASE" :
          if (state.cartItems[index].count !== 1)
            state.cartItems[index] = {...item, count: item.count - 1}
          break
        case "DELETE" :
          state.cartItems = state.cartItems.filter((item, currentIndex) => currentIndex !== index)
          break
        default :
          throw new Error("Error in update item!")
      }
    },
    setShowCart: (state, action) => {
      state.showCart = action.payload
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload
    },
    setShowRedirect: (state, action) => {
      state.showRedirect = action.payload
    }
  }
})

export const {setItem, setShowCart, setSortBy, updateItem, setShowRedirect} = cartSlice.actions

export const getShowCart = (state) => state.cart.showCart
export const getCartItems = (state) => state.cart.cartItems
export const getSortBy = (state) => state.cart.sortBy
export const getShowRedirect = (state) => state.cart.showRedirect

export default cartSlice.reducer