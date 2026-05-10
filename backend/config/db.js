import mysql from 'mysql2/promise';

const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL || '';
const hasUrlConfig = Boolean(databaseUrl);
const dbConfig = hasUrlConfig
  ? databaseUrl
  : {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'pickleball',
      port: process.env.DB_PORT || 3306,
    };

// In các biến môi trường ra để debug
console.log('Database Configuration:', {
  source: hasUrlConfig ? 'DATABASE_URL' : 'DB_* env',
  host: hasUrlConfig ? '(from DATABASE_URL)' : dbConfig.host,
  user: hasUrlConfig ? '(from DATABASE_URL)' : dbConfig.user,
  database: hasUrlConfig ? '(from DATABASE_URL)' : dbConfig.database,
  port: hasUrlConfig ? '(from DATABASE_URL)' : dbConfig.port,
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
