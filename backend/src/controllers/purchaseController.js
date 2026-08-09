const Medicine = require("../models/Medicine");
const Purchase = require("../models/Purchase");
const roundMoney = require("../utils/roundMoney");

const addPurchase = async (req, res) => {
    try {
        let { medicineName, batchNumber, quantity, pricePerItem, mrp, markedPrice, unit, expiryDate } =
            req.body;

        if (!medicineName || !batchNumber || !quantity || !pricePerItem || !mrp || !markedPrice || !expiryDate) {
            return res.status(400).json({
                message: "All fields are required, including batch number, MRP and expiry date",
            });
        }

        medicineName = medicineName.trim();
        batchNumber = batchNumber.trim();
        quantity = Number(quantity);
        pricePerItem = Number(pricePerItem);
        mrp = Number(mrp);
        markedPrice = Number(markedPrice);
        const expiry = new Date(expiryDate);

        if (quantity <= 0 || pricePerItem <= 0 || mrp <= 0 || markedPrice <= 0) {
            return res.status(400).json({ message: "Values must be greater than 0" });
        }
        if (isNaN(expiry.getTime())) {
            return res.status(400).json({ message: "Invalid expiry date" });
        }

        let medicine = await Medicine.findOne({
            name: { $regex: `^${medicineName}$`, $options: "i" },
        });

        if (!medicine) {
            medicine = await Medicine.create({ name: medicineName, unit: unit || "pcs" });
        } else if (unit) {
            medicine.unit = unit;
            await medicine.save();
        }

        let batch = await Purchase.findOne({
            medicine: medicine._id,
            batchNumber: { $regex: `^${batchNumber}$`, $options: "i" },
        });

        if (batch) {
            batch.quantity += quantity;
            batch.currentStock += quantity;
            batch.pricePerItem = pricePerItem;
            batch.mrp = mrp;
            batch.markedPrice = markedPrice;
            batch.expiryDate = expiry;
            batch.totalCost = roundMoney(batch.totalCost + quantity * pricePerItem);
            batch.purchaseDate = new Date();
            if (unit) batch.unit = unit;
            await batch.save();
        } else {
            batch = await Purchase.create({
                medicine: medicine._id,
                medicineName: medicine.name,
                batchNumber,
                unit: unit || medicine.unit,
                quantity,
                currentStock: quantity,
                pricePerItem,
                mrp,
                markedPrice,
                totalCost: roundMoney(quantity * pricePerItem),
                expiryDate: expiry,
            });
        }

        res.status(201).json({ purchase: batch, updatedStock: batch.currentStock });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: "This batch number already exists for this medicine" });
        }
        res.status(500).json({ message: err.message });
    }
};

const getPurchaseHistory = async (req, res) => {
    try {
        const purchases = await Purchase.find().sort({ createdAt: -1 });
        res.json(purchases);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deletePurchaseBatch = async (req, res) => {
    try {
        const batch = await Purchase.findById(req.params.id);
        if (!batch) return res.status(404).json({ message: "Batch not found" });
        await batch.deleteOne();
        res.json({ message: "Batch deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { addPurchase, getPurchaseHistory, deletePurchaseBatch };