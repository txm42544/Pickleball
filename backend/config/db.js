import mysql from 'mysql2/promise';

// --- BẮT ĐẦU DEBUG ---
// In các biến môi trường database ra để kiểm tra
console.log({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
});
// --- KẾT THÚC DEBUG ---

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Kiểm tra kết nối khi khởi động server
pool.getConnection()
  .then(connection => {
    console.log('Kết nối database thành công!');
    connection.release(); // Trả kết nối về lại pool
  })
  .catch(err => {
    console.error('Không thể kết nối đến database:', err);
  });

// Xuất ra pool để các file khác có thể sử dụng
export const db = pool;
