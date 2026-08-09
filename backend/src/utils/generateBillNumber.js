const Sale = require("../models/Sale");

// Generates something like: BILL-20260808-0001
const generateBillNumber = async () => {
    const today = new Date();
    const datePart = today.toISOString().slice(0, 10).replace(/-/g, "");

    const countToday = await Sale.countDocuments({
        billNumber: { $regex: `^BILL-${datePart}` },
    });

    const sequence = String(countToday + 1).padStart(4, "0");
    return `BILL-${datePart}-${sequence}`;
};

module.exports = generateBillNumber;