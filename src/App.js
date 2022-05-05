import React from "react"
import Navigation from "./components/navigation/Navigation"
import Products from "./pages/Products"
import {BrowserRouter, Route, Routes} from "react-router-dom"

import StripeCancel from "./pages/stripe/StripeCancel"
import StripeSuccess from "./pages/stripe/StripeSuccess"
import NotFound from "./pages/NotFound"
import ProductPage from "./pages/ProductPage"
import Login from "./pages/auth/Login"
import SignUp from "./pages/auth/SignUp"
import UserCabinet from "./pages/UserCabinet"

function App() {
  return (
    <>
      <BrowserRouter>
        <Navigation/>
        <Routes>
          <Route path="*" element={<NotFound/>}/>
          <Route path="/" element={<Products/>}/>
          <Route path="login" element={<Login/>}/>
          <Route path="signup" element={<SignUp/>}/>
          <Route path="user-cabinet" element={<UserCabinet/>}/>
          <Route path="products" element={<Products/>}/>
          <Route path="products/:id" element={<ProductPage/>}/>
          <Route path="stripe-cancel" element={<StripeCancel/>}/>
          <Route path="stripe-success" element={<StripeSuccess/>}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
