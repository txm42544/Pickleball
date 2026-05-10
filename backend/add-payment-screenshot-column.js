// Script thêm cột PaymentScreenshot vào bảng tbl_datsanthang
import dotenv from "dotenv";
import mysql from "mysql2/promise";

// Load .env trước
dotenv.config();

async function addColumn() {
  let connection;
  try {
    // Tạo kết nối trực tiếp
    connection = await mysql.createConnection({
      host: process.env.MYSQLHOST || "localhost",
      user: process.env.MYSQLUSER || "root",
      password: process.env.MYSQLPASSWORD || "",
      database: process.env.MYSQLDATABASE || "pickleball",
      port: process.env.MYSQLPORT || 3306,
    });

    console.log("✅ Kết nối database thành công!");

    // Kiểm tra xem cột đã tồn tại chưa
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'tbl_datsanthang' 
      AND COLUMN_NAME = 'PaymentScreenshot'
    `);

    if (columns.length > 0) {
      console.log(" Cột PaymentScreenshot đã tồn tại!");
    } else {
      // Thêm cột mới
      await connection.execute(`
        ALTER TABLE tbl_datsanthang 
        ADD COLUMN PaymentScreenshot VARCHAR(255) DEFAULT NULL
      `);
      console.log(" Đã thêm cột PaymentScreenshot vào bảng tbl_datsanthang!");
    }

    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error(" Lỗi:", err.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

addColumn();
