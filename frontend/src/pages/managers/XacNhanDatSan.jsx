import { useState, useEffect, useRef } from "react";
import { Sidebar } from "../../components/Sidebar";
import "../../css/XacNhanDatSan.css";
import mbBank from "../../images/mb-bank.jpg";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from "axios"; // đảm bảo có import axios
import { useAlert } from "../../context/AlertContext";

export function XacNhanDatSan() {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [danhSachSan, setDanhSachSan] = useState([]);
  const [tenKhach, setTenKhach] = useState("");
  const [sdt, setSdt] = useState("");
  const [selectedKhachHangId, setSelectedKhachHangId] = useState("");
  const [searchTen, setSearchTen] = useState([]);
  const [searchSdt, setSearchSdt] = useState([]);
  const [hienThiMaGiamGia, setHienThiMaGiamGia] = useState(false);
  const [khachHangData, setKhachHangData] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const location = useLocation();
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [paymentError, setPaymentError] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  //  cho đặt sân tháng
  const [isDatSanThang, setIsDatSanThang] = useState(false);
  const [thongTinThang, setThongTinThang] = useState({});
  const [loaiThanhToan, setLoaiThanhToan] = useState("100%");

  const bookingDataFromState = location.state?.bookingData || null;

  useEffect(() => {
    const payload = bookingDataFromState || JSON.parse(localStorage.getItem("bookingData") || "null");
    if (!payload) return;

    // Nếu payload có MaKH và role là "khachhang" → gọi API
    if (payload.MaKH && payload.Role === "khachhang") {
      axios
        .get(`/api/admin/khachhang/idsearch?MaKH=${payload.MaKH}`)
        .then((res) => {
          const kh = res.data;
          // Cập nhật lại thông tin hiển thị
          setThongTinThang((prev) => ({
            ...prev,
            TenKH: kh.TenKh || kh.TenKH || kh.ten || kh.HoTen || "Không rõ",
            SDT: kh.SDT || kh.sdt || kh.SoDienThoai || "Không rõ",
            MaKH: payload.MaKH,
            ...payload,
          }));
        })
        .catch((err) => {
          console.error(" Lỗi lấy thông tin khách hàng:", err);
        });
    } else {
      // Nếu không có khách hàng (NV đặt hộ)
      setThongTinThang((prev) => ({
        ...prev,
        ...payload,
      }));
    }
  }, [bookingDataFromState]);

  // const [tongTienSan, setTongTienSan] = useState(0);

  const [tongTienSan, setTongTienSan] = useState(0);
  const [giamGia, setGiamGia] = useState(0);
  const [tongTienThuc, setTongTienThuc] = useState(0);
  const [soTienThanhToan, setSoTienThanhToan] = useState(0);

  // 🆕 Lấy thông tin đăng nhập

  const storedUser =
    JSON.parse(localStorage.getItem("user")) ||
    JSON.parse(localStorage.getItem("khach")) ||
    {};

  const currentUser = {
    id: storedUser.id || storedUser.MaKH || null,
    maNV: storedUser.maNV || null,
    TenKh: storedUser.TenKh || storedUser.TenKH || storedUser.HoTen || "",
    SDT: storedUser.SDT || storedUser.sdt || storedUser.SoDienThoai || "",
    role: (
      storedUser.role ||
      storedUser.Role ||
      storedUser.RoleName ||
      "khachhang"
    ).toLowerCase(),
  };

  const userRole = currentUser.role; // luôn là 'khachhang' hoặc 'nhanvien'
  const userId = currentUser?.maNV || currentUser?.id || null;

  useEffect(() => {
    console.log(" Người dùng hiện tại:", currentUser);
  }, []);

  console.log("userRole:", userRole, "maNguoiDung:", userId);

  const API_BASE = "/api/admin/khachhang";
  const typingTimeout = useRef(null);

  useEffect(() => {
    if (userRole === "khachhang" && currentUser?.id) {
      //  Lấy thông tin khách hàng trực tiếp từ localStorage (đã có sẵn)
      setTenKhach(currentUser.TenKh);
      setSdt(currentUser.SDT);
      setSelectedKhachHangId(currentUser.id);
      console.log(" Thông tin khách hàng đăng nhập:", currentUser);
    }
  }, []);

  const openingHour = 5;
  const VIP_PRICE_FACTOR = 1.15;
  //  Lấy danh sách sân từ API thay vì hardcode
  const [courtsFromAPI, setCourtsFromAPI] = useState([]);
  const parseCourtNumber = (value) => {
    const parsed = parseInt(String(value || "").replace(/\D/g, ""), 10);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const isVipCourt = (court, index = 0) => {
    const byType = court?.LoaiSan === "VIP";
    const byName = /vip/i.test(String(court?.TenSan || court?.MaSan || ""));
    const courtNumber = parseCourtNumber(court?.MaSan || court?.TenSan);
    const fallbackNumber = index + 1;
    return (
      byType ||
      byName ||
      courtNumber === 6 ||
      fallbackNumber === 6 ||
      index === 5
    );
  };

  const formatCourtLabel = (court, index = 0) => {
    if (!court) {
      return index === 5 ? "SÂN VIP 1" : `Sân ${index + 1}`;
    }
    const hasName = court.TenSan && court.TenSan.trim() !== "";
    if (isVipCourt(court, index) && !hasName) {
      return "SÂN VIP 1";
    }
    return court.TenSan || court.MaSan || `Sân ${index + 1}`;
  };

  const getCourtInfo = (identifier) => {
    if (!identifier) return undefined;
    if (typeof identifier === "object") return identifier;
    const num = parseCourtNumber(identifier);
    return courtsFromAPI.find((c) => {
      const matchName = c.TenSan === identifier || c.MaSan === identifier;
      const matchNum = parseCourtNumber(c.MaSan) === num;
      return matchName || matchNum;
    });
  };

  const courts = courtsFromAPI.length > 0
    ? courtsFromAPI.map((c, idx) => formatCourtLabel(c, idx))
    : [
        "Sân 1",
        "Sân 2",
        "Sân 3",
        "Sân 4",
        "Sân 5",
        "Sân VIP 1",
        "Sân 7",
        "Sân 8",
        "Sân 9",
        "Sân 10",
        "Sân 11",
        "Sân 12",
        "Sân 13",
        "Sân 14",
        "Sân 15",
        "Sân TT",
      ];

  const renderPaymentCard = () => (
    <div className="tt-payment-card">
      <div className="payment-left">
        <div className="info-qr">
          <img src={mbBank} alt="QR Thanh toán" className="qr-image" />
          <p className="qr-note">Quét mã QR để thanh toán</p>
        </div>

        <div className="info-bank">
          <h3>Thông tin chuyển khoản</h3>
          <p>
            <b>Tên tài khoản:</b> Chí Tâm & Thu Huyền
          </p>
          <p>
            <b>Số tài khoản:</b> 1023438255
          </p>
          <p>
            <b>Ngân hàng:</b> Vietcombank
          </p>
        </div>
      </div>

      {userRole === "khachhang" && (
        <div className="payment-upload-panel">
          <h4>Ảnh xác nhận chuyển khoản</h4>
          <div
            className={`payment-dropzone ${paymentError ? "error" : ""}`}
            onClick={() => document.getElementById("payment-input").click()}
          >
            {paymentScreenshot ? (
              <img
                src={URL.createObjectURL(paymentScreenshot)}
                alt="Ảnh đã chọn"
                className="payment-preview-img"
              />
            ) : (
              <div className="payment-placeholder">
                <div className="payment-plus">+</div>
                <div className="payment-hint">Thêm ảnh</div>
                <div className="payment-subhint">PNG/JPG · tối đa 5MB</div>
              </div>
            )}
          </div>

          <input
            id="payment-input"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              setPaymentScreenshot(e.target.files[0]);
              setPaymentError(false);
            }}
          />

          {paymentError && (
            <p className="payment-upload-note" style={{ color: "#ef4444" }}>
              Vui lòng nộp ảnh thanh toán trước khi xác nhận.
            </p>
          )}
          {paymentScreenshot && !paymentError && (
            <p className="payment-upload-note">Đã chọn ảnh, kiểm tra trước khi gửi</p>
          )}
        </div>
      )}
    </div>
  );

  // Lấy danh sách sân từ API khi component mount
  useEffect(() => {
    axios.get("/api/admin/san/list")
      .then(res => {
        if (res.data && Array.isArray(res.data)) {
          setCourtsFromAPI(res.data);
        }
      })
      .catch(err => console.error("❌ Lỗi tải danh sách sân:", err));
  }, []);

  useEffect(() => {
    if (!thongTinThang?.MaSan || !thongTinThang?.NgayDat) return;

    let tongTien = 0;

    thongTinThang.MaSan.forEach((maSan, idx) => {
      thongTinThang.NgayDat.forEach((ngay) => {
        const gioVao = thongTinThang.GioVao;
        const gioRa = thongTinThang.GioRa;
        const normalizedCourtName =
          maSan === "TT" || maSan === "STT" ? "Sân TT" : maSan;
        const courtInfo = getCourtInfo(maSan);

        const tien =
          Number(tinhTienTheoGio(courtInfo || normalizedCourtName, gioVao, gioRa)) || 0;
        tongTien += tien;
      });
    });

    // --- Tính toán các giá trị ---
    let giam = 0;
    let tongSauGiam = tongTien;
    let soTienThanhToan = tongTien;

    // Ưu đãi realtime: 5% đặt sân tháng + thêm 5% nếu thanh toán 100%
    const baseDiscount = tongTien * 0.05;
    const extraDiscount = loaiThanhToan === "100%" ? tongTien * 0.05 : 0;
    giam = baseDiscount + extraDiscount;
    tongSauGiam = tongTien - giam;

    if (loaiThanhToan === "100%") {
      soTienThanhToan = tongSauGiam;
    } else if (loaiThanhToan === "50%") {
      soTienThanhToan = tongSauGiam * 0.5;
    }

    // --- Gán giá trị chính xác ---
    setTongTienSan(tongTien);
    setGiamGia(giam);
    setTongTienThuc(tongSauGiam); //  Tổng tiền thực chính là tongSauGiam
    setSoTienThanhToan(soTienThanhToan);

    console.log(" Tổng tiền:", tongTien);
    console.log(" Giảm giá:", giam);
    console.log(" Tổng thực tế sau giảm:", tongSauGiam); // ✅ tongTienThuc thực tế
    console.log(" Cần thanh toán:", soTienThanhToan);
  }, [thongTinThang, loaiThanhToan]);

  // ===================== HÀM TÍNH GIÁ =====================

  const getSlotPriceByHour = (courtRef, hour) => {
    const refLabel =
      typeof courtRef === "string"
        ? courtRef
        : courtRef?.TenSan || courtRef?.MaSan;
    const fallbackNum = parseCourtNumber(refLabel);
    const court = typeof courtRef === "object" ? courtRef : getCourtInfo(courtRef);
    const isAfter16h = hour >= 16;
    const vip =
      isVipCourt(court, fallbackNum ? fallbackNum - 1 : 0) ||
      /vip/i.test(refLabel || "");

    const baseBefore =
      Number(court?.GiaThueTruoc16) || (vip ? 120000 : 100000);
    const baseAfter =
      Number(court?.GiaThueSau16) || (vip ? 180000 : 160000);

    let price = isAfter16h ? baseAfter : baseBefore;
    if (vip) price *= VIP_PRICE_FACTOR;

    // sân TT giữ nguyên mức cao
    if (
      typeof refLabel === "string" &&
      (refLabel === "Sân TT" || /TT/.test(refLabel))
    ) {
      price = isAfter16h ? 200000 : 150000;
    }

    return Math.round(price);
  };

  const tinhTienTheoGio = (courtRef, gioVao, gioRa) => {
    const [h1, m1] = gioVao.split(":").map(Number);
    const [h2, m2] = gioRa.split(":").map(Number);
    let total = 0;
    let currentH = h1;
    while (currentH < h2 || (currentH === h2 && m2 > 0)) {
      total += getSlotPriceByHour(courtRef, currentH);
      currentH += 1;
    }
    return total;
  };

  useEffect(() => {
    const data = localStorage.getItem("bookingData");
    if (data) {
      const parsed = JSON.parse(data);
      setDanhSachSan(parsed.MaSan || []);
      setTenKhach("");
      setSdt("");
      setSelectedKhachHangId(parsed.MaKH || null);

      //  Nếu có mã khách hàng => gọi API để lấy thông tin chi tiết
      if (parsed.MaKH) {
        fetchKhachHangInfo(parsed.MaKH);
      }
    }
  }, []);

  const fetchKhachHangInfo = async (maKH) => {
    try {
      const res = await axios.get(`/api/admin/khachhang/idsearch?MaKH=${maKH}`);
      const kh = res.data;
      setTenKhach(kh.TenKh || kh.ten || kh.HoTen || "");
      setSdt(kh.SDT || kh.sdt || kh.SoDienThoai || "");
    } catch (err) {
      console.error(" Lỗi lấy thông tin khách hàng:", err);
    }
  };

  //  Load dữ liệu đặt sân
  useEffect(() => {
    const payload = bookingDataFromState || JSON.parse(localStorage.getItem("bookingData") || "null");
    if (!payload) {
      showAlert({ type: "error", title: "Không có dữ liệu", message: "Vui lòng quay lại chọn sân trước khi xác nhận." });
      window.location.href = "/dat-san";
      return;
    }

    const parsed = payload;
    console.log(" Dữ liệu đọc từ localStorage:", parsed);

    //  Ưu tiên nhận diện Đặt sân tháng
    const isThang =
      parsed?.LoaiDat === "Đặt sân tháng" ||
      parsed?.bookingType === "Đặt sân tháng" ||
      parsed?.type === "Đặt sân tháng" ||
      (Array.isArray(parsed?.NgayDat) && parsed?.Thang && parsed?.Nam);

    if (isThang) {
      console.log(" Phát hiện loại đặt sân tháng!");
      setIsDatSanThang(true);
      setThongTinThang(parsed);
      return;
    }

    //  Nếu không phải sân tháng → xử lý sân ngày như cũ
    console.log(" Không phát hiện đặt sân tháng, xử lý như sân ngày");

    const grouped = {};
    parsed.selectedSlots?.forEach((s) => {
      const courtInfo = courtsFromAPI[s.courtIndex];
      const courtLabel = formatCourtLabel(courtInfo, s.courtIndex);
      const hour = openingHour + s.slotIndex;
      const date = parsed.date || new Date().toLocaleDateString("vi-VN");
      if (!grouped[courtLabel]) grouped[courtLabel] = {};
      if (!grouped[courtLabel][date]) grouped[courtLabel][date] = [];
      grouped[courtLabel][date].push(hour);
    });

    const merged = [];
    Object.keys(grouped).forEach((courtName) => {
      Object.keys(grouped[courtName]).forEach((date) => {
        const hours = grouped[courtName][date].sort((a, b) => a - b);
        let start = hours[0],
          end = hours[0];
        for (let i = 1; i <= hours.length; i++) {
          if (hours[i] === end + 1) {
            end = hours[i];
          } else {
            const gioVaoStr = `${String(start).padStart(2, "0")}:00`;
            const gioRaStr = `${String(end + 1).padStart(2, "0")}:00`;
            const normalizedCourtName =
              courtName === "TT" || courtName === "STT" ? "Sân TT" : courtName;
            const courtInfo = getCourtInfo(normalizedCourtName) || courtsFromAPI.find((c) => c.TenSan === courtName);
            const isVip = isVipCourt(courtInfo, parseCourtNumber(courtName));
            // const gia = tinhTienTheoGio(
            //   normalizedCourtName,
            //   gioVaoStr,
            //   gioRaStr
            // );
            // merged.push({
            //   ten: normalizedCourtName,
            //   loai: "Sân tiêu chuẩn",
            //   ngay: date,
            //   batDau: gioVaoStr,
            //   ketThuc: gioRaStr,
            //   gia,
            //   soGio: tinhSoGio(gioVaoStr, gioRaStr),
            // });
            merged.push({
              ten: normalizedCourtName,
              loai:
                normalizedCourtName === "Sân TT"
                  ? "Sân đặc biệt"
                  : isVip
                  ? "Sân VIP"
                  : "Sân tiêu chuẩn",
              ngay: date,
              batDau: gioVaoStr,
              ketThuc: gioRaStr,
              gia: tinhTienTheoGio(courtInfo || normalizedCourtName, gioVaoStr, gioRaStr),
              soGio: tinhSoGio(gioVaoStr, gioRaStr),
            });
            start = hours[i];
            end = hours[i];
          }
        }
      });
    });

    console.log(" Danh sách sân lẻ được xử lý:", merged);
    setDanhSachSan(merged);
  }, [bookingDataFromState]);

  // 🧭 Theo dõi trạng thái
  useEffect(() => {
    console.log(" Trạng thái isDatSanThang:", isDatSanThang);
    console.log(" Thông tin tháng:", thongTinThang);
  }, [isDatSanThang, thongTinThang]);

  const tinhSoGio = (bd, kt) => {
    const [h1, m1] = bd.split(":").map(Number);
    const [h2, m2] = kt.split(":").map(Number);
    return h2 + m2 / 60 - (h1 + m1 / 60);
  };

  const formatDateDisplay = (input) => {
    if (!input) return "-";

    const raw = String(input).trim();
    const dateOnly = raw.includes("T") ? raw.split("T")[0] : raw;

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
      const [year, month, day] = dateOnly.split("-");
      return `${day}-${month}-${year}`;
    }

    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateOnly)) {
      const [day, month, year] = dateOnly.split("/");
      return `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${year}`;
    }

    const parsedDate = new Date(raw);
    if (Number.isNaN(parsedDate.getTime())) return raw;

    const day = String(parsedDate.getDate()).padStart(2, "0");
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const year = parsedDate.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const tongTien = danhSachSan.reduce(
    (sum, san) => sum + Number(san.gia || 0),
    0
  );

  // ===================== API KHÁCH HÀNG =====================
  const timKiemKhachHang = async (tuKhoa, type) => {
    if (!tuKhoa.trim())
      return type === "ten" ? setSearchTen([]) : setSearchSdt([]);
    try {
      const res = await fetch(
        `${API_BASE}/search?q=${encodeURIComponent(tuKhoa)}`
      );
      if (!res.ok) throw new Error("Lỗi khi gọi API tìm kiếm");
      const data = await res.json();
      type === "ten" ? setSearchTen(data) : setSearchSdt(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(
      () => timKiemKhachHang(tenKhach, "ten"),
      400
    );
  }, [tenKhach]);
  useEffect(() => {
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => timKiemKhachHang(sdt, "sdt"), 400);
  }, [sdt]);

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const chonKhach = (ten, sdt, id) => {
    setTenKhach(ten);
    setSdt(sdt);
    setSelectedKhachHangId(id);
    setSearchTen([]);
    setSearchSdt([]);
    setHienThiMaGiamGia(true);
    console.log("👤 Chọn khách:", { ten, sdt, id });
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setSdt(value);
    if (value && !/^\d{10}$/.test(value)) {
      setErrorMsg(" Số điện thoại không hợp lệ (phải đủ 10 số)");
    } else {
      setErrorMsg("");
    }
  };

  const themKhachHang = async () => {
    if (!tenKhach.trim() || !sdt.trim()) {
      showAlert({ type: "error", title: "Thiếu thông tin", message: "Vui lòng nhập đầy đủ họ tên và số điện thoại!" });
      return;
    }

    if (!/^\d{10}$/.test(sdt)) {
      showAlert({ type: "error", title: "Số điện thoại không hợp lệ", message: "SĐT cần đủ 10 số." });
      return;
    }

    try {
      //  Tạo mã KH ngẫu nhiên (giống bên server)
      const randomNum = Math.floor(Math.random() * 900000 + 100000);
      const maKh = `KH${randomNum}`;

      //  Gọi API thêm khách hàng
      const res = await fetch(`${API_BASE}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          MaKH: maKh,
          TenKh: tenKhach,
          SDT: sdt,
          DiaChi: "",
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Lỗi thêm khách hàng!");

      //  Thành công → cập nhật state, truyền lại mã KH mới
      showAlert({ type: "success", title: "Đã thêm khách hàng", message: "Khách hàng mới đã được lưu." });

      // Lưu mã KH mới vừa tạo để dùng cho các bước sau
      setSelectedKhachHangId(result.insertedId || maKh);

      // Nếu muốn cập nhật lại danh sách gợi ý (tuỳ bạn)
      setSearchTen((prev) => [
        ...prev,
        { TenKh: tenKhach, SDT: sdt, id: result.insertedId || maKh },
      ]);
      setSearchSdt((prev) => [
        ...prev,
        { TenKh: tenKhach, SDT: sdt, id: result.insertedId || maKh },
      ]);

      console.log(" Đã thêm KH mới:", result.insertedId || maKh);
    } catch (err) {
      console.error(err);
      showAlert({ type: "error", title: "Lỗi thêm khách", message: err.message || "Không thể thêm khách hàng." });
    }
  };

  // ===================== XÁC NHẬN ĐẶT SÂN =====================
  const xacNhanDatSan = async (loaiDat) => {
    if (isSubmittingBooking) return;
    const data = localStorage.getItem("bookingData");
    if (!data) {
      showAlert({ type: "error", title: "Không có dữ liệu", message: "Vui lòng quay lại chọn sân." });
      return;
    }

    const parsed = JSON.parse(data);
    console.log(" Dữ liệu xác nhận đặt sân:", parsed);

    // ===============================
    //  Xử lý đặt sân tháng (CÓ ĐỦ DỮ LIỆU TIỀN)
    // ===============================
    if (loaiDat === "thang") {
      //  Ưu tiên lấy thông tin khách hàng từ 3 nguồn: parsed → thongTinThang → state
      const tenKHThang =
        parsed.TenKH ||
        parsed.TenKh ||
        thongTinThang?.TenKH ||
        thongTinThang?.TenKh ||
        tenKhach ||
        "";
      const sdtThang = parsed.SDT || thongTinThang?.SDT || sdt || "";

      //  Với khách hàng tự đặt thì bắt buộc đủ thông tin KH
      if (userRole === "khachhang" && (!tenKHThang?.trim() || !sdtThang?.trim())) {
        showAlert({ type: "error", title: "Thiếu thông tin khách", message: "Vui lòng nhập đầy đủ họ tên và SĐT cho sân tháng!" });
        return;
      }

      //  Kiểm tra ảnh thanh toán nếu là khách
      if (userRole === "khachhang" && !paymentScreenshot) {
        setPaymentError(true);
        showAlert({ type: "error", title: "Thiếu ảnh thanh toán", message: "Vui lòng nộp ảnh thanh toán trước khi xác nhận!" });
        return;
      } else {
        setPaymentError(false);
      }

      setIsSubmittingBooking(true);
      try {
        //  Lấy tổng tiền gốc từ dữ liệu
        const tongTien = Number(tongTienSan) || 0;

        //  Xử lý giảm giá và tổng tiền thực
        let giamGia = 0;
        let tongTienThuc = tongTien;

        // Ưu đãi lưu đơn: 5% đặt sân tháng + thêm 5% nếu thanh toán 100%
        const baseDiscount = tongTien * 0.05;
        const extraDiscount = loaiThanhToan === "100%" ? tongTien * 0.05 : 0;
        giamGia = baseDiscount + extraDiscount;
        tongTienThuc = tongTien - giamGia;

        //  Số tiền khách thanh toán (tùy loại)
        const soTienThanhToan =
          loaiThanhToan === "50%" ? tongTienThuc * 0.5 : tongTienThuc;

        // 🧩 Tạo FormData để gửi API (hỗ trợ upload ảnh)
        const formData = new FormData();
        //  Gửi danh sách sân dưới dạng JSON để backend parse đúng mảng
        const maSanValue = Array.isArray(parsed.MaSan)
          ? JSON.stringify(parsed.MaSan)
          : parsed.MaSan;
        formData.append("MaSan", maSanValue);
        formData.append("MaNV", currentUser?.maNV || "");
        // Ưu tiên MaKH đúng cho khách hàng đăng nhập
        formData.append(
          "MaKH",
          userRole === "khachhang" ? (currentUser?.id || parsed.MaKH || "") : (parsed.MaKH || "")
        );
        formData.append("Thang", parsed.Thang);
        formData.append("Nam", parsed.Nam);
        formData.append("TongTien", tongTien);
        formData.append("GiamGia", giamGia);
        formData.append("TongTienThuc", tongTienThuc);
        formData.append("SoTienThanhToan", soTienThanhToan);
        formData.append("LoaiThanhToan", loaiThanhToan);
        formData.append("LoaiDat", "Đặt sân tháng");
        formData.append("Role", parsed.Role || userRole || "");
        formData.append("TenKH", tenKHThang);
        formData.append("SDT", sdtThang);
        //  Gửi đầy đủ danh sách ngày; backend nhận mảng hoặc từng giá trị
        if (Array.isArray(parsed.NgayDat)) {
          parsed.NgayDat.forEach((ngay) => formData.append("NgayDat", ngay));
        } else {
          formData.append("NgayDat", parsed.NgayDat);
        }
        formData.append("GioVao", parsed.GioVao);
        formData.append("GioRa", parsed.GioRa);
        formData.append("GhiChu", parsed.GhiChu || tenKHThang);
        formData.append("TongGio", parsed.TongGio || 1);
        
        //  Thêm ảnh thanh toán nếu có
        if (paymentScreenshot) {
          formData.append("PaymentScreenshot", paymentScreenshot);
        }

        console.log(" Dữ liệu gửi API đặt sân tháng (FormData)");

        // Gửi API với FormData (không cần headers Content-Type)
        const res = await fetch("/api/admin/santhang/book", {
          method: "POST",
          body: formData,
        });

        const result = await res.json();
        
        //  Kiểm tra nếu có trùng lịch (status 409)
        if (res.status === 409 && result.conflicts) {
          let conflictMsg = " LỊCH ĐẶT BỊ TRÙNG!\n\n";
          result.conflicts.forEach((c, i) => {
            conflictMsg += `${i + 1}. Sân ${c.san}\n`;
            conflictMsg += `   Ngày: ${c.ngay}\n`;
            conflictMsg += `   Giờ: ${c.gio}\n`;
            conflictMsg += `   Khách: ${c.khach}\n\n`;
          });
          conflictMsg += "Vui lòng chọn giờ hoặc ngày khác!";
          showAlert({ type: "error", title: "Lịch bị trùng", message: conflictMsg });
          return;
        }
        
        if (!res.ok) throw new Error(result.message || "Lỗi đặt sân tháng!");

        showAlert({ type: "success", title: "Đặt sân tháng thành công", message: "Đã lưu đặt sân và thanh toán." });
        localStorage.removeItem("bookingData");
        window.location.href = "/";
      } catch (err) {
        console.error(" Lỗi đặt sân tháng:", err);
        showAlert({ type: "error", title: "Lỗi đặt sân tháng", message: err.message || "Có lỗi xảy ra" });
      } finally {
        setIsSubmittingBooking(false);
      }
    }

    // ===============================
    //  Xử lý đặt sân ngày
    // ===============================
    else {
      setIsSubmittingBooking(true);
      try {
        //  Lấy lại thông tin đăng nhập
        const storedUser =
          JSON.parse(localStorage.getItem("user")) ||
          JSON.parse(localStorage.getItem("khach")) ||
          {};

        const currentUser = {
          id: storedUser.id || storedUser.MaKH || null,
          maNV: storedUser.maNV || null,
          TenKh: storedUser.TenKh || storedUser.TenKH || storedUser.HoTen || "",
          SDT: storedUser.SDT || storedUser.sdt || storedUser.SoDienThoai || "",
          role: (
            storedUser.role ||
            storedUser.Role ||
            storedUser.RoleName ||
            "khachhang"
          ).toLowerCase(),
        };

        const userRole = currentUser.role; // luôn là 'khachhang' hoặc 'nhanvien'
        let maNhanVienThucTe = currentUser?.maNV || null;
        let maKhachHangThucTe = currentUser?.id || null;
        const maNguoiDung = currentUser?.id || currentUser?.MaKH || null;

        // ⚡ Nếu là khách hàng đăng nhập
        if (userRole === "khachhang") {
          if (!maNguoiDung) {
            showAlert({ type: "error", title: "Thiếu mã khách hàng", message: "Không xác định được mã khách hàng!" });
            return;
          }
          maKhachHangThucTe = currentUser?.id; // Lấy từ tài khoản khách hàng
          console.log("👤 Khách hàng tự đặt, Mã KH:", maKhachHangThucTe);
        }
        // ⚡ Nếu là nhân viên / quản lý
        else {
          if (!tenKhach?.trim() || !sdt?.trim()) {
            showAlert({ type: "error", title: "Thiếu thông tin khách", message: "Vui lòng nhập đầy đủ họ tên và SĐT cho sân ngày!" });
            return;
          }
          if (!selectedKhachHangId) {
            showAlert({ type: "error", title: "Chưa chọn khách hàng", message: "Vui lòng chọn hoặc thêm khách hàng trước khi đặt sân!" });
            return;
          }
          maNhanVienThucTe = currentUser?.maNV; // Lấy từ tài khoản nhân viên hoặc quản lý
          maKhachHangThucTe = selectedKhachHangId;
          console.log(" Đặt giúp khách, Mã NV:", maNhanVienThucTe);
        }

        //  Kiểm tra ảnh thanh toán nếu là khách
        if (userRole === "khachhang" && !paymentScreenshot) {
          setPaymentError(true);
          showAlert({ type: "error", title: "Thiếu ảnh thanh toán", message: "Vui lòng nộp ảnh thanh toán trước khi xác nhận!" });
          return;
        } else {
          setPaymentError(false);
        }

        const grouped = {};
        parsed.selectedSlots?.forEach((s) => {
          const courtInfo = courtsFromAPI[s.courtIndex];
          let courtName = formatCourtLabel(courtInfo, s.courtIndex);
          if (courtName === "TT") courtName = "Sân TT";
          const hour = openingHour + s.slotIndex;
          const date = parsed.date || new Date().toLocaleDateString("vi-VN");
          if (!grouped[courtName]) grouped[courtName] = {};
          if (!grouped[courtName][date]) grouped[courtName][date] = [];
          grouped[courtName][date].push({ hour, courtInfo });
        });

        const requests = [];
        Object.keys(grouped).forEach((courtName) => {
          Object.keys(grouped[courtName]).forEach((date) => {
            const sorted = grouped[courtName][date]
              .sort((a, b) => a.hour - b.hour);
            const hours = sorted.map((h) => h.hour);
            const courtInfo = sorted[0]?.courtInfo || getCourtInfo(courtName);
            let start = hours[0],
              end = hours[0];
            for (let i = 1; i <= hours.length; i++) {
              if (hours[i] === end + 1) {
                end = hours[i];
              } else {
                const soGio = end - start + 1;
                const gioVaoStr = `${String(start).padStart(2, "0")}:00`;
                const gioRaStr = `${String(end + 1).padStart(2, "0")}:00`;
                const tongTienSan = tinhTienTheoGio(
                  courtInfo || courtName,
                  gioVaoStr,
                  gioRaStr
                );
                let PaymentScreenshotData = null;
                if (paymentScreenshot) {
                  PaymentScreenshotData = readFileAsDataURL(paymentScreenshot);
                }

                requests.push({
                  MaSan: courtInfo?.MaSan || `S${courts.indexOf(courtName) + 1}`,
                  MaKH: maKhachHangThucTe,
                  MaNV: maNhanVienThucTe,
                  GioVao: gioVaoStr,
                  GioRa: gioRaStr,
                  TongGio: soGio,
                  TongTien: tongTienSan,
                  GiamGia: 0,
                  TongTienThuc: tongTienSan,
                  GhiChu: "",
                  LoaiDat: "Đặt sân ngày",
                  NgayLap: date,
                  PaymentScreenshot: paymentScreenshot || null, // ✅ ảnh thanh toán
                });

                start = hours[i];
                end = hours[i];
              }
            }
          });
        });

        console.log(" Danh sách yêu cầu gửi đặt sân ngày:", requests);

        for (let reqBody of requests) {
          const formData = new FormData();
          formData.append("MaSan", reqBody.MaSan);
          formData.append("MaKH", reqBody.MaKH);
          formData.append("MaNV", reqBody.MaNV || "");
          formData.append("GioVao", reqBody.GioVao);
          formData.append("GioRa", reqBody.GioRa);
          formData.append("TongGio", reqBody.TongGio);
          formData.append("TongTien", reqBody.TongTien);
          formData.append("GiamGia", reqBody.GiamGia);
          formData.append("TongTienThuc", reqBody.TongTienThuc);
          formData.append("GhiChu", reqBody.GhiChu || "");
          formData.append("LoaiDat", reqBody.LoaiDat);
          formData.append("NgayLap", reqBody.NgayLap);
          if (reqBody.PaymentScreenshot) {
            formData.append("PaymentScreenshot", reqBody.PaymentScreenshot);
          }

          const res = await fetch("/api/admin/san/book", {
            method: "POST",
            body: formData,
          });
          const result = await res.json();
          if (!res.ok) throw new Error(result.message || "Lỗi khi đặt sân!");
        }

        showAlert({ type: "success", title: "Đặt sân thành công", message: "Đã lưu đặt sân ngày." });
        localStorage.removeItem("bookingData");
        window.location.href = "/";
      } catch (err) {
        console.error( "Lỗi đặt sân:", err);
        showAlert({ type: "error", title: "Lỗi đặt sân", message: err.message || "Có lỗi xảy ra" });
      } finally {
        setIsSubmittingBooking(false);
      }
    }
  };

  // ==== RENDER ====
  return (
    <div className="xacnhan-container">
      {/* Chỉ hiển thị Sidebar khi là admin/nhân viên */}
      {userRole !== "khachhang" && <Sidebar />}
      <div className="xacnhan-content">
        <h1>{isDatSanThang ? "Xác nhận đặt sân tháng" : "Xác nhận đặt sân"}</h1>

        {/* Nếu là đặt sân tháng */}
        {isDatSanThang ? (
          <div className="info-group">
            <div className="tt-info-grid">
              {/*  Cột 1 + 2: Thông tin khách hàng */}
              <div className="info-col info-customer">
                {userRole === "khachhang" ? (
                  <>
                    <div className="grid-row">
                      <div className="grid-label">Họ và tên:</div>
                      <div className="grid-value">
                        {currentUser.TenKh || thongTinThang.TenKH || "Không rõ"}
                      </div>
                    </div>
                    <div className="grid-row">
                      <div className="grid-label">SĐT:</div>
                      <div className="grid-value">
                        {currentUser.SDT || thongTinThang.SDT || "Không rõ"}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid-row">
                      <div className="grid-label">Họ và tên:</div>
                      <div className="grid-value" title="Click để chỉnh sửa">
                        {thongTinThang.TenKH || tenKhach}
                      </div>
                    </div>
                    <div className="grid-row">
                      <div className="grid-label">SĐT:</div>
                      <div className="grid-value" title="Click để chỉnh sửa">
                        {thongTinThang.SDT || sdt}
                      </div>
                    </div>
                  </>
                )}

                {/* Các thông tin tháng/sân */}
                <div className="grid-row">
                  <div className="grid-label">Tháng:</div>
                  <div className="grid-value">
                    {thongTinThang.Thang} / {thongTinThang.Nam}
                  </div>
                </div>
                <div className="grid-row">
                  <div className="grid-label">Sân:</div>
                  <div className="grid-value">
                    {thongTinThang.MaSan?.join(", ")}
                  </div>
                </div>
              </div>
            </div>

            {renderPaymentCard()}

            {/* Bảng thông tin sân tháng */}
            <table className="table-san-thang">
              <thead>
                <tr>
                  <th>Tên sân</th>
                  <th>Khoảng ngày</th>
                  <th>Khung giờ</th>
                  <th>Số buổi</th>
                  <th>Giá / buổi</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {thongTinThang.MaSan?.map((maSan, i) => {
                  const gioVao = thongTinThang.GioVao;
                  const gioRa = thongTinThang.GioRa;
                  const courtInfo = getCourtInfo(maSan);
                  const courtName =
                    maSan === "TT" || maSan === "STT"
                      ? "Sân TT"
                      : formatCourtLabel(courtInfo || { MaSan: maSan }, i);
                  const isVip = isVipCourt(courtInfo, i);

                  const ngayDatArr = Array.isArray(thongTinThang.NgayDat)
                    ? [...thongTinThang.NgayDat].sort()
                    : [];
                  const soBuoi = ngayDatArr.length;
                  const ngayBatDau = ngayDatArr[0] || "-";
                  const ngayKetThuc = ngayDatArr[soBuoi - 1] || "-";
                  const khoangNgay = soBuoi > 0
                    ? `${formatDateDisplay(ngayBatDau)} → ${formatDateDisplay(ngayKetThuc)}`
                    : "-";

                  const giaMotBuoi = tinhTienTheoGio(courtInfo || courtName, gioVao, gioRa);
                  const thanhTien = giaMotBuoi * soBuoi;

                  return (
                    <tr key={`month-${i}`}>
                      <td>
                        <span className={`court-badge ${isVip ? "vip" : "standard"}`}>
                          {courtName}
                        </span>
                      </td>
                      <td>{khoangNgay}</td>
                      <td>{gioVao} - {gioRa}</td>
                      <td>{soBuoi}</td>
                      <td>{Number(giaMotBuoi || 0).toLocaleString()}đ</td>
                      <td className="tongTien">{Number(thanhTien || 0).toLocaleString()}đ</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/*  Tổng tiền & loại thanh toán */}
            <div className="total-summary">
              <label>Loại thanh toán:</label>
              <select
                value={loaiThanhToan}
                onChange={(e) => setLoaiThanhToan(e.target.value)}
              >
                <option value="50%">Cọc 50%</option>
                <option value="100%">Thanh toán 100% (Giảm thêm 5%)</option>
              </select>

              <div className="price-summary">
                <p>
                  <b>Tổng tiền:</b> {Number(tongTienSan || 0).toLocaleString()}đ
                </p>

                <p>
                  <b>Ưu đãi đặt sân tháng (5%):</b>{" "}
                  -{Number((tongTienSan || 0) * 0.05).toLocaleString()}đ
                </p>

                {loaiThanhToan === "100%" && (
                  <p>
                    <b>Giảm thêm khi thanh toán 100% (5%):</b>{" "}
                    -{Number((tongTienSan || 0) * 0.05).toLocaleString()}đ
                  </p>
                )}

                {loaiThanhToan === "50%" && (
                  <>
                    <p>
                      <b>Khách cần thanh toán (50%):</b>{" "}
                      {Number(soTienThanhToan || 0).toLocaleString()}đ
                    </p>
                    <p>
                      <b>Còn lại:</b>{" "}
                      {Number(
                        tongTienThuc - soTienThanhToan || 0
                      ).toLocaleString()}
                      đ
                    </p>
                  </>
                )}

                {loaiThanhToan === "100%" && (
                  <p className="total">
                    <b>Khách cần thanh toán:</b>{" "}
                    {Number(soTienThanhToan || 0).toLocaleString()}đ
                  </p>
                )}
              </div>

              <button
                className="btn-confirm"
                disabled={isSubmittingBooking}
                onClick={() => xacNhanDatSan(isDatSanThang ? "thang" : "ngay")}
              >
                {isSubmittingBooking
                  ? "Đang đặt..."
                  : isDatSanThang
                  ? " Xác nhận đặt sân tháng"
                  : " Xác nhận đặt sân"}
              </button>
            </div>
          </div>
        ) : (
          //  Giao diện đặt sân NGÀY
          <>
            <div className="info-group">
              <h2>Danh sách sân khách đặt</h2>
              <table>
                <thead>
                  <tr>
                    <th>Tên sân</th>
                    <th>Loại sân</th>
                    <th>Ngày</th>
                    <th>Giờ bắt đầu</th>
                    <th>Giờ kết thúc</th>
                    <th>Giá / giờ</th>
                    <th>Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  {danhSachSan.map((san, index) => {
                    const isVip = san.loai === "Sân VIP" || /VIP/i.test(san.ten || "");
                    return (
                      <tr key={index}>
                        <td>
                          <span className={`court-badge ${isVip ? "vip" : "standard"}`}>
                            {san.ten}
                          </span>
                        </td>
                        <td>{isVip ? "Sân VIP" : "Sân thường"}</td>
                        <td>{formatDateDisplay(san.ngay)}</td>
                        <td>{san.batDau}</td>
                        <td>{san.ketThuc}</td>
                        <td>
                          {san.soGio
                            ? (san.gia / san.soGio).toLocaleString()
                            : "-"}
                          đ
                        </td>
                        <td className="tongTien">
                          {san.gia?.toLocaleString() || "0"}đ
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="total">
                Tổng cộng: {tongTien.toLocaleString()}đ
              </div>
            </div>

            {renderPaymentCard()}

            {/*  Ẩn phần nhập khách hàng nếu là khách hàng đăng nhập */}
            {userRole !== "khachhang" && (
              <div className="info-group">
                <h2 className="section-title">Thông tin khách hàng</h2>

                <div className="flex-row">
                  {/* Họ và tên */}
                  <div className="flex-col" style={{ position: "relative" }}>
                    <label>Họ và tên:</label>
                    <input
                      type="text"
                      value={tenKhach}
                      onChange={(e) => setTenKhach(e.target.value)}
                      placeholder="Nhập họ tên..."
                      autoComplete="off"
                    />
                    {searchTen.length > 0 && (
                      <div
                        className="search-results-table"
                        style={{ position: "relative" }}
                      >
                        <table className="suggest-table">
                          <thead>
                            <tr>
                              <th>Họ & tên</th>
                              <th>SĐT</th>
                              <th>Mã</th>
                            </tr>
                          </thead>
                          <tbody>
                            {searchTen
                              .filter((kh) =>
                                kh?.TenKh?.toLowerCase().includes(
                                  tenKhach.toLowerCase()
                                )
                              )
                              .slice(0, 5)
                              .map((kh, i) => (
                                <tr
                                  key={i}
                                  onClick={() =>
                                    chonKhach(kh.TenKh, kh.SDT, kh.id ?? kh.ID)
                                  }
                                  style={{ cursor: "pointer" }}
                                >
                                  <td>{kh.TenKh}</td>
                                  <td>{kh.SDT}</td>
                                  <td>{kh.id ?? kh.ID ?? ""}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Số điện thoại */}
                  <div className="flex-col" style={{ position: "relative" }}>
                    <label>Số điện thoại:</label>
                    <input
                      type="tel"
                      value={sdt}
                      onChange={handlePhoneChange}
                      placeholder="Nhập SĐT..."
                      maxLength={10}
                      autoComplete="off"
                    />
                    {errorMsg && <p className="error-text">{errorMsg}</p>}
                    {searchSdt.length > 0 && (
                      <div
                        className="search-results-table"
                        style={{ position: "relative" }}
                      >
                        <table className="suggest-table">
                          <thead>
                            <tr>
                              <th>SĐT</th>
                              <th>Họ & tên</th>
                              <th>Mã</th>
                            </tr>
                          </thead>
                          <tbody>
                            {searchSdt
                              .filter((kh) =>
                                String(kh?.SDT || "").includes(sdt)
                              )
                              .slice(0, 5)
                              .map((kh, i) => (
                                <tr
                                  key={i}
                                  onClick={() =>
                                    chonKhach(kh.TenKh, kh.SDT, kh.id ?? kh.ID)
                                  }
                                  style={{ cursor: "pointer" }}
                                >
                                  <td>{kh.SDT}</td>
                                  <td>{kh.TenKh}</td>
                                  <td>{kh.id ?? kh.ID ?? ""}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hành động thêm khách và mã giảm giá */}
                <div className="actions-customer">
                  <button className="btn-add-customer" onClick={themKhachHang}>
                    + Thêm khách hàng mới
                  </button>
                  {hienThiMaGiamGia && (
                    <div>
                      <label htmlFor="maGiamGia">Mã giảm giá:</label>
                      <select id="maGiamGia">
                        <option value="">-- Chọn mã giảm giá --</option>
                        <option value="KM10">Giảm 10%</option>
                        <option value="KM50">Giảm 50.000đ</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="confirm-buttons">
              <button className="btn-back" onClick={() => history.back()}>
                Quay lại
              </button>
              <button
                className="btn-confirm"
                disabled={isSubmittingBooking}
                onClick={() => xacNhanDatSan(isDatSanThang ? "thang" : "ngay")}
              >
                {isSubmittingBooking
                  ? "Đang đặt..."
                  : isDatSanThang
                  ? " Xác nhận đặt sân tháng"
                  : " Xác nhận đặt sân"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
