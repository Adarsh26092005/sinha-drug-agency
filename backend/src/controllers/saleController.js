const Purchase = require("../models/Purchase");
const Sale = require("../models/Sale");
const generateBillNumber = require("../utils/generateBillNumber");
const generateBillPdf = require("../utils/generatePdf");
const roundMoney = require("../utils/roundMoney");

const createSale = async (req, res) => {
    try {
        const {
            items,
            discountPercent = 0,
            gstPercent = 0,
            customerName = "",
            customerDLNo = "",
            customerAddress = "",
        } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "At least one item is required" });
        }

        let subtotal = 0;
        const saleItems = [];

        for (const item of items) {
            const batch = await Purchase.findOne({ _id: item.batchId, owner: req.userId });
            if (!batch) return res.status(404).json({ message: "Batch not found" });

            const quantity = Number(item.quantity);
            if (quantity <= 0) {
                return res.status(400).json({ message: `Invalid quantity for ${batch.medicineName}` });
            }
            if (batch.currentStock < quantity) {
                return res.status(400).json({
                    message: `Not enough stock for ${batch.medicineName} (Batch ${batch.batchNumber}). Available: ${batch.currentStock}`,
                });
            }

            const total = roundMoney(quantity * batch.markedPrice);
            subtotal += total;

            saleItems.push({
                batch: batch._id,
                medicineName: batch.medicineName,
                batchNumber: batch.batchNumber,
                mrp: batch.mrp,
                expiryDate: batch.expiryDate,
                quantity,
                pricePerItem: batch.markedPrice,
                total,
            });
        }

        subtotal = roundMoney(subtotal);

        const discount = Number(discountPercent) || 0;
        const discountAmount = roundMoney((subtotal * discount) / 100);
        const afterDiscount = roundMoney(subtotal - discountAmount);

        const gst = Number(gstPercent) || 0;
        const gstAmount = roundMoney((afterDiscount * gst) / 100);
        const totalAmount = roundMoney(afterDiscount + gstAmount);

        const billNumber = await generateBillNumber(req.userId);

        const sale = await Sale.create({
            owner: req.userId,
            billNumber,
            customerName,
            customerDLNo,
            customerAddress,
            items: saleItems,
            subtotal,
            discountPercent: discount,
            discountAmount,
            gstPercent: gst,
            gstAmount,
            totalAmount,
        });

        for (const item of saleItems) {
            await Purchase.findByIdAndUpdate(item.batch, { $inc: { currentStock: -item.quantity } });
        }

        res.status(201).json(sale);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getSalesHistory = async (req, res) => {
    try {
        const sales = await Sale.find({ owner: req.userId }).sort({ createdAt: -1 });
        res.json(sales);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const downloadBillPdf = async (req, res) => {
    try {
        const sale = await Sale.findOne({ _id: req.params.id, owner: req.userId });
        if (!sale) return res.status(404).json({ message: "Sale not found" });
        generateBillPdf(res, sale);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { createSale, getSalesHistory, downloadBillPdf };