import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider, useAuth } from './context/AuthContext'

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
import CartBar from './components/CartBar'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, isGuest, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-page-light dark:bg-page-dark"><p>Loading...</p></div>
  }

  if (!session && !isGuest) {
    return <Navigate to="/welcome" state={{ from: location.pathname }} replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="app-shell">
          <Routes>
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/" element={<AuthGuard><Home /></AuthGuard>} />
            <Route path="/item/:id" element={<AuthGuard><ItemDetail /></AuthGuard>} />
            <Route path="/cart" element={<AuthGuard><Cart /></AuthGuard>} />
            <Route path="/checkout" element={<AuthGuard><Checkout /></AuthGuard>} />
            <Route path="/order/:id" element={<AuthGuard><OrderConfirmation /></AuthGuard>} />
            <Route path="/orders" element={<AuthGuard><MyOrders /></AuthGuard>} />
            <Route path="/offers" element={<AuthGuard><Offers /></AuthGuard>} />
            <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
            <Route path="/admin/menu" element={<AuthGuard><AdminMenu /></AuthGuard>} />
            <Route path="/admin/menu/:id" element={<AuthGuard><AdminEditItem /></AuthGuard>} />
            <Route path="/admin/orders" element={<AuthGuard><AdminOrders /></AuthGuard>} />
            <Route path="/admin/settings" element={<AuthGuard><Settings /></AuthGuard>} />
            <Route path="/profile/addresses" element={<AuthGuard><SavedAddresses /></AuthGuard>} />
            <Route path="/profile/favourites" element={<AuthGuard><Favourites /></AuthGuard>} />
          </Routes>
          <CartBar />
          <InstallPrompt />
        </div>
      </CartProvider>
    </AuthProvider>
  )
}
