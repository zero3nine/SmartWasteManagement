import { useNavigate } from "react-router-dom";
import "../styles/navbar.css";

function Navbar() {
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    window.location.reload();
  };

  const handleLogoClick = () => {
    if (!role || role === "resident") {
      navigate("/"); 
    } else if (role === "collector") {
      navigate("/collector-home");
    } else if (role === "admin") {
      navigate("/admin-home");
    } else {
      navigate("/"); // fallback
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span onClick={handleLogoClick} className="navbar-logo" style={{ cursor: "pointer" }}>
          CleanNet
        </span>
      </div>
      <div className="navbar-right">
        {username ? (
          <>
            <span className="navbar-user">Hello, {username}!</span>
            <button className="btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button className="btn" onClick={() => navigate("/register")}>
              Register
            </button>
            <button className="btn" onClick={() => navigate("/login")}>
              Login
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
