import express from "express";
import { getAllTaiKhoan } from "./getAllTaiKhoan.js";
import { searchTaiKhoan } from "./getSearchTaiKhoan.js";
import { updateTaiKhoan } from "./updateTaiKhoan.js";
import { deleteTaiKhoan } from "./deleteTaiKhoan.js";
import { postTaiKhoan } from "./postTaiKhoan.js";
import { login } from "./Login.js";
import { forgotPassword } from "./forgot-password.js";
import { loginKhachHang } from "./LoginKH.js";
import { registerKhachHang } from "./register.js";
import { getKhachHangProfile } from "./LoginKH.js";
import { updateCustomerProfile } from './LoginKH.js';

const router = express.Router();

router.post("/login", login);
router.get("/", getAllTaiKhoan);
router.post("/", postTaiKhoan);
router.get("/search", searchTaiKhoan);
router.put("/", updateTaiKhoan);
router.delete("/:maTK", deleteTaiKhoan);
router.post("/forgot-password", forgotPassword);
router.post("/loginKhachHang", loginKhachHang);
router.post("/registerKhachHang", registerKhachHang);
router.get("/customer/profile", getKhachHangProfile);
router.put("/customer/profile/update", updateCustomerProfile);
export default router;
