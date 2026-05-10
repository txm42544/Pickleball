import { useNavigate } from "react-router-dom";

export function ChiTietXeVe() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 24 }}>
      <h2>Chức năng "Xé vé / Sự kiện" đã bị gỡ bỏ</h2>
      <p>Nội dung chi tiết sự kiện không còn khả dụng.</p>
      <button className="btn" onClick={() => navigate('/')}>Quay về Trang chủ</button>
    </div>
  )
}
