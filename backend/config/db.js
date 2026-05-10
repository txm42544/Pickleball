import mysql from 'mysql2/promise';

// Đọc các biến môi trường, nếu không có thì fallback về XAMPP defaults
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'pickleball',
  port: process.env.DB_PORT || 3306,
};

// In các biến môi trường ra để debug
console.log('Database Configuration:', {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  port: dbConfig.port,
  password: dbConfig.password ? '***' : '(empty)',
});

const pool = mysql.createPool({
  ...dbConfig,
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
