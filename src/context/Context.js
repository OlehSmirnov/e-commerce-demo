import React, {useState} from "react"

const AppContext = React.createContext(null)

const AppProvider = ({children}) => {

  const [cartItems, setCartItems] = useState([])
  const [showCart, setShowCart] = useState(false)

  return (
    <AppContext.Provider
      value={
      {
        cartItems,
        setCartItems,
        setShowCart,
        showCart
      }
    }
    >
      {children}
    </AppContext.Provider>
  )
}

export { AppContext, AppProvider }