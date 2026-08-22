import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertOctagon, Search, Trash2, FileSpreadsheet } from "lucide-react";
import toast from "react-hot-toast";
import API from "../api/axios";
import Layout from "../components/Layout";
import { exportToExcel } from "../utils/exportExcel";
import { formatExpiry } from "../utils/formatDate";
import Pagination, { paginate } from "../components/Pagination";

export default function Expired() {
    const [batches, setBatches] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data } = await API.get("/medicines/expired");
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
                `Remove expired batch "${batch.batchNumber}" of ${batch.medicineName}? Do this once you've physically discarded the stock.`
            )
        ) {
            return;
        }
        setDeletingId(batch._id);
        try {
            await API.delete(`/purchases/${batch._id}`);
            setBatches((prev) => prev.filter((b) => b._id !== batch._id));
            toast.success("Removed from records");
        } catch (err) {
            toast.error("Failed to remove");
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
            "Stock Remaining": b.currentStock,
            "Expired On": formatExpiry(b.expiryDate),
        }));
        exportToExcel(exportData, "Expired_Stock", "Expired");
        toast.success("Exported to Excel");
    };

    return (
        <Layout>
            <h1 className="text-2xl font-bold text-white mb-1">Expired Stock</h1>
            <p className="text-slate-400 mb-6">
                {batches.length} expired batch{batches.length !== 1 ? "es" : ""} — no longer available for sale
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
                    <AlertOctagon className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">{search ? "No matches" : "No expired stock right now"}</p>
                </div>
            ) : (
                <div className="bg-slate-900/60 border border-red-900/40 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-800 text-slate-400 text-left">
                                <th className="px-5 py-3 font-medium">Medicine</th>
                                <th className="px-5 py-3 font-medium">Batch No</th>
                                <th className="px-5 py-3 font-medium">Stock</th>
                                <th className="px-5 py-3 font-medium">Expired On</th>
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
                                    className="border-b border-slate-800/60 hover:bg-red-500/5 transition-colors"
                                >
                                    <td className="px-5 py-3 text-white font-medium">{b.medicineName}</td>
                                    <td className="px-5 py-3 text-slate-300">{b.batchNumber}</td>
                                    <td className="px-5 py-3 text-slate-300">
                                        {b.currentStock} {b.unit}
                                    </td>
                                    <td className="px-5 py-3 text-red-400">{formatExpiry(b.expiryDate)}</td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center justify-end">
                                            <button
                                                onClick={() => handleDelete(b)}
                                                disabled={deletingId === b._id}
                                                className="text-slate-400 hover:text-red-400 transition-colors p-1.5 hover:bg-slate-800 rounded-lg disabled:opacity-50"
                                                title="Remove from records"
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