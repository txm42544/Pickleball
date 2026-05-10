import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Header.css";

const Header = () => {
  const [userName, setUserName] = useState(null);
  const [role, setRole] = useState(null);

  const handleLogout = () => {
    localStorage.clear();
    setUserName(null);
    setRole(null);
    window.location.href = "/login";
  };

  const checkLoginStatus = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const khach = JSON.parse(localStorage.getItem("khach"));

    if (user && (user.role === "Nhân viên" || user.role === "Quản lý")) {
      setUserName(user.userName);
      setRole(user.role);
      console.log("🔹 Đăng nhập với vai trò:", user.role);
    } else if (khach) {
      setUserName(khach.TenKh);
      setRole(khach.role);
      console.log("🔹 Khách hàng đăng nhập:", khach.TenKh);
    } else {
      setUserName(null);
      setRole(null);
    }
  };

  useEffect(() => {
    checkLoginStatus();
    window.addEventListener("storage", checkLoginStatus);
    return () => window.removeEventListener("storage", checkLoginStatus);
  }, []);

  return (
    <header className="header">
      <div className="header-main">
        <div className="container">
          <div className="header-content">
            <Link to="/" className="logo">
              <h3>Alpha Pickleball</h3>
            </Link>

            <nav className="nav">
              {role !== "Quản lý" && (
                <>
                  <Link to="/">Trang chủ</Link>
                  <div className="nav-dropdown">
                    <span className="dropdown-title">Đặt sân ▾</span>
                    <div className="dropdown-menu">
                      <Link to="/dat-san">Đặt sân ngày</Link>
                      <Link to="/santhang">Đặt sân tháng</Link>
                    </div>
                  </div>
                  <Link to="/booking-history">Lịch sử đặt sân</Link>
                </>
              )}
              {role === "Quản lý" && (
                <>
                  <Link to="/">Trang chủ</Link>
                  <Link to="/dashboard">Dashboard</Link>
                  <Link to="/quanlysan">Quản lý sân</Link>
                </>
              )}
            </nav>

            <div className="header-actions">
              {userName ? (
                <>
                  <Link to="/profile" className="action-icon login-icon">
                    <span>
                      Xin chào,{" "}
                      {userName.length > 20
                        ? userName.slice(0, 20) + "..."
                        : userName}
                    </span>
                  </Link>
                  <div
                    className="action-icon logout-icon"
                    onClick={handleLogout}
                    title="Đăng xuất"
                  >
                    <span>Đăng xuất</span>
                  </div>
                </>
              ) : (
                <Link to="/login" className="action-icon login-icon">
                  <span>Đăng nhập</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
