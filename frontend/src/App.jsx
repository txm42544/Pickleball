import './App.css'
import { Routes, Route } from 'react-router'
import { useLocation } from 'react-router-dom';

import { DatSanNgay } from './pages/managers/DatSanNgay'
import { DatSanThang } from './pages/managers/DatSanThang'
import { XacNhanDatSan } from './pages/managers/XacNhanDatSan'
import { DichVu } from './pages/customers/DichVu';
import { CheckSanNgay } from './pages/managers/CheckSanNgay';
import Header from './components/Header';
import Footer from './components/Footer';
import NotificationBell from './components/NotificationBell';
import ProfilePage from './components/ProfilePage';
import Home from './pages/customers/Home';
import AdminHome from './pages/managers/AdminHome';
import BookingHistory from './pages/customers/BookingHistory';
import AdminDashboard from './pages/managers/AdminDashboard'
import QuanLySan from './pages/managers/QuanLySan'
import Login from "./pages/login/Login";
import Register from "./pages/login/Register";
import ForgotPassword from "./pages/login/ForgotPassword";


function App() {
  // 🧩 Lấy thông tin đăng nhập từ localStorage
// const currentUser =
//   JSON.parse(localStorage.getItem("user")) ||
//   JSON.parse(localStorage.getItem("khach"));

// let role = "";
// let maNguoiDung = "";
// let isKhachHang = false;

// if (currentUser?.role === "Nhân viên" || currentUser?.role === "Quản lý") {
//   role = "nhanvien";
//   maNguoiDung = currentUser.maNV;
//   console.log("🔹 Đang đăng nhập với vai trò:", currentUser.role);
//   console.log("Mã nhân viên:", maNguoiDung);
// } else if (currentUser?.id && !currentUser?.maNV) {
//   role = "khachhang";
//   maNguoiDung = currentUser.id;
//   isKhachHang = true;
//   console.log("🔹 Khách hàng đăng nhập:");
//   console.log("Mã KH:", currentUser.id);
//   console.log("Tên KH:", currentUser.TenKh);
//   console.log("SĐT:", currentUser.SDT);
// }


// 🧩 Lấy thông tin đăng nhập
const currentUser =
  JSON.parse(localStorage.getItem("user")) ||
  JSON.parse(localStorage.getItem("khach")) || {};

let role = ""; // nhanvien / khachhang

if (currentUser?.role === "Nhân viên" || currentUser?.role === "Quản lý") {
  role = "nhanvien";
} else if (currentUser?.MaKH) {
  role = "khachhang";
}

  const location = useLocation();


  const noHeaderFooterRoutes = ['/xacnhansan', '/dashboard', '/quanlysan'];
  const isAdminHomeRoute = role === 'nhanvien' && location.pathname === '/';
  const hideHeaderFooter = noHeaderFooterRoutes.includes(location.pathname) || isAdminHomeRoute;
  const noNotifyRoutes = ['/login', '/register', '/forgot-password'];
  const showNotification = (role === 'nhanvien' || role === 'khachhang') && !noNotifyRoutes.includes(location.pathname);
  return (
    <div className="app">
      {showNotification && <NotificationBell />}
      {!hideHeaderFooter && <Header />}
      <main className={`main-content ${hideHeaderFooter ? 'main-content--admin' : ''}`}>
        <Routes>
          <Route path="/" element={role === 'nhanvien' ? <AdminHome /> : <Home />} />
          <Route path="dat-san" element={<DatSanNgay />} />
          <Route path="santhang" element={<DatSanThang />} />
          <Route path="xacnhansan" element={<XacNhanDatSan />} />
          <Route path="checksanngay" element={<CheckSanNgay />} />
          <Route path="/dichvu" element={<DichVu />} />
          <Route path="/booking-history" element={<BookingHistory />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/quanlysan" element={<QuanLySan />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
        </Routes>
      </main>

      {!hideHeaderFooter && location.pathname !== '/pos' && location.pathname !== '/login' && <Footer />}
    </div >
  )
}

export default App
