import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function addColumns() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQLHOST || 'localhost',
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || 'root123',
    database: process.env.MYSQLDATABASE || 'pickleball',
    port: process.env.MYSQLPORT || 3306,
  });

  try {
    console.log('🔗 Đã kết nối database');

    // Kiểm tra các cột hiện có
    const [columns] = await connection.query('DESCRIBE tbl_datsan');
    const columnNames = columns.map(c => c.Field);
    console.log(' Các cột hiện có:', columnNames);

    // Thêm cột TienDichVu nếu chưa có
    if (!columnNames.includes('TienDichVu')) {
      await connection.query('ALTER TABLE tbl_datsan ADD COLUMN TienDichVu DECIMAL(15,2) DEFAULT 0');
      console.log(' Đã thêm cột TienDichVu');
    } else {
      console.log(' Cột TienDichVu đã tồn tại');
    }

    // Thêm cột DanhSachDichVu nếu chưa có
    if (!columnNames.includes('DanhSachDichVu')) {
      await connection.query('ALTER TABLE tbl_datsan ADD COLUMN DanhSachDichVu TEXT');
      console.log(' Đã thêm cột DanhSachDichVu');
    } else {
      console.log(' Cột DanhSachDichVu đã tồn tại');
    }

    // Thêm cột PaymentScreenshot nếu chưa có
    if (!columnNames.includes('PaymentScreenshot')) {
      await connection.query('ALTER TABLE tbl_datsan ADD COLUMN PaymentScreenshot VARCHAR(255)');
      console.log(' Đã thêm cột PaymentScreenshot');
    } else {
      console.log(' Cột PaymentScreenshot đã tồn tại');
    }

    console.log(' Hoàn tất cập nhật database!');

  } catch (error) {
    console.error(' Lỗi:', error.message);
  } finally {
    await connection.end();
  }
}

addColumns();
