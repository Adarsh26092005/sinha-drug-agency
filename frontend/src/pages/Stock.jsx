import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, Search, AlertCircle, Trash2, FileSpreadsheet } from "lucide-react";
import toast from "react-hot-toast";
import API from "../api/axios";
import Layout from "../components/Layout";
import { exportToExcel } from "../utils/exportExcel";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate, formatExpiry } from "../utils/formatDate";
import Pagination, { paginate } from "../components/Pagination";

export default function Stock() {
    const [batches, setBatches] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            const { data } = await API.get("/medicines");
            setBatches(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (batch) => {
        if (
            !window.confirm(
                `Delete batch "${batch.batchNumber}" of ${batch.medicineName}? This cannot be undone.`
            )
        ) {
            return;
        }
        setDeletingId(batch._id);
        try {
            await API.delete(`/purchases/${batch._id}`);
            setBatches((prev) => prev.filter((b) => b._id !== batch._id));
            toast.success("Batch deleted");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete");
        } finally {
            setDeletingId(null);
        }
    };

    const filtered = batches.filter((b) =>
        b.medicineName.toLowerCase().includes(search.toLowerCase())
    );
    const paginated = paginate(filtered, currentPage);

    const handleExport = () => {
        if (filtered.length === 0) {
            toast.error("Nothing to export");
            return;
        }
        const exportData = filtered.map((b) => ({
            "Medicine Name": b.medicineName,
            "Batch No": b.batchNumber,
            Unit: b.unit,
            "Current Stock": b.currentStock,
            "Cost Price": b.pricePerItem,
            MRP: b.mrp,
            "Selling Rate": b.markedPrice,
            "Expiry Date": formatExpiry(b.expiryDate),
        }));
        exportToExcel(exportData, "Stock_Inventory", "Stock");
        toast.success("Exported to Excel");
    };

    const getStockBadge = (stock) => {
        if (stock < 20) return "bg-amber-500/15 text-amber-400 border-amber-500/30";
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    };

    return (
        <Layout>
            <div className="flex items-center justify-between mb-1">
                <h1 className="text-2xl font-bold text-white">Stock / Inventory</h1>
            </div>
            <p className="text-slate-400 mb-6">
                {batches.length} batch{batches.length !== 1 ? "es" : ""} currently in stock
            </p>

            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                <div className="relative max-w-md flex-1 min-w-[240px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        placeholder="Search medicines..."
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
                >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    Export to Excel
                </button>
            </div>

            {loading ? (
                <p className="text-slate-400">Loading...</p>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-xl">
                    <Package className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">
                        {search ? "No medicines match your search" : "No stock available yet"}
                    </p>
                </div>
            ) : (
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-800 text-slate-400 text-left">
                                <th className="px-5 py-3 font-medium">Medicine Name</th>
                                <th className="px-5 py-3 font-medium">Batch No</th>
                                <th className="px-5 py-3 font-medium">MRP</th>
                                <th className="px-5 py-3 font-medium">Unit</th>
                                <th className="px-5 py-3 font-medium">Stock</th>
                                <th className="px-5 py-3 font-medium">Cost Price</th>
                                <th className="px-5 py-3 font-medium">Marked Price</th>
                                <th className="px-5 py-3 font-medium">Expiry</th>
                                <th className="px-5 py-3 font-medium">Status</th>
                                <th className="px-5 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.map((b, i) => (
                                <motion.tr
                                    key={b._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors"
                                >
                                    <td className="px-5 py-3 text-white font-medium">{b.medicineName}</td>
                                    <td className="px-5 py-3 text-slate-300">{b.batchNumber}</td>
                                    <td className="px-5 py-3 text-slate-300">{formatCurrency(b.mrp)}</td>
                                    <td className="px-5 py-3 text-slate-400 capitalize">{b.unit}</td>
                                    <td className="px-5 py-3 text-white">{b.currentStock}</td>
                                    <td className="px-5 py-3 text-slate-300">{formatCurrency(b.pricePerItem)}</td>
                                    <td className="px-5 py-3 text-slate-300">{formatCurrency(b.markedPrice)}</td>
                                    <td className="px-5 py-3">
                                        <span
                                            className={
                                                new Date(b.expiryDate) < new Date()
                                                    ? "text-red-400"
                                                    : new Date(b.expiryDate) <=
                                                        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                                        ? "text-amber-400"
                                                        : "text-slate-300"
                                            }
                                        >
                                            {formatExpiry(b.expiryDate)}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span
                                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${getStockBadge(
                                                b.currentStock
                                            )}`}
                                        >
                                            {b.currentStock < 20 && <AlertCircle className="w-3 h-3" />}
                                            {b.currentStock < 20 ? "Low Stock" : "In Stock"}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center justify-end">
                                            <button
                                                onClick={() => handleDelete(b)}
                                                disabled={deletingId === b._id}
                                                className="text-slate-400 hover:text-red-400 transition-colors p-1.5 hover:bg-slate-800 rounded-lg disabled:opacity-50"
                                                title="Delete batch"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Pagination
                currentPage={currentPage}
                totalItems={filtered.length}
                onPageChange={setCurrentPage}
            />
        </Layout>
    );
}