const express = require("express");
const {
    getDashboardSummary,
    getMonthlySales,
    getTopSellingByCategory,
} = require("../controllers/dashboardController");
const protect = require("../middleware/auth");

const router = express.Router();

router.get("/summary", protect, getDashboardSummary);
router.get("/monthly-sales", protect, getMonthlySales);
router.get("/top-selling-by-category", protect, getTopSellingByCategory);

module.exports = router;