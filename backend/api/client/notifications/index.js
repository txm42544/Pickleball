import express from "express";
import { getAcceptedCount } from "./getAcceptedCount.js";

const router = express.Router();

router.get("/accepted-count", getAcceptedCount);

export default router;
