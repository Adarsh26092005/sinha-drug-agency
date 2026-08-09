const Sale = require("../models/Sale");

const generateBillNumber = async (ownerId) => {
    const today = new Date();
    const datePart = today.toISOString().slice(0, 10).replace(/-/g, "");

    const countToday = await Sale.countDocuments({
        owner: ownerId,
        billNumber: { $regex: `^BILL-${datePart}` },
    });

    const sequence = String(countToday + 1).padStart(4, "0");
    return `BILL-${datePart}-${sequence}`;
};

module.exports = generateBillNumber;