import express from "express";
import { postDatSanThang, uploadPaymentScreenshotThang } from "./postDatSanThang.js";
import { getDatSanThang } from "./getDatSanThang.js";
import { getSanThangHistoryByKH } from "./sanThangHistory.js";
import { cancelDatSanThang } from "./cancelDatSanThang.js";
import { acceptDatSanThang } from "./acceptDatSanThang.js";

const router = express.Router();

// 🧾 Đặt sân tháng (có hỗ trợ upload ảnh thanh toán)
router.post("/book", uploadPaymentScreenshotThang.single("PaymentScreenshot"), postDatSanThang);

// 📋 Lấy danh sách đặt sân tháng
router.get("/list", getDatSanThang);

// 🛑 Hủy đặt sân tháng
router.put("/cancel", cancelDatSanThang);

// ✅ Xác nhận đặt sân tháng
router.put("/accept", acceptDatSanThang);

// Lịch sử đặt sân tháng theo khách hàng
router.get("/history", getSanThangHistoryByKH);

export default router;
