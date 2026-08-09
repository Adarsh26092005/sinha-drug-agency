const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true, trim: true },
        unit: { type: String, default: "pcs" },
    },
    { timestamps: true }
);

medicineSchema.index({ name: 1 });

module.exports = mongoose.model("Medicine", medicineSchema);