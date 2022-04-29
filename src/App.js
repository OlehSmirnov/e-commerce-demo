import React from "react"
import Navigation from "./components/navigation/Navigation"
import Products from "./components/products/Products"
import {BrowserRouter, Route, Routes} from "react-router-dom"

import StripeCancel from "./pages/StripeCancel"
import StripeSuccess from "./pages/StripeSuccess"
import NotFound from "./pages/NotFound"
import ProductPage from "./pages/ProductPage"

function App() {
  return (
    <>
      <BrowserRouter>
        <Navigation/>
        <Routes>
          <Route path="*" element={<NotFound/>}/>
          <Route path="/" element={<Products/>}/>
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
