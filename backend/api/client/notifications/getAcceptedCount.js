import { db } from "../../../config/db.js";

const normalizeStatus = (status) =>
  String(status || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

const isAcceptedStatus = (status) => {
  const normalized = normalizeStatus(status);
  return (
    normalized.includes("accepted") ||
    normalized.includes("da xac nhan") ||
    normalized.includes("hoat dong") ||
    normalized.includes("da dat san")
  );
};

export async function getAcceptedCount(req, res) {
  try {
    const { MaKH } = req.query;
    if (!MaKH) {
      return res.status(400).json({ message: "Thiếu MaKH" });
    }

    const [dayRows] = await db.execute(
      `SELECT MaDatSan, TrangThai FROM tbl_datsan WHERE MaKH = ?`,
      [MaKH]
    );

    const [monthRows] = await db.execute(
      `SELECT MaDatSanThang, TrangThai FROM tbl_datsanthang WHERE MaKH = ?`,
      [MaKH]
    );

    const acceptedDayItems = dayRows
      .filter((row) => isAcceptedStatus(row.TrangThai))
      .map((row) => `day:${row.MaDatSan}`);

    const acceptedMonthItems = monthRows
      .filter((row) => isAcceptedStatus(row.TrangThai))
      .map((row) => `month:${row.MaDatSanThang}`);

    const acceptedDay = acceptedDayItems.length;
    const acceptedMonth = acceptedMonthItems.length;
    const acceptedItems = [...acceptedDayItems, ...acceptedMonthItems];

    res.json({
      acceptedDay,
      acceptedMonth,
      totalAccepted: acceptedDay + acceptedMonth,
      acceptedItems,
    });
  } catch (error) {
    console.error("❌ Lỗi đếm thông báo khách hàng:", error);
    res.status(500).json({
      message: "Lỗi lấy số lượng thông báo khách hàng",
      error: error.message,
    });
  }
}
