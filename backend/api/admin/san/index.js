import express from "express";
import { getAllSan } from "./getAllSan.js";
import { acceptDatSan } from "./acceptDatSan.js";
import { cancelDatSan } from "./cancelDatSan.js";
import { postDatSan, uploadPaymentScreenshot } from "./postDatSan.js";
import { getAllSanInfo, createSan, updateSan, deleteSan, clearBookingHistory } from "./crudSan.js";
import { getBookingHistoryByKH } from "./bookingHistory.js";

const router = express.Router();

router.get("/", getAllSan);
router.put("/accept", acceptDatSan);
router.put("/cancel", cancelDatSan);
// Thêm upload.single("PaymentScreenshot") giống TTXeVe
router.post("/book", uploadPaymentScreenshot.single("PaymentScreenshot"), postDatSan);

// CRUD Quản lý sân
router.get("/list", getAllSanInfo);
router.post("/create", createSan);
router.put("/update/:MaSan", updateSan);
router.delete("/delete/:MaSan", deleteSan);
router.delete("/clear-history", clearBookingHistory);

// Lịch sử đặt sân theo khách hàng
router.get("/history", getBookingHistoryByKH);

export default router;