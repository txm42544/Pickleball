import { useState, useEffect } from "react";
import axios from "axios";
import "../../css/PendingBookingModal.css";

export function CheckSanNgay() {
  const { pendingBookings: initialBookings = [] } = location.state || {};

  const [bookings, setBookings] = useState(initialBookings);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (bookings.length === 0) {
      axios
        .get("/api/admin/san")
        .then((res) => {
          const pending = res.data
            .flatMap((san) => san.bookedSlots || [])
            .filter((b) => b.TrangThai === "pending");
          setBookings(pending);
        })
        .catch((err) => console.log(err));
    }
  }, []);


  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAccept = (bookingId) => {
    axios
      .post("/api/admin/datsan/accept", { MaDatSan: bookingId })
      .then(() => {
        // Xóa booking vừa chấp nhận khỏi danh sách
        setBookings((prev) => prev.filter((b) => b.MaDatSan !== bookingId));
        setSelectedIds((prev) => prev.filter((id) => id !== bookingId));
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="pending-modal">
      <div className="pending-modal-content">
        <div className="modal-header">
          <h3>Danh sách sân pending</h3>
        </div>

        <table className="pending-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={
                    bookings.length > 0 &&
                    selectedIds.length === bookings.length
                  }
                  onChange={(e) =>
                    e.target.checked
                      ? setSelectedIds(bookings.map((b) => b.MaDatSan))
                      : setSelectedIds([])
                  }
                />
              </th>
              <th>MaDatSan</th>
              <th>MaSan</th>
              <th>MaKH</th>
              <th>NgayLap</th>
              <th>GioVao</th>
              <th>GioRa</th>
              <th>TongTien</th>
              <th>Payment Screenshot</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.MaDatSan}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(b.MaDatSan)}
                    onChange={() => toggleSelect(b.MaDatSan)}
                  />
                </td>
                <td>{b.MaDatSan}</td>
                <td>{b.MaSan}</td>
                <td>{b.MaKH}</td>
                <td>{b.NgayLap?.split("T")[0]}</td>
                <td>{b.GioVao}</td>
                <td>{b.GioRa}</td>
                <td>{b.TongTien?.toLocaleString("vi-VN")} đ</td>
                <td>
                  {b.PaymentScreenshot ? (
                    <img
                      src={b.PaymentScreenshot}
                      alt="Payment"
                      className="payment-img"
                    />
                  ) : (
                    "Chưa có"
                  )}
                </td>
                <td>
                  <button
                    className="accept-btn"
                    onClick={() => handleAccept(b.MaDatSan)}
                  >
                    Chấp nhận
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
