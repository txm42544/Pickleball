import express from "express";
import { getAllXeVe } from "./getAllXeVe.js";
import { getXeVe } from "./getXeVe.js";
import { postXeVe } from "./postXeVe.js";
import { putXeVeStatus } from "./putXeVeStatus.js";
import { putXeVe } from "./putXeVe.js";
import { deleteXeVe } from "./deleteXeVe.js";
import { getXeVeById } from "./getXeVeById.js";
import { getXeVeByDate } from "./getXeVeByDate.js";

const router = express.Router();

// ✅ Đặt route cụ thể trước route tổng quát
router.get("/date", getXeVeByDate);
router.get("/getXeVeById/:MaXeVe", getXeVeById);
router.get("/:MaXeVe", getXeVe);
router.get("/", getAllXeVe);
router.post("/", postXeVe);
router.put("/:MaXeVe/status", putXeVeStatus);
router.put("/:MaXeVe", putXeVe);
router.delete("/:MaXeVe", deleteXeVe);

export default router;
