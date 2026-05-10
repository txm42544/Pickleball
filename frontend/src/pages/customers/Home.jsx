import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../../css/Home.css";

const Home = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(""); // nhanvien | khachhang

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")); // nhân viên/quản lý
    const khach = JSON.parse(localStorage.getItem("khach")); // khách hàng

    if (user) {
      setCurrentUser(user);
      setRole("nhanvien"); // bao gồm quản lý
      console.log("🔹 Nhân viên/Quản lý:", user.role, "Mã NV:", user.maNV);
    } else if (khach) {
      setCurrentUser(khach);
      setRole("khachhang");
      console.log("👉 Khách hàng:", khach.MaKH, khach.TenKh, khach.SDT, khach.role);
    }
  }, []);

  return (
    <div className="home">
      {/* Phần giới thiệu (Hero Section) */}
      <section className="hero">
        {/* Ảnh nền */}
        <div className="hero-background">
          <img
            src="/uploads/categories/Huong-dan-cach-chon-vot-Pickleball-phu-hop-va-chuan-nhat-Hoc-Vien-VNTA-8.webp"
            alt="Dụng cụ Pickleball cao cấp"
          />
          <div className="hero-overlay"></div>
        </div>
        
        {/* Nội dung nằm giữa */}
        <div className="hero-content">
          <div className="hero-text">
            <h1>
              <span className="hero-title-main">Đặt sân nhanh – Trải nghiệm tuyệt vời</span>
              <br />
              <span className="hero-title-sub">Giải pháp số cho cộng đồng Pickleball</span>
            </h1>
            <p>
              Đặt sân Pickleball nhanh chóng và linh hoạt, phù hợp cho mọi 
              cấp độ người chơi — từ người mới nhập môn đến 
              vận động viên chuyên nghiệp.
            </p>
            <Link to="/dat-san" className="btn hero-btn">
              Đặt sân ngay
            </Link>
          </div>
        </div>
      </section>

      {/* Banner đặt sân */}
      <section className="booking-banners-section">
        <div className="container">
          <h2 className="section-title">Dịch vụ đặt sân</h2>
          <div className="booking-banners-grid">
            {/* Banner Đặt sân ngày */}
            <Link to="/dat-san" className="booking-banner-card">
              <div className="banner-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <h3>Đặt sân ngày</h3>
              <p>Đặt sân theo giờ, linh hoạt theo nhu cầu của bạn</p>
              <span className="banner-btn">Đặt ngay →</span>
            </Link>

            {/* Banner Đặt sân tháng */}
            <Link to="/santhang" className="booking-banner-card">
              <div className="banner-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                  <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"></path>
                </svg>
              </div>
              <h3>Đặt sân tháng</h3>
              <p>Ưu đãi đặc biệt khi đặt sân cố định hàng tháng</p>
              <span className="banner-btn">Đặt ngay →</span>
            </Link>



            {/* Banner Sân VIP */}
            <Link to="/dat-san" className="booking-banner-card vip-banner">
              <div className="banner-icon vip">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
              <h3>Sân VIP</h3>
              <p>Trải nghiệm đẳng cấp với vợt xịn và không gian riêng tư</p>
              <span className="banner-btn">Khám phá →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Thông tin về sân VIP */}
      <section className="vip-info-section">
        <div className="container">
          <div className="vip-info-content">
            <div className="vip-info-text">
              <h2>Khu VIP - Trải nghiệm đẳng cấp</h2>
              <p>Đặt sân khu VIP để được:</p>
              <ul>
                <li>Trải nghiệm vợt Pickleball cao cấp</li>
                <li>Không gian riêng tư, thoáng mát</li>
                <li>Phục vụ nước uống miễn phí</li>
                <li>Ưu tiên đặt sân trong giờ cao điểm</li>
              </ul>
              <Link to="/dat-san" className="btn vip-btn">Đặt sân VIP ngay</Link>
            </div>
            <div className="vip-info-image">
              <img 
                src="/uploads/categories/Huong-dan-cach-chon-vot-Pickleball-phu-hop-va-chuan-nhat-Hoc-Vien-VNTA-8.webp" 
                alt="Sân VIP Pickleball"
              />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
