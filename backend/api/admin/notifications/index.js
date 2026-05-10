import express from "express";
import { getPendingCount } from "./getPendingCount.js";

const router = express.Router();

router.get("/pending-count", getPendingCount);

export default router;
