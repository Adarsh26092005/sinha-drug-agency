const express = require("express");
const {
    getDashboardSummary,
    getMonthlySales,
    getTopSellingMedicines,
} = require("../controllers/dashboardController");
const protect = require("../middleware/auth");

const router = express.Router();

router.get("/summary", protect, getDashboardSummary);
router.get("/monthly-sales", protect, getMonthlySales);
router.get("/top-selling", protect, getTopSellingMedicines);

module.exports = router;