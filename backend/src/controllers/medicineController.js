const Medicine = require("../models/Medicine");
const Purchase = require("../models/Purchase");

const searchMedicines = async (req, res) => {
    try {
        const query = req.query.q || "";
        if (!query.trim()) return res.json([]);

        const medicines = await Medicine.find({
            owner: req.userId,
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
            owner: req.userId,
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
            owner: req.userId,
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
            owner: req.userId,
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
            owner: req.userId,
            currentStock: { $gt: 0 },
            expiryDate: { $lt: now },
        }).sort({ expiryDate: -1 });

        res.json(batches);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Aggregates stock across ALL batches of the same medicine (case-insensitive name match).
// A medicine only counts as "low stock" if its combined total is under the threshold —
// e.g. a near-empty old batch doesn't trigger the alert if a newer batch has plenty.
const getLowStockBatches = async (req, res) => {
    try {
        const now = new Date();
        const threshold = 20;

        const result = await Purchase.aggregate([
            {
                $match: {
                    owner: req.userObjectId || req.userId,
                    currentStock: { $gt: 0 },
                    expiryDate: { $gte: now },
                },
            },
            {
                $group: {
                    _id: { $toLower: "$medicineName" },
                    medicineName: { $first: "$medicineName" },
                    unit: { $first: "$unit" },
                    totalStock: { $sum: "$currentStock" },
                },
            },
            { $match: { totalStock: { $lt: threshold } } },
            { $sort: { totalStock: 1 } },
            { $project: { _id: 0, medicineName: 1, unit: 1, totalStock: 1 } },
        ]);

        res.json(result);
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