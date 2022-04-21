import Navigation from "./components/navigation/Navigation"
import Products from './components/products/Products'
import {AppProvider} from "./context/Context";


function App() {
  return (
    <AppProvider>
      <Navigation/>
      <Products/>
    </AppProvider>
  )
}

export default App
