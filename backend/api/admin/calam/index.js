// routes/calamRouter.js
import express from "express";
import { getAllCaLam, upsertCaLam ,approveCaLam} from "./calamController.js";

const router = express.Router();

// GET danh sách ca làm
router.get("/", getAllCaLam);

// POST thêm hoặc cập nhật ca làm
router.post("/", upsertCaLam);

// PUT cập nhật ca làm (tùy frontend muốn dùng PUT)
router.put("/", upsertCaLam);
router.patch("/approve", approveCaLam);

export default router;
