import { useState } from "react"; //not using currently; refreshing page for login msg - doesnt seem worth it to change considering user doesnt login all that frequently anyway
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import Button from "../components/Button";
import "../styles/auth.css";

function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);
      localStorage.setItem("userId", data.userId);
      if (data.role === "resident") {
        window.location.href = "/";
      } else if (data.role === "collector") {
        window.location.href = "/collector-home";
      } else if (data.role === "admin") {
        window.location.href = "/admin-home";
      } else {
        window.location.href = "/";
      }
      
      
    } else {
      setMessage(data.message || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Welcome!</h1>
        <form onSubmit={handleSubmit}>
          <InputField
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
          />
          <InputField
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
          <Button type="submit">Log In</Button>
        </form>
        {message && <p className="error-message">{message}</p>}
      </div>
    </div>
  );
}

export default LoginPage;
