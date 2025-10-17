import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    // User not logged in
    return <Navigate to="/login" />;
  }

  if (role !== "admin") {
    // User is logged in but not admin
    return <Navigate to="/" replace />;
  }

  // User is authenticated and an admin
  return children;
};

export default AdminRoute;
