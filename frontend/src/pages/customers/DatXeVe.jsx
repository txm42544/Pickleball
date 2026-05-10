import { useNavigate } from "react-router-dom";

export function DatXeVe() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 24 }}>
      <h2>Chức năng "Xé vé / Sự kiện" đã bị gỡ bỏ</h2>
      <p>Rất tiếc, mục mua vé/sự kiện không còn được hỗ trợ trong phiên bản này.</p>
      <button className="btn" onClick={() => navigate('/')}>Quay về Trang chủ</button>
    </div>
  )
}
