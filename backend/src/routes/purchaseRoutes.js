const express = require("express");
const {
    addPurchase,
    getPurchaseHistory,
    deletePurchaseBatch,
} = require("../controllers/purchaseController");
const protect = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, addPurchase);
router.get("/", protect, getPurchaseHistory);
router.delete("/:id", protect, deletePurchaseBatch);

module.exports = router;