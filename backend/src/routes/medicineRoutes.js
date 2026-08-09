const express = require("express");
const {
    getStockBatches,
    searchMedicines,
    searchInStockMedicines,
    getExpiringSoonBatches,
    getExpiredBatches,
    getLowStockBatches,
} = require("../controllers/medicineController");
const protect = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, getStockBatches);
router.get("/search", protect, searchMedicines);
router.get("/in-stock", protect, searchInStockMedicines);
router.get("/expiring-soon", protect, getExpiringSoonBatches);
router.get("/expired", protect, getExpiredBatches);
router.get("/low-stock", protect, getLowStockBatches);

module.exports = router;