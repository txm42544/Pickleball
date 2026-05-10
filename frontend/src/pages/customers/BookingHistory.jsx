import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useAlert } from '../../context/AlertContext';
import '../../css/PurchaseHistory.css';

const BookingHistory = () => {
  const [activeTab, setActiveTab] = useState('datsan-ngay');
  const [datsanNgay, setDatsanNgay] = useState([]);
  const [datsanThang, setDatsanThang] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null);
  const { showAlert } = useAlert();

  const normalizeStatus = (status) =>
    String(status || '')
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const isCancelledStatus = (status) => {
    const norm = normalizeStatus(status);
    return norm.includes('huy') || norm.includes('cancel');
  };

  const fetchBookingHistory = async () => {
    setLoading(true);
    setError(null);

    const khachString = localStorage.getItem('khach');
    let customerId = null;

    if (khachString) {
      try {
        const khach = JSON.parse(khachString);
        if (khach.role === "khachhang" && khach.MaKH) {
          customerId = khach.MaKH;
        }
      } catch (e) {
        console.error("Lỗi parse khach:", e);
      }
    }

    if (!customerId) {
      setError("Bạn chưa đăng nhập. Vui lòng đăng nhập để xem lịch sử đặt sân.");
      setLoading(false);
      return;
    }

    try {
      const resDatSanNgay = await axios.get(
        `/api/admin/san/history?MaKH=${customerId}`
      );
      setDatsanNgay((resDatSanNgay.data || []).filter((item) => !isCancelledStatus(item.TrangThai)));

      const resDatSanThang = await axios.get(
        `/api/admin/santhang/history?MaKH=${customerId}`
      );
      setDatsanThang((resDatSanThang.data || []).filter((item) => !isCancelledStatus(item.TrangThai)));
    } catch (err) {
      console.error('Lỗi khi lấy lịch sử đặt sân:', err);
      setError('Không thể tải lịch sử đặt sân. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingHistory();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    return timeStr.slice(0, 5);
  };

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString('vi-VN') + ' đ';
  };

  const statusInfo = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'accepted':
      case 'đã thanh toán':
        return { label: 'Đã xác nhận', className: 'status-badge paid' };
      case 'pending':
      case 'chờ xác nhận':
        return { label: 'Chờ xác nhận', className: 'status-badge pending' };
      case 'cancelled':
      case 'đã hủy':
        return { label: 'Đã hủy', className: 'status-badge cancelled' };
      default:
        return { label: status || 'Chờ xác nhận', className: 'status-badge pending' };
    }
  };

  const handleCancel = async (type, id) => {
    try {
      setCancellingId(`${type}-${id}`);
      if (type === 'ngay') {
        await axios.put('/api/admin/san/cancel', { MaDatSan: id });
      } else {
        await axios.put('/api/admin/santhang/cancel', { MaDatSanThang: id });
      }
      await fetchBookingHistory();
      showAlert({ type: 'success', title: 'Đã hủy', message: 'Lịch sân đã được hủy.' });
    } catch (err) {
      console.error('Lỗi khi hủy đặt sân:', err);
      showAlert({ type: 'error', title: 'Hủy thất bại', message: 'Không thể hủy đặt sân, vui lòng thử lại.' });
    } finally {
      setCancellingId(null);
    }
  };

  const openCancelConfirm = (type, id) => {
    setConfirmCancel({ type, id });
  };

  const closeCancelConfirm = () => {
    setConfirmCancel(null);
  };

  const submitCancelFromPopup = async () => {
    if (!confirmCancel) return;
    const { type, id } = confirmCancel;
    closeCancelConfirm();
    await handleCancel(type, id);
  };

  if (loading) return <div className="purchase-history-container">Đang tải lịch sử đặt sân...</div>;
  if (error) return <div className="purchase-history-container error-message">{error}</div>;

  return (
    <div className="purchase-history-container">
      <h2 className="purchase-history-title">Lịch sử Đặt sân</h2>

      {/* Tabs */}
      <div className="booking-tabs">
        <button 
          className={`booking-tab ${activeTab === 'datsan-ngay' ? 'active' : ''}`}
          onClick={() => setActiveTab('datsan-ngay')}
        >
          Đặt sân ngày ({datsanNgay.length})
        </button>
        <button 
          className={`booking-tab ${activeTab === 'datsan-thang' ? 'active' : ''}`}
          onClick={() => setActiveTab('datsan-thang')}
        >
          Đặt sân tháng ({datsanThang.length})
        </button>

      </div>

      {/* Content */}
      <div className="booking-content">
        {/* Đặt sân ngày */}
        {activeTab === 'datsan-ngay' && (
          <div className="booking-list">
            {datsanNgay.length === 0 ? (
              <p className="no-data">Bạn chưa có lịch sử đặt sân ngày nào.</p>
            ) : (
              <table className="booking-table">
                <thead>
                  <tr>
                    <th>Mã đặt</th>
                    <th>Sân</th>
                    <th>Ngày</th>
                    <th>Giờ vào</th>
                    <th>Giờ ra</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {datsanNgay.map((item) => {
                    const info = statusInfo(item.TrangThai);
                    const disabled = cancellingId === `ngay-${item.MaDatSan}`;
                    return (
                      <tr key={item.MaDatSan}>
                        <td><strong>{item.MaDatSan}</strong></td>
                        <td>{item.MaSan}</td>
                        <td>{formatDate(item.NgayLap)}</td>
                        <td>{formatTime(item.GioVao)}</td>
                        <td>{formatTime(item.GioRa)}</td>
                        <td>{formatCurrency(item.TongTien)}</td>
                        <td>
                          <span className={info.className}>
                            {info.label}
                          </span>
                        </td>
                        <td>
                          {info.label !== 'Đã hủy' && (
                            <button
                              className="cancel-booking-btn"
                              onClick={() => openCancelConfirm('ngay', item.MaDatSan)}
                              disabled={disabled}
                            >
                              {disabled ? 'Đang hủy...' : 'Hủy'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Đặt sân tháng */}
        {activeTab === 'datsan-thang' && (
          <div className="booking-list">
            {datsanThang.length === 0 ? (
              <p className="no-data">Bạn chưa có lịch sử đặt sân tháng nào.</p>
            ) : (
              <table className="booking-table">
                <thead>
                  <tr>
                    <th>Mã đặt</th>
                    <th>Sân</th>
                    <th>Giờ</th>
                    <th>Tổng tiền</th>
                    <th>Ghi chú</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {datsanThang.map((item) => {
                    const info = statusInfo(item.TrangThai);
                    const disabled = cancellingId === `thang-${item.MaDatSanThang}`;
                    return (
                      <tr key={item.MaDatSanThang}>
                        <td><strong>{item.MaDatSanThang}</strong></td>
                        <td>{item.DanhSachSan}</td>
                        <td>{formatTime(item.GioBatDau)} - {formatTime(item.GioKetThuc)}</td>
                        <td>{formatCurrency(item.TongTien)}</td>
                        <td>{item.GhiChu || '-'}</td>
                        <td>
                          <span className={info.className}>
                            {info.label}
                          </span>
                        </td>
                        <td>
                          {info.label !== 'Đã hủy' && (
                            <button
                              className="cancel-booking-btn"
                              onClick={() => openCancelConfirm('thang', item.MaDatSanThang)}
                              disabled={disabled}
                            >
                              {disabled ? 'Đang hủy...' : 'Hủy'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}


      </div>

      {confirmCancel && (
        <div className="cancel-confirm-overlay" onClick={closeCancelConfirm}>
          <div className="cancel-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="cancel-confirm-close"
              onClick={closeCancelConfirm}
              aria-label="Đóng"
            >
              &times;
            </button>
            <h3>Xác nhận hủy đặt sân</h3>
            <p>
              Bạn có chắc muốn hủy lịch đặt sân này không?
            </p>
            <div className="cancel-confirm-actions">
              <button className="cancel-confirm-keep" onClick={closeCancelConfirm}>
                Không
              </button>
              <button className="cancel-confirm-ok" onClick={submitCancelFromPopup}>
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
