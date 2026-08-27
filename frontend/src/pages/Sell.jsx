import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Trash2, Receipt, Loader2, Download, Plus, ChevronDown, Printer } from "lucide-react";
import toast from "react-hot-toast";
import API from "../api/axios";
import Layout from "../components/Layout";
import { formatCurrency } from "../utils/formatCurrency";
import { formatExpiry } from "../utils/formatDate";

export default function Sell() {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [cart, setCart] = useState([]);
    const [discountPercent, setDiscountPercent] = useState(0);
    const [gstPercent, setGstPercent] = useState(0);
    const [showCustomerFields, setShowCustomerFields] = useState(true);
    const [customerName, setCustomerName] = useState("");
    const [customerDLNo, setCustomerDLNo] = useState("");
    const [customerAddress, setCustomerAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [completedSale, setCompletedSale] = useState(null);
    const debounceRef = useRef(null);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!query.trim()) {
            setSuggestions([]);
            return;
        }
        debounceRef.current = setTimeout(async () => {
            try {
                const { data } = await API.get(`/medicines/in-stock?q=${query}`);
                setSuggestions(data);
            } catch (err) {
                console.error(err);
            }
        }, 300);
        return () => clearTimeout(debounceRef.current);
    }, [query]);

    const handleAddToCart = (batch) => {
        if (cart.some((item) => item.batchId === batch._id)) {
            toast.error("Already added to bill. Update quantity instead.");
            return;
        }
        setCart([
            ...cart,
            {
                batchId: batch._id,
                name: batch.medicineName,
                batchNumber: batch.batchNumber,
                unit: batch.unit,
                mrp: batch.mrp,
                markedPrice: batch.markedPrice,
                availableStock: batch.currentStock,
                quantity: 1,
            },
        ]);
        setQuery("");
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleQuantityChange = (batchId, newQty) => {
        setCart(
            cart.map((item) =>
                item.batchId === batchId
                    ? { ...item, quantity: Math.max(1, Number(newQty) || 1) }
                    : item
            )
        );
    };

    const handleRemoveItem = (batchId) => {
        setCart(cart.filter((item) => item.batchId !== batchId));
    };

    const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.markedPrice, 0);
    const discountAmount = Math.round((subtotal * (Number(discountPercent) || 0)) / 100);
    const afterDiscount = subtotal - discountAmount;
    const gstAmount = Math.round((afterDiscount * (Number(gstPercent) || 0)) / 100);
    const totalPayable = afterDiscount + gstAmount;

    const handleCompleteSale = async () => {
        if (cart.length === 0) {
            toast.error("Add at least one medicine to the bill");
            return;
        }
        if (!customerName.trim()) {
            toast.error("Customer name is required");
            return;
        }
        if (!customerDLNo.trim()) {
            toast.error("Customer DL No. is required");
            return;
        }
        if (!customerAddress.trim()) {
            toast.error("Customer address is required");
            return;
        }
        for (const item of cart) {
            if (item.quantity > item.availableStock) {
                toast.error(`Not enough stock for ${item.name}. Available: ${item.availableStock}`);
                return;
            }
        }

        setLoading(true);
        try {
            const { data } = await API.post("/sales", {
                items: cart.map((item) => ({ batchId: item.batchId, quantity: item.quantity })),
                discountPercent: Number(discountPercent) || 0,
                gstPercent: Number(gstPercent) || 0,
                customerName,
                customerDLNo,
                customerAddress,
            });

            setCompletedSale(data);
            toast.success(`Bill ${data.billNumber} created!`);
            setCart([]);
            setDiscountPercent(0);
            setGstPercent(0);
            setCustomerName("");
            setCustomerDLNo("");
            setCustomerAddress("");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create bill");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPdf = async () => {
        try {
            const res = await API.get(`/sales/${completedSale._id}/pdf`, { responseType: "blob" });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${completedSale.billNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            toast.error("Failed to download PDF");
        }
    };

    const handlePrintPdf = async () => {
        try {
            const res = await API.get(`/sales/${completedSale._id}/pdf`, { responseType: "blob" });
            const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
            window.open(url, "_blank");
        } catch (err) {
            toast.error("Failed to open bill for printing");
        }
    };

    const startNewBill = () => setCompletedSale(null);

    return (
        <Layout>
            <h1 className="text-2xl font-bold text-white mb-1">Sell / Billing</h1>
            <p className="text-slate-400 mb-6">Create a new bill — pick the exact batch to sell from</p>

            {completedSale ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md bg-slate-900/60 border border-emerald-500/30 rounded-xl p-8 text-center"
                >
                    <div className="bg-emerald-500/15 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Receipt className="w-7 h-7 text-emerald-400" />
                    </div>
                    <h2 className="text-white text-xl font-bold mb-1">Bill Created!</h2>
                    <p className="text-slate-400 text-sm mb-1">{completedSale.billNumber}</p>
                    <p className="text-emerald-400 text-2xl font-bold my-4">{formatCurrency(completedSale.totalAmount)}</p>
                    <div className="flex gap-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleDownloadPdf}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Download
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handlePrintPdf}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                            <Printer className="w-4 h-4" />
                            Print
                        </motion.button>
                    </div>
                    <button
                        onClick={startNewBill}
                        className="w-full mt-3 bg-slate-800/60 hover:bg-slate-800 text-slate-300 font-medium py-2.5 rounded-lg transition-all"
                    >
                        New Bill
                    </button>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                                autoComplete="off"
                                placeholder="Search medicine to add..."
                                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            />
                            <AnimatePresence>
                                {showSuggestions && suggestions.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden max-h-80 overflow-y-auto"
                                    >
                                        {suggestions.map((batch) => (
                                            <button
                                                type="button"
                                                key={batch._id}
                                                onClick={() => handleAddToCart(batch)}
                                                className="w-full text-left px-4 py-2.5 hover:bg-slate-700/60 transition-colors border-b border-slate-700/50 last:border-0"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-white text-sm font-medium">
                                                        {batch.medicineName}
                                                    </span>
                                                    <span className="text-emerald-400 text-xs">
                                                        {formatCurrency(batch.markedPrice)} (MRP {formatCurrency(batch.mrp)})
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between mt-0.5">
                                                    <span className="text-slate-400 text-xs">
                                                        Batch: {batch.batchNumber} • Stock: {batch.currentStock} {batch.unit}
                                                    </span>
                                                    <span className="text-slate-500 text-xs">
                                                        Exp: {formatExpiry(batch.expiryDate)}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
                            {cart.length === 0 ? (
                                <div className="text-center py-12">
                                    <Plus className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                    <p className="text-slate-500 text-sm">
                                        Search and add medicines to start a bill
                                    </p>
                                </div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-800 text-slate-400 text-left">
                                            <th className="px-4 py-3 font-medium">Medicine</th>
                                            <th className="px-4 py-3 font-medium w-24">Qty</th>
                                            <th className="px-4 py-3 font-medium">Rate</th>
                                            <th className="px-4 py-3 font-medium">Total</th>
                                            <th className="px-4 py-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <AnimatePresence>
                                            {cart.map((item) => (
                                                <motion.tr
                                                    key={item.batchId}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 10 }}
                                                    className="border-b border-slate-800/60"
                                                >
                                                    <td className="px-4 py-3 text-white">
                                                        {item.name}
                                                        <div className="text-xs text-slate-500">
                                                            Batch {item.batchNumber} • Available: {item.availableStock}{" "}
                                                            {item.unit}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max={item.availableStock}
                                                            value={item.quantity}
                                                            onChange={(e) => handleQuantityChange(item.batchId, e.target.value)}
                                                            className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-300">{formatCurrency(item.markedPrice)}</td>
                                                    <td className="px-4 py-3 text-white font-medium">
                                                        {formatCurrency(item.quantity * item.markedPrice)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <button
                                                            onClick={() => handleRemoveItem(item.batchId)}
                                                            className="text-slate-500 hover:text-red-400 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Customer details (optional) */}
                        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
                            <button
                                onClick={() => setShowCustomerFields(!showCustomerFields)}
                                className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-300 hover:bg-slate-800/40 transition-colors"
                            >
                                <span>Customer Details</span>
                                <ChevronDown
                                    className={`w-4 h-4 transition-transform ${showCustomerFields ? "rotate-180" : ""
                                        }`}
                                />
                            </button>
                            <AnimatePresence>
                                {showCustomerFields && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="px-4 pb-4 space-y-3 border-t border-slate-800"
                                    >
                                        <div className="pt-3">
                                            <label className="text-xs text-slate-400 mb-1 block">
                                                Customer / M/s Name <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={customerName}
                                                onChange={(e) => setCustomerName(e.target.value)}
                                                placeholder="e.g. City Medical Store"
                                                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 mb-1 block">
                                                Customer DL No. <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={customerDLNo}
                                                onChange={(e) => setCustomerDLNo(e.target.value)}
                                                placeholder="Drug license number"
                                                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 mb-1 block">
                                                Address <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={customerAddress}
                                                onChange={(e) => setCustomerAddress(e.target.value)}
                                                placeholder="Customer address"
                                                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 h-fit sticky top-8"
                    >
                        <h2 className="text-white font-semibold mb-4">Bill Summary</h2>

                        <div className="space-y-3 mb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Subtotal</span>
                                <span className="text-white">{formatCurrency(subtotal)}</span>
                            </div>

                            <div>
                                <label className="text-sm text-slate-400 block mb-1">Discount (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={discountPercent}
                                    onChange={(e) => setDiscountPercent(e.target.value)}
                                    placeholder="0"
                                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Discount Amount</span>
                                <span className="text-red-400">-{formatCurrency(discountAmount)}</span>
                            </div>

                            <div>
                                <label className="text-sm text-slate-400 block mb-1">GST (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={gstPercent}
                                    onChange={(e) => setGstPercent(e.target.value)}
                                    placeholder="0"
                                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">GST Amount</span>
                                <span className="text-emerald-300">+{formatCurrency(gstAmount)}</span>
                            </div>

                            <div className="border-t border-slate-800 pt-3 flex justify-between items-center">
                                <span className="text-slate-300 font-medium">Total Payable</span>
                                <span className="text-emerald-400 font-bold text-xl">
                                    {formatCurrency(totalPayable)}
                                </span>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleCompleteSale}
                            disabled={loading || cart.length === 0}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Receipt className="w-4 h-4" />
                                    Complete Sale
                                </>
                            )}
                        </motion.button>
                    </motion.div>
                </div>
            )}
        </Layout>
    );
}