const Medicine = require("../models/Medicine");
const Purchase = require("../models/Purchase");

const searchMedicines = async (req, res) => {
    try {
        const query = req.query.q || "";
        if (!query.trim()) return res.json([]);

        const medicines = await Medicine.find({
            name: { $regex: query, $options: "i" },
        })
            .limit(10)
            .select("name unit");

        res.json(medicines);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const searchInStockMedicines = async (req, res) => {
    try {
        const query = req.query.q || "";
        const now = new Date();

        const filter = {
            currentStock: { $gt: 0 },
            expiryDate: { $gte: now },
        };
        if (query.trim()) {
            filter.medicineName = { $regex: query, $options: "i" };
        }

        const batches = await Purchase.find(filter)
            .sort({ expiryDate: 1 })
            .limit(15)
            .select("medicineName batchNumber unit currentStock pricePerItem mrp markedPrice expiryDate");

        res.json(batches);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getStockBatches = async (req, res) => {
    try {
        const now = new Date();
        const batches = await Purchase.find({
            currentStock: { $gt: 0 },
            expiryDate: { $gte: now },
        }).sort({ medicineName: 1, expiryDate: 1 });
        res.json(batches);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getExpiringSoonBatches = async (req, res) => {
    try {
        const now = new Date();
        const in6Months = new Date();
        in6Months.setMonth(now.getMonth() + 6);

        const batches = await Purchase.find({
            currentStock: { $gt: 0 },
            expiryDate: { $gte: now, $lte: in6Months },
        }).sort({ expiryDate: 1 });

        res.json(batches);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getExpiredBatches = async (req, res) => {
    try {
        const now = new Date();
        const batches = await Purchase.find({
            currentStock: { $gt: 0 },
            expiryDate: { $lt: now },
        }).sort({ expiryDate: -1 });

        res.json(batches);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Used by the "Low Stock" page - in-stock, not-yet-expired batches under the threshold
const getLowStockBatches = async (req, res) => {
    try {
        const now = new Date();
        const threshold = 20;

        const batches = await Purchase.find({
            currentStock: { $gt: 0, $lt: threshold },
            expiryDate: { $gte: now },
        }).sort({ currentStock: 1 });

        res.json(batches);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getStockBatches,
    searchMedicines,
    searchInStockMedicines,
    getExpiringSoonBatches,
    getExpiredBatches,
    getLowStockBatches,
};