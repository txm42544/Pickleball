import React, { useEffect, useState } from "react";
import axios from '../../api/axios';
import { Sidebar } from "../../components/Sidebar";
import "../../css/QuanLySan.css";
import { useAlert } from "../../context/AlertContext";

export default function QuanLySan() {
  const API = "/api/admin/san";
  const { showAlert } = useAlert();
  
  const [courts, setCourts] = useState([]);
  const [selectedCourtIds, setSelectedCourtIds] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState({ open: false, ids: [] });
  const [formData, setFormData] = useState({
    MaSan: "",
    TenSan: "",
    LoaiSan: "Thường",
    GiaThueTruoc16: 100000,
    GiaThueSau16: 160000,
    TrangThai: "Hoạt động"
  });
  const [isEdit, setIsEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCourts = async () => {
    try {
      const res = await axios.get(`${API}/list`);
      setCourts(res.data);
      setSelectedCourtIds((prev) => prev.filter((id) => res.data.some((court) => court.MaSan === id)));
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách sân:", err);
      showAlert({ type: "error", title: "Tải dữ liệu thất bại", message: "Không thể tải danh sách sân" });
    }
  };

  useEffect(() => {
    fetchCourts();
  }, []);

  const handleAdd = () => {
    // Tạo mã sân tự động
    const maxNum = courts.reduce((max, c) => {
      const num = parseInt(c.MaSan.replace('S', '')) || 0;
      return num > max ? num : max;
    }, 0);
    
    setFormData({
      MaSan: `S${maxNum + 1}`,
      TenSan: `Sân ${maxNum + 1}`,
      LoaiSan: "Thường",
      GiaThueTruoc16: 100000,
      GiaThueSau16: 160000,
      TrangThai: "Hoạt động"
    });
    setIsEdit(false);
    setShowForm(true);
  };

  const handleEdit = (court) => {
    setFormData(court);
    setIsEdit(true);
    setShowForm(true);
  };

  const openDeleteConfirm = (ids) => {
    if (!ids || ids.length === 0) return;
    setConfirmDeleteModal({ open: true, ids });
  };

  const closeDeleteConfirm = () => {
    setConfirmDeleteModal({ open: false, ids: [] });
  };

  const handleDelete = (MaSan) => {
    openDeleteConfirm([MaSan]);
  };

  const executeDelete = async () => {
    const idsToDelete = confirmDeleteModal.ids;
    if (!idsToDelete.length) return;

    try {
      const results = await Promise.allSettled(
        idsToDelete.map((id) => axios.delete(`${API}/delete/${id}`))
      );

      const failedIds = [];
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          failedIds.push(idsToDelete[index]);
        }
      });

      const successCount = idsToDelete.length - failedIds.length;

      if (successCount > 0 && failedIds.length === 0) {
        showAlert({
          type: "success",
          title: "Đã xóa sân",
          message:
            idsToDelete.length === 1
              ? `${idsToDelete[0]} đã được xóa vĩnh viễn.`
              : `Đã xóa thành công ${successCount} sân.`,
        });
      } else if (successCount > 0) {
        showAlert({
          type: "error",
          title: "Xóa một phần",
          message: `Đã xóa ${successCount} sân, thất bại: ${failedIds.join(", ")}`,
          autoCloseMs: 2600,
        });
      } else {
        showAlert({
          type: "error",
          title: "Xóa sân thất bại",
          message: `Không thể xóa các sân đã chọn: ${failedIds.join(", ")}`,
        });
      }

      closeDeleteConfirm();
      setSelectedCourtIds((prev) => prev.filter((id) => !idsToDelete.includes(id)));
      fetchCourts();
    } catch (err) {
      showAlert({ type: "error", title: "Xóa sân thất bại", message: err.response?.data?.message || "Lỗi khi xóa sân" });
      closeDeleteConfirm();
    }
  };

  const toggleSelectCourt = (MaSan) => {
    setSelectedCourtIds((prev) =>
      prev.includes(MaSan) ? prev.filter((id) => id !== MaSan) : [...prev, MaSan]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await axios.put(`${API}/update/${formData.MaSan}`, formData);
        showAlert({ type: "success", title: "Cập nhật thành công", message: "Đã lưu thông tin sân." });
      } else {
        await axios.post(`${API}/create`, formData);
        showAlert({ type: "success", title: "Thêm sân thành công", message: "Đã tạo sân mới." });
      }
      fetchCourts();
      setShowForm(false);
    } catch (err) {
      console.error("❌ Lỗi khi lưu:", err);
      showAlert({ type: "error", title: "Lưu thất bại", message: err.response?.data?.message || "Lỗi khi lưu sân" });
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Filter based on search term
  const filteredCourts = courts.filter(court => 
    court.MaSan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    court.TenSan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    court.LoaiSan?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAllFilteredSelected =
    filteredCourts.length > 0 && filteredCourts.every((court) => selectedCourtIds.includes(court.MaSan));

  const toggleSelectAllFiltered = () => {
    const filteredIds = filteredCourts.map((court) => court.MaSan);
    if (isAllFilteredSelected) {
      setSelectedCourtIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
      return;
    }
    setSelectedCourtIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
  };

  return (
    <div className="qlsan-app">
      <Sidebar />
      <div className="qlsan-container">
        <div className="qlsan-header">
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="4"></circle>
              <line x1="12" y1="2" x2="12" y2="6"></line>
              <line x1="12" y1="18" x2="12" y2="22"></line>
              <line x1="2" y1="12" x2="6" y2="12"></line>
              <line x1="18" y1="12" x2="22" y2="12"></line>
            </svg>
            Quản lý sân Pickleball
          </h2>
        </div>

        {/* Stats */}
        <div className="qlsan-stats">
          <div className="stat-item">
            <span className="stat-number">{courts.length}</span>
            <span className="stat-label">Tổng số sân</span>
          </div>
          <div className="stat-item vip">
            <span className="stat-number">{courts.filter(c => c.LoaiSan === 'VIP').length}</span>
            <span className="stat-label">Sân VIP</span>
          </div>
          <div className="stat-item normal">
            <span className="stat-number">{courts.filter(c => c.LoaiSan === 'Thường').length}</span>
            <span className="stat-label">Sân thường</span>
          </div>
          <div className="stat-item active">
            <span className="stat-number">{courts.filter(c => c.TrangThai === 'Hoạt động').length}</span>
            <span className="stat-label">Đang hoạt động</span>
          </div>
        </div>

        {/* Search & Add */}
        <div className="qlsan-toolbar">
          <div className="qlsan-search">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Tìm theo mã sân, tên sân, loại sân..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="qlsan-toolbar-actions">
            <button
              className="qlsan-btn-clear-selection"
              onClick={() => setSelectedCourtIds([])}
              disabled={selectedCourtIds.length === 0}
            >
              Bỏ chọn
            </button>
            <button
              className="qlsan-btn-delete-selected"
              onClick={() => openDeleteConfirm(selectedCourtIds)}
              disabled={selectedCourtIds.length === 0}
            >
              Xóa sân ({selectedCourtIds.length})
            </button>
            <button className="qlsan-btn-add" onClick={handleAdd}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Thêm sân mới
            </button>
          </div>
        </div>

        {/* Courts Table */}
        <div className="qlsan-table-wrapper">
          <table className="qlsan-table">
            <thead>
              <tr>
                <th className="qlsan-col-select">
                  <input
                    type="checkbox"
                    checked={isAllFilteredSelected}
                    onChange={toggleSelectAllFiltered}
                    aria-label="Chọn tất cả sân đang hiển thị"
                  />
                </th>
                <th>Mã sân</th>
                <th>Tên sân</th>
                <th>Loại sân</th>
                <th>Giá trước 16h</th>
                <th>Giá sau 16h</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourts.length > 0 ? (
                filteredCourts.map((court) => (
                  <tr key={court.MaSan}>
                    <td className="qlsan-col-select">
                      <input
                        type="checkbox"
                        checked={selectedCourtIds.includes(court.MaSan)}
                        onChange={() => toggleSelectCourt(court.MaSan)}
                        aria-label={`Chọn sân ${court.MaSan}`}
                      />
                    </td>
                    <td><strong>{court.MaSan}</strong></td>
                    <td>{court.TenSan}</td>
                    <td>
                      <span className={`qlsan-type-badge ${court.LoaiSan === 'VIP' ? 'vip' : 'normal'}`}>
                        {court.LoaiSan === 'VIP' ? '⭐ VIP' : court.LoaiSan}
                      </span>
                    </td>
                    <td>{formatCurrency(court.GiaThueTruoc16)}</td>
                    <td>{formatCurrency(court.GiaThueSau16)}</td>
                    <td>
                      <span className={`qlsan-status-badge ${court.TrangThai === 'Hoạt động' ? 'active' : 'inactive'}`}>
                        {court.TrangThai}
                      </span>
                    </td>
                    <td>
                      <button className="qlsan-btn-edit" onClick={() => handleEdit(court)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Sửa
                      </button>
                      <button className="qlsan-btn-delete" onClick={() => handleDelete(court.MaSan)}>
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
                  <td colSpan="9" className="text-center">Không có sân nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* VIP Info */}
        <div className="qlsan-vip-info">
          <h3>🏆 Thông tin sân VIP</h3>
          <p>Sân VIP được thiết kế với giá cao hơn để khách hàng được trải nghiệm:</p>
          <ul>
            <li>✨ Vợt Pickleball cao cấp (JOOLA, Selkirk...)</li>
            <li>✨ Không gian riêng tư, thoáng mát</li>
            <li>✨ Phục vụ nước uống miễn phí</li>
            <li>✨ Ưu tiên đặt sân trong giờ cao điểm</li>
          </ul>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="qlsan-modal-overlay" onClick={() => setShowForm(false)}>
            <div className="qlsan-modal" onClick={e => e.stopPropagation()}>
              <div className="qlsan-modal-header">
                <h3>{isEdit ? '✏️ Sửa thông tin sân' : '➕ Thêm sân mới'}</h3>
                <button className="qlsan-modal-close" onClick={() => setShowForm(false)}>×</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="qlsan-form-group">
                  <label>Mã sân *</label>
                  <input
                    type="text"
                    value={formData.MaSan}
                    onChange={(e) => setFormData({...formData, MaSan: e.target.value})}
                    disabled={isEdit}
                    required
                    placeholder="VD: S1, S2..."
                  />
                </div>
                <div className="qlsan-form-group">
                  <label>Tên sân *</label>
                  <input
                    type="text"
                    value={formData.TenSan}
                    onChange={(e) => setFormData({...formData, TenSan: e.target.value})}
                    required
                    placeholder="VD: Sân 1, Sân VIP..."
                  />
                </div>
                <div className="qlsan-form-group">
                  <label>Loại sân</label>
                  <select
                    value={formData.LoaiSan}
                    onChange={(e) => {
                      const loai = e.target.value;
                      setFormData({
                        ...formData, 
                        LoaiSan: loai,
                        GiaThueTruoc16: loai === 'VIP' ? 150000 : 100000,
                        GiaThueSau16: loai === 'VIP' ? 200000 : 160000
                      });
                    }}
                  >
                    <option value="Thường">Thường</option>
                    <option value="VIP">VIP ⭐</option>
                  </select>
                </div>
                <div className="qlsan-form-row">
                  <div className="qlsan-form-group">
                    <label>Giá thuê trước 16h (VNĐ)</label>
                    <input
                      type="number"
                      value={formData.GiaThueTruoc16}
                      onChange={(e) => setFormData({...formData, GiaThueTruoc16: parseInt(e.target.value)})}
                      min="0"
                      step="10000"
                    />
                  </div>
                  <div className="qlsan-form-group">
                    <label>Giá thuê sau 16h (VNĐ)</label>
                    <input
                      type="number"
                      value={formData.GiaThueSau16}
                      onChange={(e) => setFormData({...formData, GiaThueSau16: parseInt(e.target.value)})}
                      min="0"
                      step="10000"
                    />
                  </div>
                </div>
                <div className="qlsan-form-group">
                  <label>Trạng thái</label>
                  <select
                    value={formData.TrangThai}
                    onChange={(e) => setFormData({...formData, TrangThai: e.target.value})}
                  >
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Bảo trì">Bảo trì</option>
                    <option value="Ngừng hoạt động">Ngừng hoạt động</option>
                  </select>
                </div>
                <div className="qlsan-form-actions">
                  <button type="button" className="qlsan-btn-cancel" onClick={() => setShowForm(false)}>Hủy</button>
                  <button type="submit" className="qlsan-btn-save">{isEdit ? 'Cập nhật' : 'Thêm sân'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {confirmDeleteModal.open && (
          <div className="qlsan-confirm-overlay" onClick={closeDeleteConfirm}>
            <div className="qlsan-confirm-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Xác nhận xóa sân</h3>
              <p>
                {confirmDeleteModal.ids.length === 1
                  ? `Bạn có chắc muốn xóa vĩnh viễn sân ${confirmDeleteModal.ids[0]}?`
                  : `Bạn có chắc muốn xóa vĩnh viễn ${confirmDeleteModal.ids.length} sân đã chọn?`}
              </p>
              <div className="qlsan-confirm-actions">
                <button type="button" className="qlsan-btn-cancel" onClick={closeDeleteConfirm}>
                  Hủy
                </button>
                <button type="button" className="qlsan-btn-confirm-delete" onClick={executeDelete}>
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
