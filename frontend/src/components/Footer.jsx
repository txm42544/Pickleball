import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-inner">
          <div className="footer-brand">
            <h3>Alpha Pickleball</h3>
            <p className="footer-description">
              Sân tiêu chuẩn với dịch vụ thân thiện, hỗ trợ đặt sân nhanh chóng cả ngày lẫn tháng.
            </p>
            <div className="footer-contact-row">
              <span>Chủ sân:</span>
              <span className="footer-strong">Chí Tâm & Thu Huyền</span>
            </div>
            <div className="footer-contact-row">
              <span>Hotline:</span>
              <a href="tel:0796682288">079 668 2288</a>
            </div>
            <div className="footer-contact-row">
              <span>Địa chỉ:</span>
              <span>64 Trần Bình Trọng, Phường Kon Tum, Quảng Ngãi</span>
            </div>
          </div>

          <div className="footer-column">
            <h4>Dịch vụ có sẵn</h4>
            <ul>
              <li>Có mái che, bãi xe riêng</li>
              <li>Chiếu sáng LED chống chói hiện đại</li>
              <li>Thuê vợt và bóng Pickleball giá hợp lý</li>
              <li>Hỗ trợ đặt sân nhanh, thanh toán linh hoạt</li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Liên hệ chúng tôi</h4>
            <ul className="no-list-style">
              <li>Email: <a href="mailto:contact@alphapickleball.vn">contact@alphapickleball.vn</a></li>
              <li>Hotline: <a href="tel:0796682288">079 668 2288</a></li>
              <li>Facebook: <Link to="/">Alpha Pickleball</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
