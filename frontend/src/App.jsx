import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BuyStock from "./pages/BuyStock";
import Stock from "./pages/Stock";
import Sell from "./pages/Sell";
import PurchaseHistory from "./pages/PurchaseHistory";
import SalesHistory from "./pages/SalesHistory";
import { useAuth } from "./context/AuthContext";
import ExpiringSoon from "./pages/ExpiringSoon";
import Expired from "./pages/Expired";
import LowStock from "./pages/LowStock";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import "./App.css";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  const { user } = useAuth();

  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: { background: "#1e293b", color: "#fff", border: "1px solid #334155" },
      }} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/buy-stock" element={<ProtectedRoute><BuyStock /></ProtectedRoute>} />
        <Route path="/stock" element={<ProtectedRoute><Stock /></ProtectedRoute>} />
        <Route path="/sell" element={<ProtectedRoute><Sell /></ProtectedRoute>} />
        <Route path="/purchase-history" element={<ProtectedRoute><PurchaseHistory /></ProtectedRoute>} />
        <Route path="/sales-history" element={<ProtectedRoute><SalesHistory /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/expiring-soon" element={<ProtectedRoute><ExpiringSoon /></ProtectedRoute>} />
        <Route path="/expired" element={<ProtectedRoute><Expired /></ProtectedRoute>} />
        <Route path="/low-stock" element={<ProtectedRoute><LowStock /></ProtectedRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </>
  );
}

export default App;