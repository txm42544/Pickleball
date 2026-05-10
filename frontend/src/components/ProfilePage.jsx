import React, { useState, useEffect } from 'react';
import axios from 'axios';import { API_URL } from '../config/api';import BookingHistory from '../pages/customers/BookingHistory'; // Import BookingHistory thay vì PurchaseHistory
import './ProfilePage.css';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const ProfilePage = () => {
  const [customerInfo, setCustomerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false); // trạng thái sửa
  const [formData, setFormData] = useState({});
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      const userString = localStorage.getItem('user'); // Check for employee/manager login
      const khachString = localStorage.getItem('khach'); // Check for customer login

      let customerId = null;
      let loggedInRole = null;

      // 1. Check if an employee/manager is logged in
      if (userString) {
        try {
          const user = JSON.parse(userString);
          loggedInRole = user.role;
          if (loggedInRole === "Nhân viên" || loggedInRole === "Quản lý") {
            setError("Trang này chỉ dành cho khách hàng. Bạn đã đăng nhập với vai trò " + loggedInRole + ".");
            setLoading(false);
            // Optionally redirect employees/managers away from this page
            // navigate('/'); 
            return;
          }
        } catch (e) {
          console.error("Lỗi parse userString:", e);
          // If userString is corrupted, proceed to check khachString
        }
      }

      // 2. Check for customer login
      try {
        if (khachString) {
          const khach = JSON.parse(khachString);
          if (khach.role === "khachhang") {
            customerId = khach.MaKH; // Sử dụng MaKH làm ID khách hàng
          } else {
            // This handles the specific error "Bạn đã đăng nhập, nhưng không phải là Khách hàng."
            setError("Dữ liệu đăng nhập khách hàng không hợp lệ. Vui lòng đăng nhập lại.");
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.error("Lỗi parse khachString:", e);
        setError("Lỗi dữ liệu đăng nhập. Vui lòng đăng nhập lại.");
        setLoading(false);
        return;
      }

      // 3. If no valid customer ID is found
      if (!customerId) {
        setError("Bạn chưa đăng nhập.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `/api/admin/taikhoan/customer/profile?id=${customerId}`
        );
        if (response.data.success) {
          setCustomerInfo(response.data.customer);
          setFormData(response.data.customer);
        } else {
          setError(response.data.message || "Lỗi khi tải thông tin khách hàng");
        }
      } catch (e) {
        console.error("Lỗi khi kết nối server:", e);
        setError("Lỗi khi kết nối server");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]); // Add navigate to dependency array

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditToggle = () => {
    setEditing(!editing);
    setFormData(customerInfo);
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(
        `/api/admin/taikhoan/customer/profile/update?id=${customerInfo.id}`,
        formData
      );
      if (response.data.success) {
        setCustomerInfo(formData);
        setEditing(false);
        alert("Cập nhật thành công!");
      } else {
        alert(response.data.message || "Cập nhật thất bại!");
      }
    } catch {
      alert("Lỗi khi kết nối server");
    }
  };

  if (loading) return <div className="profile-container">Đang tải thông tin...</div>;
  if (error) return <div className="profile-container error-message">{error}</div>;

  const customer = customerInfo || {};
  const fields = [
    { label: "Mã khách hàng", name: "id", value: customer.id, readOnly: true },
    { label: "Họ và tên", name: "TenKh", value: customer.TenKh },
    { label: "Số điện thoại", name: "SDT", value: customer.SDT },
    { label: "Email", name: "email", value: customer.email },
    { label: "Địa chỉ", name: "DiaChi", value: customer.DiaChi, fullWidth: true },
    { label: "Giới tính", name: "GioiTinh", value: customer.GioiTinh, type: "select" },
  ];

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h2 className="profile-title">Thông tin Cá nhân Khách hàng</h2>
        <div className="profile-details-grid">
          {fields.map((field, index) => (
            <div
              key={index}
              className={`profile-item ${field.fullWidth ? "full-width" : ""}`}
            >
              <span className="profile-label">{field.label}:</span>
              {editing && !field.readOnly ? (
                field.type === "select" ? (
                  <select
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                  />
                )
              ) : (
                <span className="profile-value">{customer[field.name] || "N/A"}</span>
              )}
            </div>
          ))}
        </div>


        <div className="profile-actions">
          {editing ? (
            <>
              <button className="btn btn-primary" onClick={handleSave}>Lưu</button>
              <button className="btn btn-secondary" onClick={handleEditToggle}>Hủy</button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={handleEditToggle}>Sửa thông tin</button>
          )}
        </div>
      </div>
      {/* Thêm phần lịch sử đặt sân */}
      <div className="purchase-history-section">
        <BookingHistory />
      </div>
    </div>

  );

};


export default ProfilePage;
