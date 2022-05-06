import {createSlice} from "@reduxjs/toolkit"
import {CART, FAVORITES} from "../constants"

export const appSlice = createSlice({

  name: "app",
  initialState: {
    cartItems: JSON.parse(localStorage.getItem(CART)) || [],
    showCart: false,
    showRedirect: false
  },
  reducers: {
    addCartItem: (state, action) => {
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
    setFilterBy: (state, action) => {
      state.filterBy = action.payload
    },
    setShowRedirect: (state, action) => {
      state.showRedirect = action.payload
    }
  }
})

export const {addCartItem, setShowCart, updateItem, setShowRedirect} = appSlice.actions

export const getShowCart = (state) => state.app.showCart
export const getCartItems = (state) => state.app.cartItems
export const getShowRedirect = (state) => state.app.showRedirect

export default appSlice.reducer