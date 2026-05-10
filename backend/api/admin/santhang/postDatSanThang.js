import { db } from "../../../config/db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

/**
 * API đặt sân tháng (phiên bản gộp bảng mới)
 * Nhận dữ liệu:
 * {
 *   MaSan: ["S2","S3"],
 *   MaKH: "KH001",
 *   MaNV: "NV001",
 *   GioVao: "18:00",
 *   GioRa: "21:00",
 *   TongGio: 3,
 *   TongTien: 900000,
 *   GiamGia: 0,
 *   TongTienThuc: 900000,
 *   GhiChu: "Nguyễn Văn A",
 *   LoaiDat: "Đặt sân tháng",
 *   Thang: 11,
 *   Nam: 2025,
 *   ThuChon: [3,5],
 *   NgayChon: [4,18,25],
 *   NgayDat: ["2025-11-04","2025-11-06",...],
 *   LoaiThanhToan: "50%" hoặc "100%"
 * }
 */

// 🖼️ Cấu hình multer lưu ảnh thanh toán
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads/payments";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `santhang_${Date.now()}_${Math.floor(Math.random() * 10000)}${ext}`;
    cb(null, uniqueName);
  },
});

export const uploadPaymentScreenshotThang = multer({ storage });

export async function postDatSanThang(req, res) {
  try {
    // 🔹 Xử lý dữ liệu từ FormData hoặc JSON
    let MaSan = req.body.MaSan || [];
    const {
      MaKH,
      MaNV,
      Role = "",
      GioVao,
      GioRa,
      TongGio,
      TongTien,
      GiamGia = 0,
      TongTienThuc,
      GhiChu = "",
      LoaiDat = "Đặt sân tháng",
      Thang,
      Nam,
      ThuChon = [],
      NgayChon = [],
      LoaiThanhToan = "100%",
    } = req.body;

    // Parse NgayDat nếu là string JSON
    let NgayDat = req.body.NgayDat || [];
    if (typeof NgayDat === "string") {
      try {
        NgayDat = JSON.parse(NgayDat);
      } catch (e) {
        // thử tách theo dấu phẩy hoặc wrap thành mảng nếu là single date
        const trimmed = NgayDat.trim();
        if (trimmed.includes(",")) {
          NgayDat = trimmed
            .split(",")
            .map((d) => d.trim())
            .filter(Boolean);
        } else if (trimmed) {
          NgayDat = [trimmed];
        } else {
          NgayDat = [];
        }
      }
    }

    // Nếu Multer nhận nhiều field cùng tên, NgayDat có thể là object hoặc một giá trị đơn
    if (!Array.isArray(NgayDat) && NgayDat) {
      NgayDat = [NgayDat];
    }

    // Parse ThuChon/NgayChon nếu là string
    let ThuChonParsed = ThuChon;
    let NgayChonParsed = NgayChon;
    if (typeof ThuChonParsed === "string") {
      try {
        ThuChonParsed = JSON.parse(ThuChonParsed);
      } catch (e) {
        ThuChonParsed = [];
      }
    }
    if (typeof NgayChonParsed === "string") {
      try {
        NgayChonParsed = JSON.parse(NgayChonParsed);
      } catch (e) {
        NgayChonParsed = [];
      }
    }

    // Parse MaSan nếu là string JSON
    if (typeof MaSan === "string") {
      try {
        MaSan = JSON.parse(MaSan);
      } catch (e) {
        MaSan = MaSan
          .split(",")
          .map((san) => san.trim())
          .filter(Boolean);
      }
    }

    if (!Array.isArray(MaSan)) {
      MaSan = [MaSan].filter(Boolean);
    }

    // 🖼️ Lấy ảnh thanh toán nếu có
    let PaymentScreenshot = null;
    if (req.file) {
      PaymentScreenshot = req.file.filename;
    }

    // 🧩 Kiểm tra dữ liệu bắt buộc
    if (!MaSan.length || !GioVao || !GioRa || (!MaKH && !MaNV)) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc!" });
    }

    // 🔒 Rule sân tháng: chỉ được đặt 1 sân trong nhóm sân tháng S5/S6/S7
    const monthlyCourtIds = new Set(["S5", "S6", "S7"]);
    if (MaSan.length !== 1 || !monthlyCourtIds.has(String(MaSan[0] || "").trim())) {
      return res.status(400).json({ message: "Đặt sân tháng chỉ áp dụng cho sân S5, S6 hoặc S7." });
    }

    // 🔍 Nếu có MaKH thì kiểm tra khách hàng có tồn tại
    if (MaKH) {
      const [khExist] = await db.execute(
        `SELECT id FROM tbl_khachhang WHERE id = ?`,
        [MaKH]
      );
      if (khExist.length === 0) {
        return res.status(400).json({ message: `Khách hàng ${MaKH} không tồn tại!` });
      }
    }

    // 🔍 Kiểm tra xem tất cả MaSan có tồn tại không
    for (let san of MaSan) {
      const [sanExist] = await db.execute(
        `SELECT MaSan FROM tbl_san WHERE MaSan = ?`,
        [san]
      );
      if (sanExist.length === 0) {
        return res.status(400).json({ 
          message: `Sân ${san} không tồn tại trong hệ thống!` 
        });
      }
    }

    const gioVaoFormat = GioVao.length === 8 ? GioVao : `${GioVao}:00`;
    const gioRaFormat = GioRa.length === 8 ? GioRa : `${GioRa}:00`;
    const gioVaoCheck = gioVaoFormat;
    const gioRaCheck = gioRaFormat;

    // 🔒 Rule sân tháng: chỉ được đặt 1 khung giờ cố định (1 tiếng)
    const [gvh, gvm] = gioVaoFormat.split(":").map(Number);
    const [grh, grm] = gioRaFormat.split(":").map(Number);
    const tongPhut = (grh * 60 + grm) - (gvh * 60 + gvm);
    if (tongPhut !== 60) {
      return res.status(400).json({ message: "Đặt sân tháng chỉ cho phép 1 khung giờ cố định (1 tiếng)." });
    }

    // 🗓️ Rule sân tháng: chỉ có 1 lựa chọn là 30 ngày tiếp theo kể từ hôm nay
    const formatDate = (dateObj) => {
      const yearVal = dateObj.getFullYear();
      const monthVal = String(dateObj.getMonth() + 1).padStart(2, "0");
      const dayVal = String(dateObj.getDate()).padStart(2, "0");
      return `${yearVal}-${monthVal}-${dayVal}`;
    };

    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);
    const danhSachNgay = Array.from({ length: 30 }, (_, index) => {
      const dateItem = new Date(baseDate);
      dateItem.setDate(baseDate.getDate() + index);
      return formatDate(dateItem);
    });

    if (danhSachNgay.length === 0) {
      return res.status(400).json({ message: "Không tìm thấy ngày hợp lệ!" });
    }

    // 🔒 Rule khách hàng: mỗi khách chỉ có 1 lịch sân tháng đang hoạt động
    if (MaKH) {
      const [activeByCustomer] = await db.execute(
        `SELECT MaDatSanThang FROM tbl_datsanthang
         WHERE MaKH = ? AND TrangThai IN ('Hoạt động', 'Chờ xác nhận')
         LIMIT 1`,
        [MaKH]
      );
      if (activeByCustomer.length > 0) {
        return res.status(409).json({ message: "Bạn đã có lịch sân tháng đang hoạt động. Mỗi khách chỉ được 1 lịch sân tháng." });
      }
    }

    // 🔴 KIỂM TRA TRÙNG VỚI ĐẶT SÂN NGÀY
    const sanPlaceholders = MaSan.map(() => "?").join(",");
    const dayPlaceholders = danhSachNgay.map(() => "?").join(",");
    const [dailyBookings] = await db.execute(
      `SELECT MaDatSan, MaSan, NgayLap, GioVao, GioRa, GhiChu, TrangThai
       FROM tbl_datsan
       WHERE MaSan IN (${sanPlaceholders})
         AND DATE(NgayLap) IN (${dayPlaceholders})
         AND TrangThai <> 'cancelled'`,
      [...MaSan, ...danhSachNgay]
    );

    const dailyConflicts = [];
    for (const booking of dailyBookings) {
      const bookedStart = String(booking.GioVao || "00:00:00").slice(0, 8);
      const bookedEnd = String(booking.GioRa || "00:00:00").slice(0, 8);
      if (gioVaoCheck < bookedEnd && bookedStart < gioRaCheck) {
        dailyConflicts.push({
          san: booking.MaSan,
          ngay: String(booking.NgayLap).split("T")[0],
          gio: `${bookedStart.slice(0, 5)} - ${bookedEnd.slice(0, 5)}`,
          khach: booking.GhiChu || "Đã đặt",
        });
      }
    }

    if (dailyConflicts.length > 0) {
      return res.status(409).json({
        message: "❌ Trùng với lịch đặt sân ngày!",
        conflicts: dailyConflicts,
      });
    }

    // 🔴 KIỂM TRA TRÙNG LỊCH
    // Lấy tất cả đặt sân tháng có ngày và giờ trùng với sân đang chọn
    const sanListStr = Array.isArray(MaSan) ? MaSan : [MaSan];

    const [existingBookings] = await db.execute(`
      SELECT MaDatSanThang, DanhSachSan, DanhSachNgay, GioBatDau, GioKetThuc, GhiChu
      FROM tbl_datsanthang
      WHERE TrangThai = 'Hoạt động' OR TrangThai = 'Chờ xác nhận'
    `);

    const conflicts = [];
    for (const booking of existingBookings) {
      // Parse danh sách sân - có thể là "S1" hoặc "S1,S2" hoặc "S1, S2"
      let bookedSans = [];
      if (booking.DanhSachSan) {
        bookedSans = booking.DanhSachSan.split(',').map(s => s.trim());
      }
      
      // Kiểm tra có sân nào trùng không
      const overlappingSans = sanListStr.filter(s => bookedSans.includes(s));
      if (overlappingSans.length === 0) continue;

      // Parse danh sách ngày
      let bookedDays = [];
      try {
        if (typeof booking.DanhSachNgay === 'string') {
          bookedDays = JSON.parse(booking.DanhSachNgay);
        } else if (Array.isArray(booking.DanhSachNgay)) {
          bookedDays = booking.DanhSachNgay;
        }
      } catch (e) {
        bookedDays = [];
      }

      // Kiểm tra có ngày nào trùng không
      const overlappingDays = danhSachNgay.filter(d => bookedDays.includes(d));
      if (overlappingDays.length === 0) continue;

      // Kiểm tra có giờ nào trùng không
      const bookedStart = booking.GioBatDau?.slice(0, 8) || '00:00:00';
      const bookedEnd = booking.GioKetThuc?.slice(0, 8) || '00:00:00';
      
      // Giờ trùng nếu: start1 < end2 AND start2 < end1
      if (gioVaoCheck < bookedEnd && bookedStart < gioRaCheck) {
        conflicts.push({
          san: overlappingSans.join(', '),
          ngay: overlappingDays.slice(0, 3).join(', ') + (overlappingDays.length > 3 ? ` (+${overlappingDays.length - 3} ngày)` : ''),
          gio: `${bookedStart.slice(0,5)} - ${bookedEnd.slice(0,5)}`,
          khach: booking.GhiChu || 'Đã đặt'
        });
      }
    }

    if (conflicts.length > 0) {
      return res.status(409).json({
        message: "❌ Lịch đặt bị trùng!",
        conflicts: conflicts
      });
    }

    // 🧾 Tạo mã đặt sân tháng
    const MaDatSanThang = "DST" + Date.now();

    const trangThaiDatSan = "Chờ xác nhận";

    // 💰 Tính tiền đã thanh toán và trạng thái
    let SoTienDaThanhToan = 0;
    let TrangThaiThanhToan = "Chưa thanh toán";

    if (LoaiThanhToan === "50%") {
      SoTienDaThanhToan = (TongTienThuc || TongTien) * 0.5;
      TrangThaiThanhToan = "Đã cọc";
    } else if (LoaiThanhToan === "100%") {
      SoTienDaThanhToan = TongTienThuc || TongTien;
      TrangThaiThanhToan = "Đã thanh toán";
    }

    // 🗓️ Ngày bắt đầu và kết thúc tháng
    const ngayBatDau = danhSachNgay[0];
    const ngayKetThuc = danhSachNgay[danhSachNgay.length - 1];

    // 💾 Lưu vào bảng tbl_datsanthang
    const sql = `
      INSERT INTO tbl_datsanthang (
        MaDatSanThang, MaKH, MaNV, DanhSachSan, NgayBatDau, NgayKetThuc,
        DanhSachNgay, GioBatDau, GioKetThuc, TongGio, TongTien, GiamGia,
        TongTienThuc, LoaiThanhToan, SoTienDaThanhToan, TrangThaiThanhToan,
        GhiChu, PaymentScreenshot, TrangThai
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.execute(sql, [
      MaDatSanThang,
      MaKH || null,
      MaNV || "",
      Array.isArray(MaSan) ? MaSan.join(",") : MaSan,
      ngayBatDau,
      ngayKetThuc,
      JSON.stringify(danhSachNgay),
      gioVaoFormat,
      gioRaFormat,
      TongGio || 1,
      TongTien || 0,
      GiamGia || 0,
      TongTienThuc || TongTien || 0,
      LoaiThanhToan,
      SoTienDaThanhToan,
      TrangThaiThanhToan,
      GhiChu,
      PaymentScreenshot,
      trangThaiDatSan,
    ]);

    // ✅ Phản hồi
    res.json({
      message: "✅ Đặt sân tháng thành công!",
      MaDatSanThang,
      TongTienThuc: TongTienThuc || TongTien,
      SoTienDaThanhToan,
      TrangThaiThanhToan,
      LoaiThanhToan,
      SoNgay: danhSachNgay.length,
      San: MaSan,
      PaymentScreenshot,
    });
  } catch (err) {
    console.error("❌ Lỗi khi đặt sân tháng:", err);
    res.status(500).json({
      message: "Lỗi khi đặt sân tháng",
      error: err.message,
    });
  }
}
