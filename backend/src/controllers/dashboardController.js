const Purchase = require("../models/Purchase");
const Sale = require("../models/Sale");
const roundMoney = require("../utils/roundMoney");

const getDashboardSummary = async (req, res) => {
    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const todaySales = await Sale.find({ saleDate: { $gte: startOfToday } });
        const todayRevenue = roundMoney(todaySales.reduce((sum, s) => sum + s.totalAmount, 0));

        const now = new Date();
        const batches = await Purchase.find({
            currentStock: { $gt: 0 },
            expiryDate: { $gte: now },
        });

        const totalStockValue = roundMoney(
            batches.reduce((sum, b) => sum + b.currentStock * b.pricePerItem, 0)
        );

        const distinctMedicineNames = new Set(batches.map((b) => b.medicineName.toLowerCase()));
        const totalMedicines = distinctMedicineNames.size;

        res.json({
            todayRevenue,
            todaySalesCount: todaySales.length,
            totalStockValue,
            totalMedicines,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getMonthlySales = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();

        const monthlyData = await Sale.aggregate([
            {
                $match: {
                    saleDate: {
                        $gte: new Date(`${currentYear}-01-01`),
                        $lte: new Date(`${currentYear}-12-31T23:59:59`),
                    },
                },
            },
            {
                $group: {
                    _id: { $month: "$saleDate" },
                    totalRevenue: { $sum: "$totalAmount" },
                    totalBills: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ];

        const result = monthNames.map((name, index) => {
            const found = monthlyData.find((m) => m._id === index + 1);
            return {
                month: name,
                revenue: found ? found.totalRevenue : 0,
                bills: found ? found.totalBills : 0,
            };
        });

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getTopSellingMedicines = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const topSelling = await Sale.aggregate([
            { $match: { saleDate: { $gte: startOfMonth } } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.medicineName",
                    totalQuantity: { $sum: "$items.quantity" },
                    totalRevenue: { $sum: "$items.total" },
                },
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 8 },
        ]);

        const result = topSelling.map((m) => ({
            name: m._id,
            quantity: m.totalQuantity,
            revenue: m.totalRevenue,
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getDashboardSummary, getMonthlySales, getTopSellingMedicines };