import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAlert } from "../../context/AlertContext";
import "../../css/ForgotPassword.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { showAlert } = useAlert();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    const emailRegex = /^[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}$/;
    if (!email) nextErrors.email = "Vui lòng nhập email";
    else if (!emailRegex.test(email)) nextErrors.email = "Email không đúng định dạng";

    if (!newPassword) nextErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    if (!confirmPassword) nextErrors.confirmPassword = "Vui lòng nhập lại mật khẩu";
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      nextErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      showAlert({ type: "error", title: "Thiếu hoặc sai thông tin", message: Object.values(nextErrors)[0] });
      return;
    }

    try {
      const payload = {
        role: "Khách hàng",
        email,
        newPassword,
        confirmPassword,
      };

      const res = await axios.post(
        "/api/admin/taikhoan/forgot-password",
        payload
      );

      showAlert({
        type: res.data.success ? "success" : "error",
        title: res.data.success ? "Đổi mật khẩu thành công" : "Không thành công",
        message: res.data.message,
      });
      if (res.data.success) {
        setEmail("");
        setNewPassword("");
        setConfirmPassword("");
        setErrors({});
      }
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu:", error);
      showAlert({ type: "error", title: "Kết nối thất bại", message: "Lỗi kết nối đến server!" });
    }
  };

  return (
    <div className="login-container">
      <div className="login-box animate-pop">
        <h2>Quên mật khẩu</h2>
        <p>Áp dụng cho khách hàng. Nhập email để đặt lại mật khẩu.</p>

        <form onSubmit={handleSubmit} noValidate>
          <input
            type="email"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={errors.email ? "input-error" : ""}
          />
          {errors.email && <div className="field-error">{errors.email}</div>}

          <input
            type="password"
            placeholder="Nhập mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={errors.newPassword ? "input-error" : ""}
          />
          {errors.newPassword && <div className="field-error">{errors.newPassword}</div>}

          <input
            type="password"
            placeholder="Xác nhận mật khẩu mới"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={errors.confirmPassword ? "input-error" : ""}
          />
          {errors.confirmPassword && <div className="field-error">{errors.confirmPassword}</div>}

          <button type="submit">Cập nhật mật khẩu</button>
        </form>

        <p className="back-link">
          <Link to="/login">← Quay lại đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
