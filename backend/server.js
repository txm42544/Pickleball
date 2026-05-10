import 'dotenv/config';

import express from "express";
import cors from "cors";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import apiRouter from "./api/index.js";

// Cần thiết để lấy __dirname trong ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const parseAllowedOrigins = () => {
  const envValue = process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || '';
  const origins = envValue
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (process.env.NODE_ENV !== 'production') {
    origins.push(
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:4173',
      'http://127.0.0.1:4173'
    );
  }

  return Array.from(new Set(origins));
};

const allowedOrigins = parseAllowedOrigins();
const corsOptions = {
  origin(origin, callback) {
    // Allow server-to-server requests and same-origin requests without Origin header.
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow Railway-hosted frontend domains even if not explicitly listed.
    if (/^https:\/\/[a-z0-9-]+(\.up)?\.railway\.app$/i.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Middleware để phục vụ file tĩnh từ thư mục 'uploads'
// Điều này rất quan trọng để hiển thị hình ảnh sản phẩm
const uploadsPath = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// Định tuyến API
app.use("/api", apiRouter);

// Kiểm tra server
app.get("/", (req, res) => {
  res.send(" Pickleball Backend đang chạy!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cửa đã mở! Server đang chạy trên port ${PORT}`);
});
