const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
    {
        owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        medicine: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
        medicineName: { type: String, required: true },
        batchNumber: { type: String, required: true, trim: true },
        unit: { type: String, default: "pcs" },
        quantity: { type: Number, required: true },
        currentStock: { type: Number, required: true },
        pricePerItem: { type: Number, required: true },
        mrp: { type: Number, required: true },
        markedPrice: { type: Number, required: true },
        totalCost: { type: Number, required: true },
        expiryDate: { type: Date, required: true },
        purchaseDate: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

purchaseSchema.index({ owner: 1, medicine: 1, batchNumber: 1 }, { unique: true });

module.exports = mongoose.model("Purchase", purchaseSchema);