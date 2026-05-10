import express from "express";
import { getAllNhaCungCap } from "./getAll.js";
import { createNhaCungCap } from "./create.js";
import { deleteNhaCungCap } from "./delete.js";

const router = express.Router();

router.get("/", getAllNhaCungCap);
router.post("/", createNhaCungCap);
router.delete("/:id", deleteNhaCungCap);

export default router;