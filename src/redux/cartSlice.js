import { createSlice } from '@reduxjs/toolkit'

export const cartSlice = createSlice({

  name: 'cart',
  initialState: {
    cartItems: [],
    showCart: false
  },
  reducers: {
    setItem: (state, action) => {
      state.cartItems = [...state.cartItems, action.payload]
    },
    setShowCart: (state, action) => {
      state.showCart = action.payload
    }
  },
})

export const { setItem, setShowCart } = cartSlice.actions

export const getShowCart = (state) => state.cart.showCart
export const getCartItems = (state) => state.cart.cartItems

export default cartSlice.reducer