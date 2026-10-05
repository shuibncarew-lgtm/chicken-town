import { Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import ItemDetail from './pages/ItemDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import MyOrders from './pages/MyOrders'
import Offers from './pages/Offers'
import Profile from './pages/Profile'
import AdminMenu from './pages/AdminMenu'
import AdminEditItem from './pages/AdminEditItem'
import AdminOrders from './pages/AdminOrders'
import Settings from './pages/Settings'
import SavedAddresses from './pages/SavedAddresses'
import Favourites from './pages/Favourites'
import Welcome from './pages/Welcome'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import InstallPrompt from './components/InstallPrompt'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="app-shell">
          <Routes>
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/" element={<Home />} />
            <Route path="/item/:id" element={<ItemDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order/:id" element={<OrderConfirmation />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin/menu" element={<AdminMenu />} />
            <Route path="/admin/menu/:id" element={<AdminEditItem />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/settings" element={<Settings />} />
            <Route path="/profile/addresses" element={<SavedAddresses />} />
            <Route path="/profile/favourites" element={<Favourites />} />
          </Routes>
          <InstallPrompt />
        </div>
      </CartProvider>
    </AuthProvider>
  )
}
