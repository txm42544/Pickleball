import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../css/QuanLyTaiKhoanPage.css";
import { Sidebar } from "../../components/Sidebar";

export default function TaiKhoan() {
  const API = "/api/admin/taikhoan";
  const API_KH = "/api/admin/khachhang";
  
  const [accounts, setAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [activeTab, setActiveTab] = useState("staff"); // staff | customer
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    maTK: "",
    userName: "",
    passWord: "",
    role: "Nhân viên",
  });
  const [customerFormData, setCustomerFormData] = useState({
    MaKH: "",
    TenKh: "",
    SDT: "",
    Email: "",
    DiaChi: "",
    passWord: "",
  });
  const [isEdit, setIsEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAccounts = async () => {
    try {
      const res = await axios.get(API);
      setAccounts(res.data);
    } catch (err) {
      console.error("❌ Lỗi khi tải tài khoản:", err);
      alert("Không thể tải danh sách tài khoản");
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(API_KH);
      setCustomers(res.data);
    } catch (err) {
      console.error("❌ Lỗi khi tải khách hàng:", err);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchCustomers();
  }, []);

  const handleAdd = () => {
    if (activeTab === "staff") {
      setFormData({ maTK: "", userName: "", passWord: "", role: "Nhân viên" });
    } else {
      setCustomerFormData({ MaKH: "", TenKh: "", SDT: "", Email: "", DiaChi: "", passWord: "" });
    }
    setIsEdit(false);
    setShowForm(true);
  };

  const handleEdit = (acc) => {
    if (activeTab === "staff") {
      setFormData(acc);
    } else {
      setCustomerFormData(acc);
    }
    setIsEdit(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa tài khoản này?")) return;
    try {
      if (activeTab === "staff") {
        await axios.delete(`${API}/${id}`);
      } else {
        await axios.delete(`${API_KH}/${id}`);
      }
      alert("✅ Xóa thành công");
      activeTab === "staff" ? fetchAccounts() : fetchCustomers();
    } catch (err) {
      alert("Lỗi khi xóa tài khoản");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === "staff") {
        if (isEdit) {
          await axios.put(API, formData);
          alert("✅ Cập nhật thành công");
        } else {
          await axios.post(API, {
            userName: formData.userName,
            passWord: formData.passWord,
            role: formData.role,
          });
          alert("✅ Thêm thành công");
        }
        fetchAccounts();
      } else {
        if (isEdit) {
          await axios.put(`${API_KH}/${customerFormData.MaKH}`, customerFormData);
          alert("✅ Cập nhật thành công");
        } else {
          await axios.post(API_KH, customerFormData);
          alert("✅ Thêm thành công");
        }
        fetchCustomers();
      }
      setShowForm(false);
    } catch (err) {
      console.error("❌ Lỗi khi lưu:", err);
      alert("Lỗi khi lưu tài khoản");
    }
  };

  // Filter based on search term - Chỉ hiển thị Admin/Quản lý, ẩn nhân viên
  const filteredAccounts = accounts.filter(acc => 
    (acc.role === 'Quản lý' || acc.role === 'Admin') &&
    (acc.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.role?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredCustomers = customers.filter(cus =>
    cus.TenKh?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cus.SDT?.includes(searchTerm) ||
    cus.Email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="tk-app">
      <Sidebar />
      <div className="tk-container container mt-4">
        <div className="tk-header">
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Quản lý tài khoản
          </h2>
        </div>

        {/* Tabs - Chỉ hiển thị Admin và Khách hàng */}
        <div className="tk-tabs">
          <button 
            className={`tk-tab ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => { setActiveTab('staff'); setSearchTerm(''); }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <circle cx="19" cy="11" r="2"></circle>
              <path d="M19 8v1"></path>
              <path d="M19 13v1"></path>
            </svg>
            Admin ({accounts.filter(acc => acc.role === 'Quản lý' || acc.role === 'Admin').length})
          </button>
          <button 
            className={`tk-tab ${activeTab === 'customer' ? 'active' : ''}`}
            onClick={() => { setActiveTab('customer'); setSearchTerm(''); }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Khách hàng ({customers.length})
          </button>
        </div>

        {/* Search & Add */}
        <div className="tk-toolbar">
          <div className="tk-search">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder={activeTab === 'staff' ? "Tìm theo tên admin..." : "Tìm theo tên, SĐT, email..."} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="tk-btn-add" onClick={handleAdd}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            {activeTab === 'staff' ? 'Thêm Admin' : 'Thêm khách hàng'}
          </button>
        </div>

        {/* Staff Table */}
        {activeTab === 'staff' && (
          <table className="tk-table table table-striped table-bordered">
            <thead>
              <tr>
                <th>Mã TK</th>
                <th>Tên đăng nhập</th>
                <th>Mật khẩu</th>
                <th>Phân quyền</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.length > 0 ? (
                filteredAccounts.map((acc) => (
                  <tr key={acc.maTK}>
                    <td>{acc.maTK}</td>
                    <td>{acc.userName}</td>
                    <td>••••••••</td>
                    <td>
                      <span className={`tk-role-badge ${acc.role === 'Quản lý' ? 'manager' : acc.role === 'Admin' ? 'admin' : 'staff'}`}>
                        {acc.role}
                      </span>
                    </td>
                    <td>
                      <button
                        className="tk-btn-warning me-2"
                        onClick={() => handleEdit(acc)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Sửa
                      </button>
                      <button
                        className="tk-btn-danger"
                        onClick={() => handleDelete(acc.maTK)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Customer Table */}
        {activeTab === 'customer' && (
          <table className="tk-table table table-striped table-bordered">
            <thead>
              <tr>
                <th>Mã KH</th>
                <th>Tên khách hàng</th>
                <th>Số điện thoại</th>
                <th>Email</th>
                <th>Địa chỉ</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((cus) => (
                  <tr key={cus.MaKH}>
                    <td>{cus.MaKH}</td>
                    <td>{cus.TenKh}</td>
                    <td>{cus.SDT}</td>
                    <td>{cus.Email || '—'}</td>
                    <td>{cus.DiaChi || '—'}</td>
                    <td>
                      <button
                        className="tk-btn-warning me-2"
                        onClick={() => handleEdit(cus)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Sửa
                      </button>
                      <button
                        className="tk-btn-danger"
                        onClick={() => handleDelete(cus.MaKH)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Modal Form */}
        {showForm && (
          <div className="tk-modal-backdrop">
            <div className="tk-modal-content p-4 rounded shadow">
              <h4>
                {activeTab === 'staff' 
                  ? (isEdit ? "Sửa tài khoản" : "Thêm tài khoản")
                  : (isEdit ? "Sửa khách hàng" : "Thêm khách hàng")
                }
              </h4>
              
              {/* Staff Form */}
              {activeTab === 'staff' && (
                <form onSubmit={handleSubmit}>
                  {isEdit && (
                    <div className="mb-3">
                      <label className="form-label">Mã tài khoản</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.maTK}
                        readOnly
                      />
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Tên đăng nhập</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập tên đăng nhập..."
                      value={formData.userName}
                      onChange={(e) =>
                        setFormData({ ...formData, userName: e.target.value })
                      }
                      required
                      readOnly={isEdit}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Mật khẩu</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Nhập mật khẩu..."
                      value={formData.passWord}
                      onChange={(e) =>
                        setFormData({ ...formData, passWord: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Phân quyền</label>
                    <select
                      className="form-select"
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      required
                    >
                      <option value="Nhân viên">Nhân viên</option>
                      <option value="Quản lý">Quản lý</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>

                  <div className="d-flex justify-content-end">
                    <button type="submit" className="tk-btn-save me-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                      </svg>
                      {isEdit ? "Cập nhật" : "Lưu mới"}
                    </button>
                    <button
                      type="button"
                      className="tk-btn-cancel"
                      onClick={() => setShowForm(false)}
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              )}

              {/* Customer Form */}
              {activeTab === 'customer' && (
                <form onSubmit={handleSubmit}>
                  {isEdit && (
                    <div className="mb-3">
                      <label className="form-label">Mã khách hàng</label>
                      <input
                        type="text"
                        className="form-control"
                        value={customerFormData.MaKH}
                        readOnly
                      />
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">Tên khách hàng</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập tên khách hàng..."
                      value={customerFormData.TenKh}
                      onChange={(e) =>
                        setCustomerFormData({ ...customerFormData, TenKh: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Số điện thoại</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="Nhập số điện thoại..."
                      value={customerFormData.SDT}
                      onChange={(e) =>
                        setCustomerFormData({ ...customerFormData, SDT: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Nhập email..."
                      value={customerFormData.Email || ''}
                      onChange={(e) =>
                        setCustomerFormData({ ...customerFormData, Email: e.target.value })
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Địa chỉ</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập địa chỉ..."
                      value={customerFormData.DiaChi || ''}
                      onChange={(e) =>
                        setCustomerFormData({ ...customerFormData, DiaChi: e.target.value })
                      }
                    />
                  </div>

                  {!isEdit && (
                    <div className="mb-3">
                      <label className="form-label">Mật khẩu</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Nhập mật khẩu..."
                        value={customerFormData.passWord || ''}
                        onChange={(e) =>
                          setCustomerFormData({ ...customerFormData, passWord: e.target.value })
                        }
                      />
                    </div>
                  )}

                  <div className="d-flex justify-content-end">
                    <button type="submit" className="tk-btn-save me-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                      </svg>
                      {isEdit ? "Cập nhật" : "Lưu mới"}
                    </button>
                    <button
                      type="button"
                      className="tk-btn-cancel"
                      onClick={() => setShowForm(false)}
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
