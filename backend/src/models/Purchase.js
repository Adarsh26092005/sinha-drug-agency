const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
    {
        medicine: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
        medicineName: { type: String, required: true },
        batchNumber: { type: String, required: true, trim: true },
        unit: { type: String, default: "pcs" },
        quantity: { type: Number, required: true },
        currentStock: { type: Number, required: true },
        pricePerItem: { type: Number, required: true }, // cost price
        mrp: { type: Number, required: true },           // printed MRP
        markedPrice: { type: Number, required: true },   // actual selling rate (unit rate)
        totalCost: { type: Number, required: true },
        expiryDate: { type: Date, required: true },
        purchaseDate: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

purchaseSchema.index({ medicine: 1, batchNumber: 1 }, { unique: true });

module.exports = mongoose.model("Purchase", purchaseSchema);