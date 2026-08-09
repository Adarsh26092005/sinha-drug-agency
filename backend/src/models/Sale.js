const mongoose = require("mongoose");

const saleItemSchema = new mongoose.Schema({
    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Purchase", required: true },
    medicineName: { type: String, required: true },
    batchNumber: { type: String, required: true },
    mrp: { type: Number, required: true },
    expiryDate: { type: Date, required: true },
    quantity: { type: Number, required: true },
    pricePerItem: { type: Number, required: true },
    total: { type: Number, required: true },
});

const saleSchema = new mongoose.Schema(
    {
        owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        billNumber: { type: String, required: true },
        customerName: { type: String, default: "" },
        customerDLNo: { type: String, default: "" },
        customerAddress: { type: String, default: "" },
        items: [saleItemSchema],
        subtotal: { type: Number, required: true },
        discountPercent: { type: Number, default: 0 },
        discountAmount: { type: Number, default: 0 },
        gstPercent: { type: Number, default: 0 },
        gstAmount: { type: Number, default: 0 },
        totalAmount: { type: Number, required: true },
        saleDate: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

saleSchema.index({ owner: 1, billNumber: 1 }, { unique: true });

module.exports = mongoose.model("Sale", saleSchema);