
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import Layout from './root/Layout'
import Products from './page/Products'
import  Home from './page/HomePage'
import ProductDetails from './page/ProductDetails'
import PriceTrend from './page/PriceTrend'
import Login from './page/Login'
import Register from './page/Register'
import Alerts from './page/Alert'
import { Toaster } from 'react-hot-toast'
import AddProduct from './page/AddProduct'
import AddPrice from './page/AddPrice'
import NotFound from './page/NotFound'
import AddMarket from './page/AddMarket'
import  Markets from './page/Market'
import MarketDetails from './page/MarketPrice'


function App() {
const router = createBrowserRouter(createRoutesFromElements(
  <Route path='/' element={<Layout/>}>
    <Route index element={<Home/>}/>
    <Route path="/login" element={<Login />} />
    <Route path='/register' element={<Register />} />
    <Route path='/products' element={<Products/>}/>
    <Route path='/products/:id' element={<ProductDetails/>}/>
    <Route path='/trends' element={<PriceTrend/>}/>
    <Route path='/alerts' element={<Alerts/>} />
    <Route path='/add-product' element={<AddProduct />} />
    <Route path='/add-price' element={<AddPrice />} />
    <Route path='*' element={<NotFound />} />
    <Route path="/markets" element={<Markets/>} />
    <Route path="/markets/:id/prices" element={<MarketDetails/>} />
    <Route path="/add-market" element={<AddMarket/>} />
  </Route>
))

  return (
   <>
   <Toaster/>
    <RouterProvider router={router}/>
    </>
  )
}

export default App
