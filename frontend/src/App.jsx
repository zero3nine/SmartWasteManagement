import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import CollectorRoute from "./components/CollectorRoute";
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/AdminDashboard";
import CollectorDashboard from "./pages/CollectorDashboard";
import AddSpecialRequest from "./pages/AddSpecialRequest";
import PaymentsPage from "./pages/PaymentPage";

function App() {

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/special-request" element={<AddSpecialRequest />} />
        <Route path="/collector-home" element={<CollectorRoute><CollectorDashboard /></CollectorRoute>} />
        <Route path="/admin-home" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="*" element={<HomePage />} />
        <Route path="/pay-bill" element={<PaymentsPage />} />
      </Routes>
    </>
  );
}

export default App;

