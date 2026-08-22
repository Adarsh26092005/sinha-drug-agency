import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Loader2, Search } from "lucide-react";
import toast from "react-hot-toast";
import API from "../api/axios";
import Layout from "../components/Layout";
import { formatCurrency } from "../utils/formatCurrency";

export default function BuyStock() {
    const [form, setForm] = useState({
        medicineName: "",
        batchNumber: "",
        quantity: "",
        pricePerItem: "",
        mrp: "",
        markedPrice: "",
        unit: "pcs",
        expiryDate: "",
    });
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef(null);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!form.medicineName.trim()) {
            setSuggestions([]);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            try {
                const { data } = await API.get(`/medicines/search?q=${form.medicineName}`);
                setSuggestions(data);
            } catch (err) {
                console.error(err);
            }
        }, 300);

        return () => clearTimeout(debounceRef.current);
    }, [form.medicineName]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSelectSuggestion = (medicine) => {
        setForm({ ...form, medicineName: medicine.name, unit: medicine.unit });
        setShowSuggestions(false);
    };

    const totalCost = (Number(form.quantity) || 0) * (Number(form.pricePerItem) || 0);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (Number(form.markedPrice) < Number(form.pricePerItem)) {
            toast.error("Marked price should usually be higher than cost price");
        }

        // Convert "YYYY-MM" to the last calendar day of that month
        const [year, month] = form.expiryDate.split("-").map(Number);
        const lastDayOfMonth = new Date(year, month, 0).toISOString().split("T")[0];

        setLoading(true);
        try {
            const { data } = await API.post("/purchases", { ...form, expiryDate: lastDayOfMonth });
            toast.success(
                `Batch ${form.batchNumber} of ${form.medicineName} added. Stock in this batch: ${data.updatedStock}`
            );
            setForm({
                medicineName: "",
                batchNumber: "",
                quantity: "",
                pricePerItem: "",
                mrp: "",
                markedPrice: "",
                unit: "pcs",
                expiryDate: "",
            });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add stock");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <h1 className="text-2xl font-bold text-white mb-1">Buy Stock</h1>
            <p className="text-slate-400 mb-6">
                Add a new stock batch — each batch tracks its own expiry and price
            </p>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="max-w-xl bg-slate-900/60 border border-slate-800 rounded-xl p-6"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <label className="text-sm text-slate-300 mb-1 block">Medicine Name</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                name="medicineName"
                                value={form.medicineName}
                                onChange={handleChange}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                                required
                                autoComplete="off"
                                placeholder="e.g. Paracetamol 500mg"
                                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            />
                        </div>

                        <AnimatePresence>
                            {showSuggestions && suggestions.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden"
                                >
                                    {suggestions.map((med) => (
                                        <button
                                            type="button"
                                            key={med._id}
                                            onClick={() => handleSelectSuggestion(med)}
                                            className="w-full text-left px-4 py-2.5 hover:bg-slate-700/60 transition-colors flex items-center justify-between"
                                        >
                                            <span className="text-white text-sm">{med.name}</span>
                                            <span className="text-slate-400 text-xs capitalize">{med.unit}</span>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div>
                        <label className="text-sm text-slate-300 mb-1 block">Batch Number</label>
                        <input
                            type="text"
                            name="batchNumber"
                            value={form.batchNumber}
                            onChange={handleChange}
                            required
                            placeholder="e.g. B2345"
                            className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-slate-300 mb-1 block">Unit</label>
                        <select
                            name="unit"
                            value={form.unit}
                            onChange={handleChange}
                            className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        >
                            <option value="pcs">Pieces</option>
                            <option value="strip">Strip</option>
                            <option value="bottle">Bottle</option>
                            <option value="box">Box</option>
                            <option value="vial">Vial</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm text-slate-300 mb-1 block">Quantity</label>
                        <input
                            type="number"
                            name="quantity"
                            value={form.quantity}
                            onChange={handleChange}
                            required
                            min="1"
                            placeholder="e.g. 100"
                            className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-slate-300 mb-1 block">Cost Price (per item)</label>
                        <input
                            type="number"
                            name="pricePerItem"
                            value={form.pricePerItem}
                            onChange={handleChange}
                            required
                            min="0.01"
                            step="0.01"
                            placeholder="You paid"
                            className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-slate-300 mb-1 block">MRP (printed)</label>
                            <input
                                type="number"
                                name="mrp"
                                value={form.mrp}
                                onChange={handleChange}
                                required
                                min="0.01"
                                step="0.01"
                                placeholder="Printed on pack"
                                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-slate-300 mb-1 block">Selling Rate</label>
                            <input
                                type="number"
                                name="markedPrice"
                                value={form.markedPrice}
                                onChange={handleChange}
                                required
                                min="0.01"
                                step="0.01"
                                placeholder="You'll sell at"
                                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-slate-300 mb-1 block">Expiry (Month/Year)</label>
                        <input
                            type="month"
                            name="expiryDate"
                            value={form.expiryDate}
                            onChange={handleChange}
                            required
                            min={new Date().toISOString().slice(0, 7)}
                            className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all [color-scheme:dark]"
                        />
                    </div>

                    <motion.div
                        key={totalCost}
                        initial={{ scale: 0.98 }}
                        animate={{ scale: 1 }}
                        className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-3"
                    >
                        <span className="text-slate-300 text-sm">Total Purchase Cost</span>
                        <span className="text-emerald-400 font-bold text-lg">{formatCurrency(totalCost)}</span>
                    </motion.div>

                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <ShoppingCart className="w-4 h-4" />
                                Add to Stock
                            </>
                        )}
                    </motion.button>
                </form>
            </motion.div>
        </Layout>
    );
}