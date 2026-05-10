import express from "express";
import { getAllNhanVien } from "./getAllNhanVien.js";
import { searchNhanVien } from "./getSearch.js";
import { postNhanVien } from "./postNhanVien.js";
import { updateNhanVien } from "./updateNhanVien.js";
import { deleteNhanVien } from "./deleteNhanVien.js";

const router = express.Router();

router.get("/", getAllNhanVien);
router.get("/search", searchNhanVien);
router.post("/", postNhanVien);
router.put("/", updateNhanVien);
router.delete("/:maNV", deleteNhanVien);
export default router;
