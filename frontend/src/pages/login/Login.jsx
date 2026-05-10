import React, { useState, useEffect } from "react";
import axios from '../../api/axios';
import "../../css/LoginPage.css"; // đổi tên file CSS
import { useAlert } from "../../context/AlertContext";
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [errorMessage, setErrorMessage] = useState("");
  const { showAlert } = useAlert();

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow || "auto";
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    localStorage.removeItem("user");
    localStorage.removeItem("khach");
    setErrorMessage("");
    try {
      let res;
      if (role === "admin") {
        res = await axios.post("/api/admin/taikhoan/login", {
          userName: username,
          passWord: password,
          role: "Quản lý",
        });
        if (res.data.success) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
          showAlert({
            type: "success",
            title: "Đăng nhập quản lý thành công!",
            message: "Đang chuyển về trang chủ...",
            autoCloseMs: 1200,
          });
          setTimeout(() => {
            window.location.href = "/";
          }, 1200);
        } else {
          setErrorMessage("Sai tên đăng nhập hoặc mật khẩu");
        }
      } else {
        res = await axios.post(
          "/api/admin/taikhoan/loginKhachHang",
          {
            userName: username,
            passWord: password,
          }
        );
        if (res.data.success) {
          localStorage.setItem("khach", JSON.stringify(res.data.user));
          console.log("🔹 Parsed object:", JSON.parse(localStorage.getItem("khach")));
          showAlert({
            type: "success",
            title: "Đăng nhập khách hàng thành công!",
            message: "Đang chuyển về trang chủ...",
            autoCloseMs: 1200,
          });
          setTimeout(() => {
            window.location.href = "/";
          }, 1200);
        } else {
          setErrorMessage(res.data.message || "Sai tên đăng nhập hoặc mật khẩu");
        }
      }
    } catch (err) {
      console.error("Lỗi khi đăng nhập:", err);
      const serverMessage = err?.response?.data?.message;
      const isNetworkError =
        err?.code === "ERR_NETWORK" || err?.message === "Network Error";
      setErrorMessage(
        serverMessage ||
          (isNetworkError
            ? "Không thể kết nối server, thử lại sau"
            : "Đăng nhập thất bại, thử lại sau")
      );
    }
  };

  const inputClass = (value) =>
    errorMessage && !value ? "input-error" : errorMessage ? "input-error" : "";

  return (
    <div
      className={`login-bg ${
        role === "admin"
          ? "login-admin-mode"
          : "login-customer-mode"
      }`}
    >
      <div className="login-pickleball-ball"></div>
      <div className="login-card animate-pop">
        <div className="login-header">
          <img
            src="https://cdn-icons-png.flaticon.com/512/7067/7067361.png"
            alt="Pickleball Logo"
            className="login-logo"
          />
          <h2>Alpha Pickleball</h2>
          <p>
            {role === "customer"
              ? "Đăng nhập để cùng ra sân!"
              : "Xin chào Admin!"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-role-selector">
            <span
              className={
                role === "customer" ? "login-role active" : "login-role"
              }
              onClick={() => setRole("customer")}
            >
              Khách hàng
            </span>
            <span
              className={
                role === "admin" ? "login-role active" : "login-role"
              }
              onClick={() => setRole("admin")}
            >
              Admin
            </span>
          </div>

          <input
            type="text"
            placeholder="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className={inputClass(username)}
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={inputClass(password)}
          />
          {errorMessage && <div className="error-text">{errorMessage}</div>}
          <button type="submit">
            {role === "admin"
              ? "Đăng nhập Admin"
              : "Đăng nhập khách hàng"}
          </button>
        </form>

        <div className="login-footer">
          {role === "customer" && <a href="/register">Đăng ký</a>}
          {role === "customer" && <span>|</span>}
          <a href="/forgot-password">Quên mật khẩu?</a>
        </div>
      </div>

    </div>
  );
}
