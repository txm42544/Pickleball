import express from "express";
import { getAllPhieuNhap } from "./getAll.js";
import { getPhieuNhapById } from "./getById.js";
import { createPhieuNhap } from "./create.js";
import { deletePhieuNhap } from "./delete.js";
import { getThongKePhieuNhap } from "./getThongKe.js";

const router = express.Router();

router.get("/", getAllPhieuNhap);
router.get("/thongke", getThongKePhieuNhap);
router.get("/:id", getPhieuNhapById);
router.post("/", createPhieuNhap);
router.delete("/:id", deletePhieuNhap);

export default router;