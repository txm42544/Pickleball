import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../config/api";
import { Link } from "react-router-dom";
import "../../css/Register.css";
import { useAlert } from "../../context/AlertContext";

export default function Register() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [passWord, setPassWord] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sdt, setSDT] = useState("");
const [tenKh, setTenKh] = useState("");
  const [errors, setErrors] = useState({});
  const { showAlert } = useAlert();

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow || "auto";
    };
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!userName) newErrors.userName = "Vui lòng nhập tên đăng nhập";
    if (!tenKh) newErrors.tenKh = "Vui lòng nhập họ và tên";

    const emailRegex = /^[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}$/;
    if (!email) newErrors.email = "Vui lòng nhập email";
    else if (!emailRegex.test(email)) newErrors.email = "Email không đúng định dạng";

    if (!passWord) newErrors.passWord = "Vui lòng nhập mật khẩu";
    if (!confirmPassword) newErrors.confirmPassword = "Vui lòng nhập lại mật khẩu";
    if (passWord && confirmPassword && passWord !== confirmPassword) newErrors.confirmPassword = "Mật khẩu nhập lại không khớp";

    const phoneRegex = /^[0-9]{9,12}$/;
    if (!sdt) newErrors.sdt = "Vui lòng nhập số điện thoại";
    else if (!phoneRegex.test(sdt)) newErrors.sdt = "Số điện thoại không hợp lệ";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      const res = await axios.post("/api/admin/taikhoan/registerKhachHang", {
        userName,
        passWord,
        email,
        sdt,
        tenKh
      });

      showAlert({
        type: res.data.success ? "success" : "info",
        title: res.data.success ? "Đăng ký thành công" : "Thông báo",
        message: res.data.message || "Đã xử lý đăng ký",
        autoCloseMs: 1500,
      });
      setErrors({});
      if (res.data.success) {
        setTimeout(() => {
          window.location.href = "/login";
        }, 1200);
      }
    } catch (err) {
      console.error("❌ Lỗi khi đăng ký:", err);
      const message = "Lỗi kết nối server!";
      setErrors({ general: message });
    }
  };

  const inputClass = (field) => (errors[field] ? "input-error" : "");

  return (
    <div className="register-container">
      <div className="register-box animate-pop">
        <h2>Đăng ký tài khoản</h2>
        <form onSubmit={handleRegister} noValidate>
          <input
            type="text"
            placeholder="Tên đăng nhập"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className={inputClass("userName")}
          />
          {errors.userName && <div className="field-error">{errors.userName}</div>}
          <input
            type="text"
            placeholder="Họ và tên"
            value={tenKh}
            onChange={(e) => setTenKh(e.target.value)}
            className={inputClass("tenKh")}
          />
          {errors.tenKh && <div className="field-error">{errors.tenKh}</div>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass("email")}
          />
          {errors.email && <div className="field-error">{errors.email}</div>}
          <input
            type="password"
            placeholder="Mật khẩu"
            value={passWord}
            onChange={(e) => setPassWord(e.target.value)}
            className={inputClass("passWord")}
          />
          {errors.passWord && <div className="field-error">{errors.passWord}</div>}
          <input
            type="password"
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass("confirmPassword")}
          />
          {errors.confirmPassword && <div className="field-error">{errors.confirmPassword}</div>}
          <input
            type="text"
            placeholder="Số điện thoại"
            value={sdt}
            onChange={(e) => setSDT(e.target.value)}
            className={inputClass("sdt")}
          />
          {errors.sdt && <div className="field-error">{errors.sdt}</div>}

          <button type="submit">Đăng ký</button>
          {errors.general && <div className="field-error">{errors.general}</div>}
        </form>

      </div>
    </div>
  );
}
