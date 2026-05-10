import React, { useEffect, useState } from "react";
import "../../css/DatSanNgay.css";
import { Sidebar } from "../../components/Sidebar";
import { Link } from "react-router";
import { useNavigate } from "react-router"; // thêm đầu file
import { useAlert } from "../../context/AlertContext";

export function DatSanNgay() {
  const [bookingActionLoading, setBookingActionLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null); // booking để hiển thị form
  const [showCancelConfirmPopup, setShowCancelConfirmPopup] = useState(false);

  //   const currentUser =
  //   JSON.parse(localStorage.getItem("user")) ||
  //   JSON.parse(localStorage.getItem("khach"));

  // if (currentUser?.role === "Nhân viên" || currentUser?.role === "Quản lý") {
  //   console.log("Mã nhân viên:", currentUser.maNV);
  // }
  // else if (currentUser?.id && !currentUser?.maNV) {
  //   console.log("👉 Khách hàng:");
  //   console.log("Mã khách hàng:", currentUser.id);
  //   console.log("Tên KH:", currentUser.TenKh);
  //   console.log("SĐT:", currentUser.SDT);
  // }
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [maNguoiDung, setMaNguoiDung] = useState("");
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const openingHour = 5;
  const closingHour = 24;
  const slotMinutes = 60;
  const VIP_PRICE_FACTOR = 1.15;
  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const currentUser =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(localStorage.getItem("khach"));

    // 🔐 Nếu chưa login, redirect về login
    if (!currentUser) {
      showAlert({ type: "error", title: "Chưa đăng nhập", message: "Vui lòng đăng nhập trước khi đặt sân!" });
      navigate("/login");
      return;
    }

    let role = "";
    let maNguoiDung = "";

    if (currentUser?.role === "Nhân viên" || currentUser?.role === "Quản lý") {
      role = "nhanvien";
      maNguoiDung = currentUser.maNV;
      console.log("🔹 Đang đăng nhập với vai trò:", currentUser.role);
      console.log("Mã nhân viên:", maNguoiDung);
    } else if (currentUser?.MaKH) {
      // ✅ sửa từ currentUser.id => currentUser.MaKH
      role = "khachhang";
      maNguoiDung = currentUser.MaKH; // ✅ sửa từ currentUser.id => currentUser.MaKH
      console.log("🔹 Khách hàng đăng nhập:");
      console.log("Mã KH:", maNguoiDung);
      console.log("Tên KH:", currentUser.TenKh);
      console.log("SĐT:", currentUser.SDT);
    }

    setUser(currentUser);
    setRole(role);
    setMaNguoiDung(maNguoiDung);
  }, []);

  const [courts, setCourts] = useState([]);
  const [bookedSlots, setBookedSlots] = useState({});
  const [monthlySlots, setMonthlySlots] = useState({});
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [total, setTotal] = useState(0);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  // 🔹 Giả lập role và mã khách hàng (sau này sẽ lấy từ API đăng nhập)

  const API_BASE = "/api/admin/san";

  const timeSlots = () => {
    const total = (closingHour - openingHour) * (60 / slotMinutes);
    return Array.from({ length: total }, (_, i) => i);
  };

  const slotToLabel = (i) => {
    const minutes = openingHour * 60 + i * slotMinutes;
    const h = String(Math.floor(minutes / 60)).padStart(2, "0");
    const m = String(minutes % 60).padStart(2, "0");
    return `${h}:${m}`;
  };

  // Hiển thị dải giờ rõ ràng (vd: 05:00-06:00)
  const slotRangeLabel = (i) => `${slotToLabel(i)}-${slotToLabel(i + 1)}`;

  const getCourtNumber = (maSan) => {
    const parsed = parseInt(String(maSan || "").replace(/\D/g, ""), 10);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const formatCourtLabel = (court, index) => {
    const courtNumber = getCourtNumber(court?.MaSan) ?? index + 1;
    const isVipSix =
      court?.LoaiSan === "VIP" || courtNumber === 6 || index === 5;
    // Luôn hiển thị SÂN VIP 1 cho sân số 6
    if (isVipSix) {
      return "SÂN VIP 1";
    }
    return court?.TenSan?.trim() || `Sân ${courtNumber}`;
  };

  const normalizeStatus = (status) =>
    String(status || "")
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d");

  const isCancelledStatus = (status) => {
    const normalized = normalizeStatus(status);
    return normalized.includes("huy") || normalized.includes("cancel");
  };

  const isAcceptedStatus = (status) => {
    const normalized = normalizeStatus(status);
    return (
      normalized.includes("hoat dong") ||
      normalized.includes("accepted") ||
      normalized.includes("da xac nhan") ||
      normalized.includes("da dat san")
    );
  };

  const isPendingStatus = (status) => {
    const normalized = normalizeStatus(status);
    return normalized.includes("pending") || normalized.includes("cho xac nhan");
  };

  const isMonthlyBookingType = (bookingType) => {
    const normalized = String(bookingType || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    return normalized.includes("thang");
  };

  const fetchDatSanThang = async (date, courtsArg = []) => {
    try {
      // 🔹 Chuẩn hóa ngày hiện tại
      const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        if (isNaN(d)) return dateStr;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const dateFormatted = formatDate(date.split("T")[0]);

      // 🔹 Lấy danh sách sân tháng từ API
      const res = await fetch(`/api/admin/santhang/list?_ts=${Date.now()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Lỗi khi lấy danh sách đặt sân tháng");
      const result = await res.json();
      const data = Array.isArray(result) ? result : result.data || [];

      if (!Array.isArray(data)) {
        console.error("⚠️ API không trả về mảng hợp lệ:", result);
        return;
      }

      const mapThang = {};
      const allSanThang = [];

      for (const item of data) {
        if (isCancelledStatus(item.TrangThai)) {
          continue; // bỏ qua sân tháng đã hủy
        }

        // ADMIN: Bên đặt sân ngày chỉ hiển thị sân tháng đã được xác nhận
        if (!isAcceptedStatus(item.TrangThai)) {
          continue;
        }

        // --- Parse danh sách ngày ---
        let danhSachNgay = [];
        try {
          if (!item.DanhSachNgay) danhSachNgay = [];
          else if (Array.isArray(item.DanhSachNgay))
            danhSachNgay = item.DanhSachNgay;
          else danhSachNgay = JSON.parse(item.DanhSachNgay);
        } catch {
          // fallback nếu JSON parse lỗi
          danhSachNgay = (item.DanhSachNgay || "")
            .replace(/[\[\]"]/g, "")
            .split(",")
            .map((x) => x.trim());
        }

        // 🔹 Chuẩn hóa toàn bộ ngày
        const ngayKhongGio = danhSachNgay.map(formatDate);
        const isTodayIncluded = ngayKhongGio.includes(dateFormatted);

        // --- Parse danh sách sân ---
        let danhSachSan = [];
        try {
          if (!item.DanhSachSan) danhSachSan = [];
          else if (Array.isArray(item.DanhSachSan))
            danhSachSan = item.DanhSachSan;
          else danhSachSan = JSON.parse(item.DanhSachSan);
        } catch {
          danhSachSan = (item.DanhSachSan || "")
            .replace(/[\[\]"]/g, "")
            .split(",")
            .map((s) => s.trim());
        }

        // --- Lưu toàn bộ dữ liệu để debug ---
        allSanThang.push({
          MaDatSanThang: item.MaDatSanThang,
          DanhSachSan: danhSachSan,
          DanhSachNgay: ngayKhongGio,
          GioBatDau: item.GioBatDau,
          GioKetThuc: item.GioKetThuc,
          TrangThai: item.TrangThai,
          GhiChu: item.GhiChu,
        });

        // --- Chỉ render nếu ngày đang chọn nằm trong danh sách ---
        if (!isTodayIncluded) continue;

        // --- Xác định vị trí slot ---
        const [startH, startM] = (item.GioBatDau || "00:00:00")
          .split(":")
          .map(Number);
        const [endH, endM] = (item.GioKetThuc || "00:00:00")
          .split(":")
          .map(Number);
        const startIndex = Math.floor(
          (startH * 60 + startM - openingHour * 60) / slotMinutes
        );
        const endIndex = Math.floor(
          (endH * 60 + endM - openingHour * 60) / slotMinutes
        );

        danhSachSan.forEach((san) => {
          const courtNum = san.replace(/\D/g, "");
          const ci = courtsArg.findIndex(
            (c) => c.MaSan.replace(/\D/g, "") === courtNum
          );
          if (ci === -1) return;
          if (!mapThang[ci]) mapThang[ci] = [];

          mapThang[ci].push({
            start: startIndex,
            end: endIndex,
            khach: item.GhiChu || "Khách tháng",
            MaDatSanThang: item.MaDatSanThang,
            TrangThai: item.TrangThai,
          });
        });
      }

      // 🔹 Cập nhật state (sau khi xử lý toàn bộ)
      setMonthlySlots(mapThang);
      setAllMonthlyData?.(allSanThang);
    } catch (err) {
      console.error("❌ Lỗi khi lấy sân tháng:", err);
    }
  };

  // 🔹 Lấy danh sách sân + sự kiện
  const fetchCourts = async (date) => {
    try {
      const resCourts = await fetch(`${API_BASE}?date=${date}`);
      if (!resCourts.ok) throw new Error("Lỗi khi lấy danh sách sân");
      let courtsData = await resCourts.json();

      // sắp xếp theo thứ tự sân
      const lower = courtsData.filter((c) => +c.MaSan.replace(/\D/g, "") < 10);
      const higher = courtsData.filter(
        (c) => +c.MaSan.replace(/\D/g, "") >= 10
      );
      courtsData = [...lower, ...higher]
        .filter((c) => c.TrangThai === "Hoạt động")
        .map((court, idx) => {
          const courtNumber = getCourtNumber(court.MaSan) ?? idx + 1;
          const isVip = court.LoaiSan === "VIP";
          return {
            ...court,
            LoaiSan: isVip ? "VIP" : "Thường",
            TenSan: court.TenSan?.trim() || court.MaSan || `Sân ${courtNumber}`,
          };
        });
      setCourts(courtsData);

      // map lịch đặt sân
      const booked = {};
      courtsData.forEach((court, ci) => {
        booked[ci] = [];
        if (court.bookedSlots) {
          court.bookedSlots.forEach((slot) => {
            if (isCancelledStatus(slot.TrangThai)) return;
            if (isMonthlyBookingType(slot.LoaiDat) && !isAcceptedStatus(slot.TrangThai)) return;
            const [startH, startM] = slot.GioVao.split(":").map(Number);
            const [endH, endM] = slot.GioRa.split(":").map(Number);
            const startIndex = Math.floor(
              (startH * 60 + startM - openingHour * 60) / slotMinutes
            );
            const endIndex = Math.floor(
              (endH * 60 + endM - openingHour * 60) / slotMinutes
            );
            for (let i = startIndex; i < endIndex; i++) booked[ci].push(i);
          });
        }
      });
      setBookedSlots(booked);

      await fetchDatSanThang(date, courtsData);
    } catch (err) {
      console.error("❌ Lỗi lấy dữ liệu sân/booked:", err);
    }
  };

  useEffect(() => {
    fetchCourts(selectedDate);
  }, [selectedDate]);

  // ✅ Lấy giá theo giờ
  const getPrice = (court, slotIndex) => {
    const hour = openingHour + slotIndex;
    const base =
      hour >= 16
        ? Number(court.GiaThueSau16) || 0
        : Number(court.GiaThueTruoc16) || 0;
    const isVip = court?.LoaiSan === "VIP";
    return Math.round(isVip ? base * VIP_PRICE_FACTOR : base);
  };

  // ✅ Xử lý chọn/hủy slot
  const handleSlotClick = (ci, slotIndex) => {
    if (role !== "khachhang") return;
    const key = `${ci}-${slotIndex}`;
    const court = courts[ci];
    const price = getPrice(court, slotIndex);

    const hasMonthlyLock = monthlySlots[ci]?.some(
      (slot) => slotIndex >= slot.start && slotIndex < slot.end
    );
    if (hasMonthlyLock) return;
    if (bookedSlots[ci]?.includes(slotIndex)) return;

    let newSelected = [...selectedSlots];
    let newTotal = total;

    if (newSelected.includes(key)) {
      // Hủy chọn
      newSelected = newSelected.filter((k) => k !== key);
      newTotal -= price;
    } else {
      // Chọn mới
      newSelected.push(key);
      newTotal += price;
    }

    setSelectedSlots(newSelected);
    setTotal(newTotal);
  };

  // 🔹 Vẽ lưới hiển thị sân (gộp booked theo khách + sự kiện)
  const buildGrid = () => {
    const now = new Date();
    const currentDate = now.toISOString().split("T")[0]; // yyyy-mm-dd hiện tại
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const gridEl = document.getElementById("grid");
    if (!gridEl) return;
    gridEl.innerHTML = "";

    const slots = timeSlots();

    // Header
    const headWrapper = document.createElement("div");
    headWrapper.className = "grid-head-wrapper";
    const head = document.createElement("div");
    head.className = "grid-head";

    const blank = document.createElement("div");
    blank.className = "hcell side";
    blank.textContent = "Sân / Giờ";
    head.appendChild(blank);

    slots.forEach((i) => {
      const h = document.createElement("div");
      h.className = "hcell";
      h.textContent = slotRangeLabel(i);
      head.appendChild(h);
    });
    headWrapper.appendChild(head);
    gridEl.appendChild(headWrapper);

    // Rows
    const rowsWrapper = document.createElement("div");
    rowsWrapper.className = "grid-rows-wrapper";

    courts.forEach((court, ci) => {
      const row = document.createElement("div");
      row.className = "row";

      const side = document.createElement("div");
      side.className = "cell side";
      if (court.LoaiSan === "VIP") {
        side.classList.add("vip-court-label");
        side.textContent = `⭐ ${formatCourtLabel(court, ci)}`;
      } else {
        side.textContent = formatCourtLabel(court, ci);
      }
      row.appendChild(side);

      for (let i = 0; i < slots.length; i++) {
        const key = `${ci}-${i}`;

        // Kiểm tra sân tháng
        const thangSlot = monthlySlots[ci]?.find(
          (m) => i >= m.start && i < m.end
        );
        if (thangSlot) {
          if (i === thangSlot.start) {
            const thangCell = document.createElement("div");
            thangCell.className = "cell slot month";
            thangCell.textContent = isPendingStatus(thangSlot.TrangThai)
              ? "Chờ xác nhận"
              : "Đã đặt sân";
            thangCell.style.gridColumn = `span ${
              thangSlot.end - thangSlot.start
            }`;
            thangCell.style.textAlign = "center";
            thangCell.title = isPendingStatus(thangSlot.TrangThai)
              ? "Chờ xác nhận"
              : "Đã đặt sân";
            row.appendChild(thangCell);
          }
          continue;
        }

        // Kiểm tra booked
        const bookedSlot = court.bookedSlots?.find((b) => {
          if (isCancelledStatus(b.TrangThai)) return false;
          if (isMonthlyBookingType(b.LoaiDat) && !isAcceptedStatus(b.TrangThai)) return false;
          const [startH, startM] = b.GioVao.split(":").map(Number);
          const [endH, endM] = b.GioRa.split(":").map(Number);
          const startIndex = Math.floor(
            (startH * 60 + startM - openingHour * 60) / slotMinutes
          );
          const endIndex = Math.floor(
            (endH * 60 + endM - openingHour * 60) / slotMinutes
          );
          return i >= startIndex && i < endIndex;
        });

if (bookedSlot) {
  if (i === Math.floor((bookedSlot.GioVao.split(":")[0]*60 + Number(bookedSlot.GioVao.split(":")[1]) - openingHour*60)/slotMinutes)) {
    const [startH, startM] = bookedSlot.GioVao.split(":").map(Number);
    const [endH, endM] = bookedSlot.GioRa.split(":").map(Number);
    const startIndex = Math.floor((startH*60 + startM - openingHour*60)/slotMinutes);
    const endIndex = Math.floor((endH*60 + endM - openingHour*60)/slotMinutes);

    const bookedCell = document.createElement("div");
    bookedCell.className = "cell slot booked";
    bookedCell.style.gridColumn = `span ${endIndex - startIndex}`;
    bookedCell.style.borderRight = "1px solid #fff";
    bookedCell.style.position = "relative";
    bookedCell.title = `Đã đặt: ${bookedSlot.GioVao?.slice(0,5)}-${bookedSlot.GioRa?.slice(0,5)} • ${bookedSlot.KhachHang || "Khách"}`;

    // 🔹 Role khác nhau
if (role === "khachhang") {
  if (isPendingStatus(bookedSlot.TrangThai)) {
    bookedCell.textContent = "Chờ xác nhận";
  } else if (bookedSlot.MaKH !== maNguoiDung) {
    bookedCell.textContent = "Đã đặt";
  } else {
    bookedCell.textContent = bookedSlot.KhachHang || "Bạn";
    bookedCell.style.cursor = "pointer";
    bookedCell.addEventListener("click", () =>
      setSelectedBooking(bookedSlot)
    );
  }
} else {
  // Nhân viên/quản lý hiển thị tên khách
  bookedCell.textContent = isPendingStatus(bookedSlot.TrangThai)
    ? `${bookedSlot.KhachHang || "Khách"} (Chờ xác nhận)`
    : (bookedSlot.KhachHang || "");
  bookedCell.style.cursor = "pointer";
  bookedCell.addEventListener("click", () => setSelectedBooking(bookedSlot));
}

    row.appendChild(bookedCell);
  }
  continue;
}


        // Ô trống để chọn
        const cell = document.createElement("div");
        cell.dataset.court = ci;
        cell.dataset.slot = i;

        const price = getPrice(court, i);
        cell.title = `${slotRangeLabel(i)} • ${price.toLocaleString("vi-VN")} đ/giờ`;

        // Kiểm tra slot quá hạn
        const slotStartMinutes = openingHour * 60 + i * slotMinutes;
        const now = new Date();
        const currentDate = now.toISOString().split("T")[0];
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const selected = new Date(selectedDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // reset giờ phút giây
        selected.setHours(0, 0, 0, 0);

        if (selected < today) {
          // Ngày đã qua, vẫn khóa để tránh đặt lùi ngày
          cell.className = "cell slot past";
          cell.style.backgroundColor = "#cccccc";
          cell.title = "Ngày đã qua - không thể đặt";
        } else {
          // Cho phép đặt cả các ô trước giờ hiện tại (bỏ chặn tô xám do sự kiện)
          const classes = ["cell", "slot", "avail"];
          cell.className = classes.join(" ");
          cell.addEventListener("click", () => handleSlotClick(ci, i));
          if (selectedSlots.includes(key)) {
            cell.classList.add("selected-slot");
            cell.textContent = `${price.toLocaleString("vi-VN")} đ`;
            cell.title = `Đã chọn: ${slotRangeLabel(i)} • ${price.toLocaleString("vi-VN")} đ`;
          }
        }

        row.appendChild(cell);
      }

      rowsWrapper.appendChild(row);
    });

    gridEl.appendChild(rowsWrapper);
  };

  useEffect(() => {
    if (courts.length > 0) buildGrid();
  }, [courts, bookedSlots, selectedSlots, monthlySlots]);

  const selectedDetails = selectedSlots
    .map((key) => {
      const [ci, slotIndex] = key.split("-").map(Number);
      const court = courts[ci];
      if (!court) return null;
      const price = getPrice(court, slotIndex);
      const startLabel = slotToLabel(slotIndex);
      const endLabel = slotToLabel(slotIndex + 1);
      return {
        key,
        courtName: formatCourtLabel(court, ci),
        price,
        timeRange: `${startLabel} - ${endLabel}`,
        isVip: court?.LoaiSan === "VIP",
      };
    })
    .filter(Boolean);

  const handleDateChange = (e) => {
    const value = e.target.value;
    if (role === "khachhang") {
      const chosen = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      chosen.setHours(0, 0, 0, 0);
      if (chosen < today) {
        setSelectedDate(todayStr);
        showAlert({ type: "error", title: "Ngày không hợp lệ", message: "Khách hàng chỉ xem/đặt từ hôm nay trở đi." });
        return;
      }
    }
    setSelectedDate(value);
    setSelectedSlots([]);
    setTotal(0);
  };

  const setQuickDate = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const value = d.toISOString().split("T")[0];
    setSelectedDate(value);
    setSelectedSlots([]);
    setTotal(0);
  };

  const handleConfirm = () => {
    if (role !== "khachhang") {
      showAlert({ type: "error", title: "Không được phép", message: "Admin chỉ có thể xác nhận hoặc hủy booking." });
      return;
    }
    if (selectedSlots.length === 0) {
      showAlert({ type: "error", title: "Thiếu chọn sân", message: "Vui lòng chọn ít nhất 1 ô sân!" });
      return;
    }

    // tạo dữ liệu để gửi sang XacNhanDatSan
    const bookingData = {
      date: selectedDate,
      selectedSlots: selectedSlots.map((key) => {
        const [ci, slotIndex] = key.split("-").map(Number);
        return { courtIndex: ci, slotIndex };
      }),
      bookingType: "Đặt sân ngày",
      role: role,
      maNguoiDung: maNguoiDung,
    };

    // lưu vào localStorage để XacNhanDatSan đọc
    localStorage.setItem("bookingData", JSON.stringify(bookingData));

    // navigate sang trang xác nhận
    navigate("/xacnhansan");
  };

  const handleAdminAcceptBooking = async () => {
    if (!selectedBooking?.MaDatSan || bookingActionLoading) return;
    try {
      setBookingActionLoading(true);
      const res = await fetch(`${API_BASE}/accept`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ MaDatSan: selectedBooking.MaDatSan }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message || "Không thể xác nhận booking.");

      showAlert({ type: "success", title: "Đã xác nhận", message: "Đã xác nhận booking." });
      setSelectedBooking(null);
      await fetchCourts(selectedDate);
    } catch (err) {
      console.error(err);
      showAlert({ type: "error", title: "Lỗi xác nhận", message: err.message || "Không thể xác nhận booking." });
    } finally {
      setBookingActionLoading(false);
    }
  };

  const handleAdminCancelBooking = async () => {
    if (!selectedBooking?.MaDatSan || bookingActionLoading) return;
    setShowCancelConfirmPopup(true);
  };

  const handleAdminCancelBookingConfirmed = async () => {
    if (!selectedBooking?.MaDatSan || bookingActionLoading) return;

    try {
      setBookingActionLoading(true);
      const res = await fetch(`${API_BASE}/cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ MaDatSan: selectedBooking.MaDatSan }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.message || "Không thể hủy booking.");

      showAlert({ type: "success", title: "Đã hủy", message: "Đã hủy booking." });
      setShowCancelConfirmPopup(false);
      setSelectedBooking(null);
      await fetchCourts(selectedDate);
    } catch (err) {
      console.error(err);
      showAlert({ type: "error", title: "Lỗi hủy sân", message: err.message || "Không thể hủy booking." });
    } finally {
      setBookingActionLoading(false);
    }
  };

  const BASE_URL = ""; // port backend của bạn

  return (
    <div className="sanngay-container">
      {role !== "khachhang" && <Sidebar />}

      {/* Modal thông tin booking cho quản lý */}
      {selectedBooking && (
        (role === "nhanvien" || selectedBooking.MaKH === maNguoiDung) && (
        <div className="booking-modal" onClick={() => { setSelectedBooking(null); setShowCancelConfirmPopup(false); }}>
          <div
            className="booking-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Thông tin đặt sân</h3>
              <button
                className="close-btn"
                onClick={() => { setSelectedBooking(null); setShowCancelConfirmPopup(false); }}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>
                <strong>MaDatSan:</strong> {selectedBooking.MaDatSan}
              </p>
              <p>
                <strong>MaSan:</strong> {selectedBooking.MaSan}
              </p>
              <p>
                <strong>Khách hàng:</strong> {selectedBooking.KhachHang}
              </p>
              <p>
                <strong>Ngày:</strong> {selectedBooking.NgayLap?.split("T")[0]}
              </p>
              <p>
                <strong>Giờ vào:</strong> {selectedBooking.GioVao}
              </p>
              <p>
                <strong>Giờ ra:</strong> {selectedBooking.GioRa}
              </p>
              <p>
                <strong>Tổng tiền:</strong>{" "}
                {selectedBooking.TongTien?.toLocaleString("vi-VN")} đ
              </p>
              <p>
                <strong>Trạng thái:</strong> {selectedBooking.TrangThai}
              </p>
              <p>
                <strong>Ghi chú:</strong> {selectedBooking.GhiChu || "Không có"}
              </p>
              {selectedBooking.PaymentScreenshot && (
                <img
                  src={`${BASE_URL}/uploads/payments/${selectedBooking.PaymentScreenshot}`}
                  alt="Payment"
                  style={{ width: "100%", marginTop: "10px" }}
                />
              )}
              {role === "nhanvien" && !isCancelledStatus(selectedBooking.TrangThai) && (
                <div style={{ marginTop: "14px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  {isPendingStatus(selectedBooking.TrangThai) && (
                    <button
                      className="btn-confirm"
                      onClick={handleAdminAcceptBooking}
                      disabled={bookingActionLoading}
                    >
                      {bookingActionLoading ? "Đang xử lý..." : "Xác nhận"}
                    </button>
                  )}
                  <button
                    className="cancel-btn"
                    onClick={handleAdminCancelBooking}
                    disabled={bookingActionLoading}
                  >
                    {bookingActionLoading ? "Đang xử lý..." : "Hủy sân"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        )
      )}

      {selectedBooking && showCancelConfirmPopup && (
        <div className="booking-modal" onClick={() => setShowCancelConfirmPopup(false)}>
          <div
            className="booking-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "420px" }}
          >
            <div className="modal-header">
              <h3>Xác nhận hủy booking</h3>
              <button className="cancel-confirm-close" onClick={() => setShowCancelConfirmPopup(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc muốn hủy booking này không?</p>
            </div>
            <div style={{ marginTop: "12px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={handleAdminCancelBookingConfirmed}
                disabled={bookingActionLoading}
                style={{
                  border: "none",
                  borderRadius: "8px",
                  padding: "9px 14px",
                  background: "#ef4444",
                  color: "#fff",
                  cursor: bookingActionLoading ? "not-allowed" : "pointer",
                  opacity: bookingActionLoading ? 0.7 : 1,
                }}
              >
                {bookingActionLoading ? "Đang xử lý..." : "Đồng ý hủy"}
              </button>
              <button
                type="button"
                onClick={() => setShowCancelConfirmPopup(false)}
                disabled={bookingActionLoading}
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  padding: "9px 14px",
                  background: "#fff",
                  color: "#111827",
                  cursor: bookingActionLoading ? "not-allowed" : "pointer",
                  opacity: bookingActionLoading ? 0.7 : 1,
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="sanngay-content">
        <header className="datsan-header">
          <div className="left">
            {/* <div className="brand">Alpha Pickleball</div> */}
            <div className="control">
              <label>Ngày</label>
              <input
                id="date"
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                min={role === "khachhang" ? todayStr : undefined}
              />
              <div className="quick-date-filters">
                <button type="button" onClick={() => setQuickDate(0)}>Hôm nay</button>
                <button type="button" onClick={() => setQuickDate(1)}>Ngày mai</button>
                <button type="button" onClick={() => setQuickDate(2)}>Ngày kia</button>
              </div>
            </div>
          </div>
          <div className="right legend">
            <span className="dot a"></span>
            <small>Còn trống</small>
            <span className="dot c"></span>
            <small>Đã đặt</small>
            <span className="dot s"></span>
            <small>Đang chọn</small>
            <span className="dot m"></span>
            <small>Đặt tháng</small>
            <div className="vip-legend">
              <div className="vip-legend-item">
                <span className="vip-dot"></span>
                <small>Sân VIP</small>
              </div>
              <div className="vip-legend-item">
                <span className="normal-dot"></span>
                <small>Sân thường</small>
              </div>
            </div>
          </div>
        </header>

        <div className="grid-wrapper" id="grid"></div>

        {role === "khachhang" && selectedDetails.length > 0 && (
          <div className="selection-summary">
            <div className="selection-header">Chi tiết lựa chọn</div>
            <div className="selection-list">
              {selectedDetails.map((item) => (
                <div key={item.key} className="selection-item">
                  <div className="selection-meta">
                    <span className={`selection-court ${item.isVip ? "vip" : "normal"}`}>
                      {item.courtName}
                    </span>
                    <span className="selection-time">{item.timeRange}</span>
                  </div>
                  <div className="selection-price">
                    {item.price.toLocaleString("vi-VN")} đ
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {role === "khachhang" && (
          <div className="confirm-area">
            <div className="total">Tổng: {total.toLocaleString("vi-VN")} đ</div>
            <button className="btn-confirm" onClick={handleConfirm}>
              <Link to="/xacnhansan"></Link>
              XÁC NHẬN
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
