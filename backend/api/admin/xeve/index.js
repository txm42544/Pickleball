import express from "express";

const router = express.Router();

// API for 'xeve' (sự kiện/xé vé) has been removed. Return 404 for safety.
router.all("*", (req, res) => {
  return res.status(404).json({ message: "❌ API 'xeve' đã bị gỡ bỏ." });
});

export default router;
