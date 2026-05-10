import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../config/api";
import { Sidebar } from "../../components/Sidebar";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  RadialLinearScale
} from "chart.js";
import { Bar, Line, Doughnut, Pie, PolarArea } from "react-chartjs-2";
import "../../css/AdminDashboard.css";

// Đăng ký các components của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  RadialLinearScale
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    bookingRevenue: 0,
    bookingNgayRevenue: 0,
    bookingThangRevenue: 0,
    totalBookings: 0,
    totalBookingsNgay: 0,
    totalBookingsThang: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const [dailyRevenueData, setDailyRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [bookingsRes, bookingsThangRes] = await Promise.all([
        axios.get("/api/admin/san").catch(() => ({ data: [] })),
        axios.get("/api/admin/santhang/list").catch(() => ({ data: [] }))
      ]);
      
      // Lấy bookings từ san (mỗi sân có bookedSlots)
      const sanData = Array.isArray(bookingsRes.data) ? bookingsRes.data : [];
      let allBookings = [];
      sanData.forEach(san => {
        if (san.bookedSlots && Array.isArray(san.bookedSlots)) {
          allBookings = allBookings.concat(san.bookedSlots);
        }
      });
      
      // Bookings tháng - API trả về { message, count, data: [...] }
      const bookingsThangData = bookingsThangRes.data;
      const bookingsThang = Array.isArray(bookingsThangData) 
        ? bookingsThangData 
        : (bookingsThangData.data || []);
      
      console.log("📊 Dữ liệu đặt sân tháng:", bookingsThang.length, "records");

      // Tính doanh thu đặt sân ngày
      const bookingNgayRevenue = allBookings.reduce((sum, b) => {
        return sum + parseFloat(b.TongTienThuc || b.TongTien || 0);
      }, 0);

      // Tính doanh thu đặt sân tháng
      const bookingThangRevenue = bookingsThang.reduce((sum, b) => {
        return sum + parseFloat(b.TongTienThuc || b.TongTien || 0);
      }, 0);

      const totalRevenue = bookingNgayRevenue + bookingThangRevenue;

      // Tính doanh thu theo tháng (đặt sân)
      const monthlyRevenue = calculateMonthlyRevenue(allBookings, bookingsThang);

      // Tính doanh thu 7 ngày gần đây
      const dailyRevenue = calculateDailyRevenue(allBookings, bookingsThang);

      setStats({
        totalRevenue,
        bookingRevenue: totalRevenue,
        bookingNgayRevenue,
        bookingThangRevenue,
        totalBookings: allBookings.length + bookingsThang.length,
        totalBookingsNgay: allBookings.length,
        totalBookingsThang: bookingsThang.length
      });

      setRevenueData(monthlyRevenue);
      setDailyRevenueData(dailyRevenue);
      
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyRevenue = (bookings, bookingsThang) => {
    const months = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `T${d.getMonth() + 1}`;
      months[key] = { bookingNgay: 0, bookingThang: 0 };
    }
    
    // Doanh thu đặt sân ngày
    bookings.forEach(b => {
      const date = new Date(b.NgayLap || new Date());
      const key = `T${date.getMonth() + 1}`;
      if (months.hasOwnProperty(key)) {
        months[key].bookingNgay += parseFloat(b.TongTienThuc || b.TongTien || 0);
      }
    });
    
    // Doanh thu đặt sân tháng
    bookingsThang.forEach(b => {
      const date = new Date(b.NgayLap || new Date());
      const key = `T${date.getMonth() + 1}`;
      if (months.hasOwnProperty(key)) {
        months[key].bookingThang += parseFloat(b.TongTienThuc || b.TongTien || 0);
      }
    });
    
    return Object.entries(months).map(([month, data]) => ({ month, bookingNgay: data.bookingNgay, bookingThang: data.bookingThang }));
  };

  // Tính doanh thu 7 ngày gần đây
  const calculateDailyRevenue = (bookings, bookingsThang) => {
    const days = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = `${d.getDate()}/${d.getMonth() + 1}`;
      days[key] = { bookingNgay: 0, bookingThang: 0, date: d };
    }

    bookings.forEach(b => {
      const date = new Date(b.NgayLap || new Date());
      const key = `${date.getDate()}/${date.getMonth() + 1}`;
      if (days.hasOwnProperty(key)) {
        days[key].bookingNgay += parseFloat(b.TongTienThuc || b.TongTien || 0);
      }
    });

    bookingsThang.forEach(b => {
      const date = new Date(b.NgayLap || new Date());
      const key = `${date.getDate()}/${date.getMonth() + 1}`;
      if (days.hasOwnProperty(key)) {
        days[key].bookingThang += parseFloat(b.TongTienThuc || b.TongTien || 0);
      }
    });

    return Object.entries(days).map(([day, data]) => ({ day, bookingNgay: data.bookingNgay, bookingThang: data.bookingThang }));
  };

  const chartColors = [
    'rgba(99, 102, 241, 0.8)', 'rgba(34, 197, 94, 0.8)', 'rgba(251, 191, 36, 0.8)',
    'rgba(239, 68, 68, 0.8)', 'rgba(14, 165, 233, 0.8)', 'rgba(168, 85, 247, 0.8)'
  ];

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: "#374151", font: { size: 10 } } } }
  };

  const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  // Icons đồng bộ với Sidebar
  const Icons = {
    dollarSign: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"></line>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
      </svg>
    ),
    package: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
      </svg>
    ),
    briefcase: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
      </svg>
    ),
    calendar: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    ),
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <Sidebar />
        <div className="dashboard-content">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Bảng điều khiển</h1>
          <p>Tổng quan hoạt động kinh doanh</p>
        </div>

        {/* Stats Cards - Chỉ hiển thị doanh thu và đặt sân */}
        <div className="stats-grid">
          <div className="stat-card stat-revenue">
            <div className="stat-icon">
              <Icons.dollarSign />
            </div>
            <div className="stat-info">
              <h3>{formatCurrency(stats.totalRevenue)}</h3>
              <p>Tổng doanh thu</p>
            </div>
          </div>
          <div className="stat-card stat-bookings">
            <div className="stat-icon">
              <Icons.calendar />
            </div>
            <div className="stat-info">
              <h3>{stats.totalBookings}</h3>
              <p>Tổng đặt sân</p>
            </div>
          </div>
          <div className="stat-card stat-booking-ngay">
            <div className="stat-icon">
              <Icons.calendar />
            </div>
            <div className="stat-info">
              <h3>{stats.totalBookingsNgay}</h3>
              <p>Đặt sân ngày</p>
            </div>
          </div>
          <div className="stat-card stat-booking-thang">
            <div className="stat-icon">
              <Icons.calendar />
            </div>
            <div className="stat-info">
              <h3>{stats.totalBookingsThang}</h3>
              <p>Đặt sân tháng</p>
            </div>
          </div>
        </div>

        {/* Charts Grid - Chỉ doanh thu đặt sân */}
        <div className="charts-grid">
          {/* Biểu đồ doanh thu 6 tháng - Bar Chart */}
          <div className="chart-card">
            <h4>Doanh thu đặt sân 6 tháng</h4>
            <div className="chart-wrapper">
              <Bar 
                data={{
                  labels: revenueData.map(i => i.month),
                  datasets: [
                    {
                      label: "Đặt sân ngày",
                      data: revenueData.map(i => i.bookingNgay),
                      backgroundColor: "rgba(99, 102, 241, 0.8)",
                      borderRadius: 4
                    },
                    {
                      label: "Đặt sân tháng",
                      data: revenueData.map(i => i.bookingThang),
                      backgroundColor: "rgba(34, 197, 94, 0.8)",
                      borderRadius: 4
                    }
                  ]
                }} 
                options={{
                  ...commonOptions,
                  plugins: { legend: { position: 'top', labels: { boxWidth: 12, padding: 10, font: { size: 10 } } } },
                  scales: {
                    x: { ticks: { color: "#6b7280", font: { size: 9 } }, grid: { display: false } },
                    y: { ticks: { color: "#6b7280", font: { size: 9 }, callback: v => (v/1000000).toFixed(0) + 'tr' }, grid: { color: "rgba(0,0,0,0.05)" } }
                  }
                }} 
              />
            </div>
          </div>

          {/* Biểu đồ Line - Doanh thu 7 ngày */}
          <div className="chart-card">
            <h4>Doanh thu 7 ngày gần đây</h4>
            <div className="chart-wrapper">
              <Line 
                data={{
                  labels: dailyRevenueData.map(i => i.day),
                  datasets: [
                    {
                      label: "Đặt sân ngày",
                      data: dailyRevenueData.map(i => i.bookingNgay),
                      borderColor: "rgba(99, 102, 241, 1)",
                      backgroundColor: "rgba(99, 102, 241, 0.1)",
                      fill: true,
                      tension: 0.4
                    },
                    {
                      label: "Đặt sân tháng",
                      data: dailyRevenueData.map(i => i.bookingThang),
                      borderColor: "rgba(34, 197, 94, 1)",
                      backgroundColor: "rgba(34, 197, 94, 0.1)",
                      fill: true,
                      tension: 0.4
                    }
                  ]
                }} 
                options={{
                  ...commonOptions,
                  plugins: { legend: { position: 'top', labels: { boxWidth: 12, padding: 10, font: { size: 10 } } } },
                  scales: {
                    x: { ticks: { color: "#6b7280", font: { size: 9 } }, grid: { display: false } },
                    y: { ticks: { color: "#6b7280", font: { size: 9 }, callback: v => (v/1000000).toFixed(1) + 'tr' }, grid: { color: "rgba(0,0,0,0.05)" } }
                  }
                }} 
              />
            </div>
          </div>

          {/* Biểu đồ Doughnut - Tỷ lệ doanh thu đặt sân */}
          <div className="chart-card">
            <h4>Tỷ lệ doanh thu đặt sân</h4>
            <div className="chart-wrapper">
              <Doughnut 
                data={{
                  labels: ["Đặt sân ngày", "Đặt sân tháng"],
                  datasets: [{
                    data: [stats.bookingNgayRevenue, stats.bookingThangRevenue],
                    backgroundColor: ["rgba(99, 102, 241, 0.8)", "rgba(34, 197, 94, 0.8)"],
                    borderWidth: 2,
                    borderColor: "#fff"
                  }]
                }} 
                options={{
                  ...commonOptions,
                  plugins: { 
                    legend: { position: 'right', labels: { boxWidth: 12, padding: 8, font: { size: 10 } } }
                  }
                }} 
              />
            </div>
          </div>

          {/* Biểu đồ Pie - Số lượng đặt sân */}
          <div className="chart-card">
            <h4>Loại đặt sân</h4>
            <div className="chart-wrapper">
              <Pie 
                data={{
                  labels: ["Đặt sân ngày", "Đặt sân tháng"],
                  datasets: [{
                    data: [stats.totalBookingsNgay, stats.totalBookingsThang],
                    backgroundColor: ["rgba(14, 165, 233, 0.8)", "rgba(239, 68, 68, 0.8)"],
                    borderWidth: 2,
                    borderColor: "#fff"
                  }]
                }} 
                options={{
                  ...commonOptions,
                  plugins: { 
                    legend: { position: 'right', labels: { boxWidth: 12, padding: 8, font: { size: 10 } } }
                  }
                }} 
              />
            </div>
          </div>

          {/* Biểu đồ PolarArea - Tổng quan nguồn thu */}
          <div className="chart-card">
            <h4>Tổng quan doanh thu</h4>
            <div className="chart-wrapper">
              <PolarArea 
                data={{
                  labels: ["Đặt sân ngày", "Đặt sân tháng"],
                  datasets: [{
                    data: [stats.bookingNgayRevenue / 1000000, stats.bookingThangRevenue / 1000000],
                    backgroundColor: [
                      "rgba(99, 102, 241, 0.7)",
                      "rgba(34, 197, 94, 0.7)"
                    ],
                    borderWidth: 1
                  }]
                }} 
                options={{
                  ...commonOptions,
                  plugins: { 
                    legend: { position: 'right', labels: { boxWidth: 12, padding: 8, font: { size: 10 } } }
                  },
                  scales: {
                    r: { ticks: { display: false }, grid: { color: "rgba(0,0,0,0.1)" } }
                  }
                }} 
              />
            </div>
          </div>
        </div>

        {/* Bảng doanh thu đặt sân */}
        <div className="recent-orders">
          <h4>Bảng doanh thu đặt sân</h4>
          <table className="orders-table">
            <thead>
              <tr>
                <th>Loại đặt sân</th>
                <th>Doanh thu</th>
                <th>Tỷ lệ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Đặt sân ngày</strong></td>
                <td>{formatCurrency(stats.bookingNgayRevenue || 0)}</td>
                <td>{stats.totalRevenue > 0 ? ((stats.bookingNgayRevenue / stats.totalRevenue) * 100).toFixed(1) : 0}%</td>
              </tr>
              <tr>
                <td><strong>Đặt sân tháng</strong></td>
                <td>{formatCurrency(stats.bookingThangRevenue || 0)}</td>
                <td>{stats.totalRevenue > 0 ? ((stats.bookingThangRevenue / stats.totalRevenue) * 100).toFixed(1) : 0}%</td>
              </tr>
              <tr style={{background: '#f0f9ff', fontWeight: 'bold'}}>
                <td>Tổng cộng</td>
                <td>{formatCurrency(stats.totalRevenue || 0)}</td>
                <td>100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
