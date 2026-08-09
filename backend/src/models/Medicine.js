const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
    {
        owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true, trim: true },
        unit: { type: String, default: "pcs" },
    },
    { timestamps: true }
);

// Name only needs to be unique within one owner's data, not globally
medicineSchema.index({ owner: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Medicine", medicineSchema);