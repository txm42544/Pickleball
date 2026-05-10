import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/QuanLyNhaCungCap.css';
import { Sidebar } from '../../components/Sidebar';
import { apiFetch } from '../../utils/api';

const API_BASE = '/api/admin';

const QuanLyNhaCungCap = () => {
  const navigate = useNavigate();
  const [nhaCungCap, setNhaCungCap] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tenMoi, setTenMoi] = useState('');
  const [dangThem, setDangThem] = useState(false);

  const fetchNhaCungCap = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`${API_BASE}/nhacungcap`);
      const data = await response.json();
      setNhaCungCap(data.data || []);
    } catch (err) {
      console.error('Lỗi tải nhà cung cấp:', err);
      setError('Không thể tải danh sách nhà cung cấp');
    } finally {
      setLoading(false);
    }
  };

  const themNhaCungCap = async (ten) => {
    try {
      const response = await apiFetch(`${API_BASE}/nhacungcap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ten })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Lỗi khi thêm nhà cung cấp');
      }

      await fetchNhaCungCap();
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const xoaNhaCungCap = async (id) => {
    try {
      const response = await apiFetch(`${API_BASE}/nhacungcap/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Lỗi khi xóa nhà cung cấp');
      }

      await fetchNhaCungCap();
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchNhaCungCap();
  }, []);

  const handleThemNhaCungCap = async (e) => {
    e.preventDefault();
    if (!tenMoi.trim()) return;

    setDangThem(true);
    const result = await themNhaCungCap(tenMoi.trim());
    setDangThem(false);

    if (result.success) {
      setTenMoi('');
    }
  };

  const handleXoaNhaCungCap = async (id, ten) => {
    if (window.confirm(`Bạn có chắc muốn xóa nhà cung cấp "${ten}"?`)) {
      await xoaNhaCungCap(id);
    }
  };

  return (
    <div className="ncc-container">
       <Sidebar />
      <div className="ncc-content">
        <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/nhaphang')}>
          ← Quay lại
        </button>
        <h1>Quản Lý Nhà Cung Cấp</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="card">
        <h3>Thêm nhà cung cấp mới</h3>
        <form onSubmit={handleThemNhaCungCap} className="form-them-moi">
          <div className="form-group">
            <input
              type="text"
              placeholder="Nhập tên nhà cung cấp..."
              value={tenMoi}
              onChange={(e) => setTenMoi(e.target.value)}
              disabled={dangThem}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary-ncc"
            disabled={!tenMoi.trim() || dangThem}
          >
            {dangThem ? 'Đang thêm...' : '➕ Thêm'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Danh sách nhà cung cấp ({nhaCungCap.length})</h3>
        
        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : nhaCungCap.length === 0 ? (
          <div className="empty-state">
            <p>Chưa có nhà cung cấp nào</p>
          </div>
        ) : (
          <div className="nha-cung-cap-grid">
            {nhaCungCap.map((ncc) => (
              <div key={ncc.id} className="nha-cung-cap-card">
                <div className="ncc-info">
                  <h4>{ncc.ten}</h4>
                  <span className="ncc-date">
                    Thêm: {new Date(ncc.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleXoaNhaCungCap(ncc.id, ncc.ten)}
                  title="Xóa nhà cung cấp"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default QuanLyNhaCungCap;