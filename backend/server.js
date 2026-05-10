import 'dotenv/config';

import express from "express";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from "./api/index.js";

// Cần thiết để lấy __dirname trong ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS configuration - ĐẶT NGAY TRÊN CÙNG trước mọi route
const corsOptions = {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Middleware để phục vụ file tĩnh từ thư mục 'uploads'
// Điều này rất quan trọng để hiển thị hình ảnh sản phẩm
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
