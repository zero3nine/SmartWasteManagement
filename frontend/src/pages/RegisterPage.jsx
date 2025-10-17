import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import Button from "../components/Button";
import "../styles/auth.css";

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "resident", // default role
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();

    if (data.message) {
      // registration success
      alert("Registered successfully!");
      navigate("/login");
    } else {
      setMessage(data.error || "Registration failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Create Account</h1>
        <form onSubmit={handleSubmit}>
          <InputField
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
          />
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

          {/* Role Selector */}
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="select-field"
          >
            <option value="resident">Resident</option>
            <option value="collector">Collector</option>
            <option value="admin">Admin</option>
          </select>

          <Button type="submit">Register</Button>
        </form>
        {message && <p className="error-message">{message}</p>}
      </div>
    </div>
  );
}

export default RegisterPage;
