import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { loginUser } from "../helper/apicalls/auth";
import intellectLogo from "../assets/png/intellectBrownLogo.png";
import "../styles/loginPage.scss";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser(email, password);
      
      // Store token and user info in cookies
      if (data.token) {
        Cookies.set("token", data.token, { expires: 7, secure: true, sameSite: 'strict' });
      }
      if (data.user) {
        Cookies.set("user", JSON.stringify(data.user), { expires: 7, secure: true, sameSite: 'strict' });
      }

      // Redirect to home or intended page
      navigate("/");
    } catch (err) {
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src={intellectLogo} alt="Intellect Logo" className="login-logo" />
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Please enter your details to sign in.</p>

        {error && <div className="error-message">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
