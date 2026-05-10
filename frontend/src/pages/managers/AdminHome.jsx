import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from '../../api/axios';
import { Sidebar } from "../../components/Sidebar";
import "../../css/AdminHome.css";

export default function AdminHome() {
  const [loading, setLoading] = useState(true);
  const [overviewRevealed, setOverviewRevealed] = useState(false);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    bookingNgayRevenue: 0,
    bookingThangRevenue: 0,
    totalBookingsNgay: 0,
    totalBookingsThang: 0,
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const [bookingsRes, bookingsThangRes] = await Promise.all([
          axios.get("/api/admin/san").catch(() => ({ data: [] })),
          axios.get("/api/admin/santhang/list").catch(() => ({ data: [] })),
        ]);

        const sanData = Array.isArray(bookingsRes.data) ? bookingsRes.data : [];
        let allBookings = [];
        sanData.forEach((san) => {
          if (Array.isArray(san.bookedSlots)) {
            allBookings = allBookings.concat(san.bookedSlots);
          }
        });

        const bookingsThangData = bookingsThangRes.data;
        const bookingsThang = Array.isArray(bookingsThangData)
          ? bookingsThangData
          : (bookingsThangData.data || []);

        const bookingNgayRevenue = allBookings.reduce(
          (sum, item) => sum + Number(item.TongTienThuc || item.TongTien || 0),
          0
        );
        const bookingThangRevenue = bookingsThang.reduce(
          (sum, item) => sum + Number(item.TongTienThuc || item.TongTien || 0),
          0
        );

        setSummary({
          totalRevenue: bookingNgayRevenue + bookingThangRevenue,
          bookingNgayRevenue,
          bookingThangRevenue,
          totalBookingsNgay: allBookings.length,
          totalBookingsThang: bookingsThang.length,
        });
      } catch (error) {
        console.error("Lỗi tải tổng quan admin home:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  useEffect(() => {
    const syncRevealByScroll = () => {
      const hero = document.getElementById("admin-hero");
      if (!hero) return;

      const heroRect = hero.getBoundingClientRect();
      const hasPassedHero = heroRect.bottom <= window.innerHeight - 20;
      const isAtTop = window.scrollY <= 8;

      setOverviewRevealed((prev) => {
        if (!prev && hasPassedHero) return true;
        if (prev && isAtTop) return false;
        return prev;
      });
    };

    syncRevealByScroll();
    window.addEventListener("scroll", syncRevealByScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", syncRevealByScroll);
    };
  }, []);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);

  const revenuePercent = useMemo(() => {
    const total = summary.totalRevenue || 0;
    if (!total) return { ngay: 0, thang: 0 };
    return {
      ngay: Math.round((summary.bookingNgayRevenue / total) * 100),
      thang: Math.round((summary.bookingThangRevenue / total) * 100),
    };
  }, [summary]);

  const bookingPercent = useMemo(() => {
    const total = summary.totalBookingsNgay + summary.totalBookingsThang;
    if (!total) return { ngay: 0, thang: 0 };
    return {
      ngay: Math.round((summary.totalBookingsNgay / total) * 100),
      thang: Math.round((summary.totalBookingsThang / total) * 100),
    };
  }, [summary]);

  const handleScrollToOverview = () => {
    const target = document.getElementById("admin-overview");
    if (!target) return;
    setOverviewRevealed(true);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="admin-home-page">
      <Sidebar />
      <div className="admin-home-content">
        <section id="admin-hero" className="admin-hero">
          <div className="admin-hero-overlay"></div>
          <div className="admin-hero-content">
            <h1>ALPHA PICKLEBALL</h1>
            <p>Trang chủ quản trị sân · Theo dõi nhanh và điều hướng đến từng màn hình chi tiết.</p>
            <button type="button" className="hero-scroll-btn" onClick={handleScrollToOverview}>
              Xem tổng quan
            </button>
          </div>
        </section>

        <section id="admin-overview" className={`admin-overview ${overviewRevealed ? "revealed" : ""}`}>
          <div className="admin-overview-head">
            <h2>Tổng quan nhanh</h2>
            <Link to="/dashboard" className="overview-detail-link">
              Xem báo cáo chi tiết →
            </Link>
          </div>

          <div className="overview-stat-grid">
            <Link to="/dashboard" className="overview-stat-card">
              <h4>Tổng doanh thu</h4>
              <p>{loading ? "Đang tải..." : formatCurrency(summary.totalRevenue)}</p>
              <small>Bấm để mở trang thống kê chi tiết</small>
            </Link>

            <Link to="/dat-san" className="overview-stat-card">
              <h4>Lượt đặt sân ngày</h4>
              <p>{loading ? "Đang tải..." : `${summary.totalBookingsNgay} lượt`}</p>
              <small>Bấm để mở quản lý đặt sân ngày</small>
            </Link>

            <Link to="/santhang" className="overview-stat-card">
              <h4>Lượt đặt sân tháng</h4>
              <p>{loading ? "Đang tải..." : `${summary.totalBookingsThang} lượt`}</p>
              <small>Bấm để mở quản lý đặt sân tháng</small>
            </Link>
          </div>

          <div className="overview-chart-grid">
            <Link to="/dashboard" className="mini-chart-card">
              <h4>Sơ đồ tỷ lệ doanh thu</h4>
              <div className="mini-row">
                <span>Đặt ngày ({revenuePercent.ngay}%)</span>
                <div className="mini-bar"><i style={{ width: `${revenuePercent.ngay}%` }}></i></div>
              </div>
              <div className="mini-row">
                <span>Đặt tháng ({revenuePercent.thang}%)</span>
                <div className="mini-bar"><i style={{ width: `${revenuePercent.thang}%` }}></i></div>
              </div>
            </Link>

            <Link to="/dashboard" className="mini-chart-card">
              <h4>Sơ đồ tỷ lệ lượt đặt</h4>
              <div className="mini-row">
                <span>Đặt ngày ({bookingPercent.ngay}%)</span>
                <div className="mini-bar"><i style={{ width: `${bookingPercent.ngay}%` }}></i></div>
              </div>
              <div className="mini-row">
                <span>Đặt tháng ({bookingPercent.thang}%)</span>
                <div className="mini-bar"><i style={{ width: `${bookingPercent.thang}%` }}></i></div>
              </div>
            </Link>
          </div>
        </section>

        <section className={`admin-home-grid ${overviewRevealed ? "revealed" : ""}`}>
          <Link to="/dat-san" className="admin-home-card">
            <h3>Quản lý sân ngày</h3>
            <p>Xem lịch sân theo ngày, kiểm tra trạng thái và thao tác nhanh.</p>
            <span>Truy cập →</span>
          </Link>

          <Link to="/santhang" className="admin-home-card">
            <h3>Quản lý sân tháng</h3>
            <p>Kiểm soát các suất đặt tháng cố định và tình trạng xử lý.</p>
            <span>Truy cập →</span>
          </Link>

          <Link to="/dashboard" className="admin-home-card">
            <h3>Báo cáo thống kê</h3>
            <p>Theo dõi tổng quan doanh thu, số lượt đặt sân ngày và tháng.</p>
            <span>Xem thống kê →</span>
          </Link>

          <Link to="/quanlysan" className="admin-home-card">
            <h3>Quản lý sân</h3>
            <p>Cập nhật danh sách sân, loại sân và trạng thái hoạt động.</p>
            <span>Quản lý ngay →</span>
          </Link>
        </section>
      </div>
    </div>
  );
}
