import { db } from "../../../config/db.js";

const normalizeStatus = (status) =>
  String(status || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

const isPendingStatus = (status) => {
  const normalized = normalizeStatus(status);
  if (!normalized) return true;
  return normalized.includes("cho xac nhan") || normalized.includes("pending");
};

export async function getPendingCount(req, res) {
  try {
    const [dayRows] = await db.execute(`SELECT MaDatSan, TrangThai FROM tbl_datsan`);
    const [monthRows] = await db.execute(`SELECT MaDatSanThang, TrangThai FROM tbl_datsanthang`);

    const pendingDayItems = dayRows
      .filter((row) => isPendingStatus(row.TrangThai))
      .map((row) => `day:${row.MaDatSan}`);

    const pendingMonthItems = monthRows
      .filter((row) => isPendingStatus(row.TrangThai))
      .map((row) => `month:${row.MaDatSanThang}`);

    const pendingDay = pendingDayItems.length;
    const pendingMonth = pendingMonthItems.length;
    const pendingItems = [...pendingDayItems, ...pendingMonthItems];

    res.json({
      pendingDay,
      pendingMonth,
      totalPending: pendingDay + pendingMonth,
      pendingItems,
    });
  } catch (error) {
    console.error("❌ Lỗi đếm thông báo pending admin:", error);
    res.status(500).json({
      message: "Lỗi lấy số lượng thông báo admin",
      error: error.message,
    });
  }
}
