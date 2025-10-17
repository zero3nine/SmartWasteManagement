import React from "react";
import { Navigate } from "react-router-dom";

const CollectorRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    // User not logged in
    return <Navigate to="/login" />;
  }

  if (role !== "collector") {
    // User is logged in but not collector
    return <Navigate to="/" replace />;
  }

  // User is authenticated and a collector
  return children;
};

export default CollectorRoute;
