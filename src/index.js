import React from "react"
import ReactDOM from "react-dom/client"
import {Provider} from "react-redux"
import {BrowserRouter, Routes, Route} from "react-router-dom"

import store from "./redux/store"
import "./index.css"
import App from "./App"
import StripeCancel from "./pages/StripeCancel"
import StripeSuccess from "./pages/StripeSuccess"
import NotFound from "./pages/NotFound"

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App/>}/>
        <Route path="stripe-cancel" element={<StripeCancel/>}/>
        <Route path="stripe-success" element={<StripeSuccess/>}/>
        <Route path="*" element={<NotFound/>}/>
      </Routes>
    </BrowserRouter>
  </Provider>
)
