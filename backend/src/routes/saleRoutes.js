const express = require("express");
const { createSale, getSalesHistory, downloadBillPdf } = require("../controllers/saleController");
const protect = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, createSale);
router.get("/", protect, getSalesHistory);
router.get("/:id/pdf", protect, downloadBillPdf);

module.exports = router;