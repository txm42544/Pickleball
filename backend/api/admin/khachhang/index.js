import express from "express";
import { getAllKhachHang } from "./getAllKhachHang.js";
import { searchKhachHang } from "./getSearch.js";
import { postKhachHang } from "./postKhachHang.js";
import { getKhachHangByMaKH } from "./getKhachHangByMaKH.js";
import { updateKhachHang } from "./updateKhachHang.js";
import { deleteKhachHang } from "./deleteKhachHang.js";

const router = express.Router();

router.get("/", getAllKhachHang);
router.get("/search", searchKhachHang);
router.post("/", postKhachHang);
router.get("/idsearch", getKhachHangByMaKH);
router.put("/:id", updateKhachHang);
router.delete("/:id", deleteKhachHang);

export default router;
