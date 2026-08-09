import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ClipboardList, Search, FileSpreadsheet, X } from "lucide-react";
import toast from "react-hot-toast";
import API from "../api/axios";
import Layout from "../components/Layout";
import { exportToExcel } from "../utils/exportExcel";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate } from "../utils/formatDate";
import Pagination, { paginate } from "../components/Pagination";

export default function PurchaseHistory() {
    const [purchases, setPurchases] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    useEffect(() => {
        const fetchPurchases = async () => {
            try {
                const { data } = await API.get("/purchases");
                setPurchases(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPurchases();
    }, []);

    const filtered = purchases.filter((p) => {
        const matchesSearch = p.medicineName.toLowerCase().includes(search.toLowerCase());
        if (!matchesSearch) return false;

        const pDate = new Date(p.purchaseDate);
        if (fromDate) {
            const from = new Date(fromDate);
            from.setHours(0, 0, 0, 0);
            if (pDate < from) return false;
        }
        if (toDate) {
            const to = new Date(toDate);
            to.setHours(23, 59, 59, 999);
            if (pDate > to) return false;
        }
        return true;
    });

    const totalSpent = filtered.reduce((sum, p) => sum + p.totalCost, 0);
    const paginated = paginate(filtered, currentPage);

    const isValidRange = fromDate && toDate && new Date(fromDate) <= new Date(toDate);

    const handleExport = () => {
        if (!fromDate || !toDate) {
            toast.error("Please select both From Date and To Date");
            return;
        }
        if (new Date(fromDate) > new Date(toDate)) {
            toast.error("From Date cannot be after To Date");
            return;
        }
        if (filtered.length === 0) {
            toast.error("No purchases in this range to export");
            return;
        }
        const exportData = filtered.map((p) => ({
            Date: formatDate(p.purchaseDate),
            "Medicine Name": p.medicineName,
            "Batch No": p.batchNumber,
            "Expiry Date": formatDate(p.expiryDate),
            Quantity: p.quantity,
            "Cost Price": p.pricePerItem,
            MRP: p.mrp,
            "Selling Rate": p.markedPrice,
            "Total Cost": p.totalCost,
        }));
        exportToExcel(exportData, `Purchase_History_${fromDate}_to_${toDate}`, "Purchases");
        toast.success("Exported to Excel");
    };

    const clearDateRange = () => {
        setFromDate("");
        setToDate("");
    };

    return (
        <Layout>
            <h1 className="text-2xl font-bold text-white mb-1">Purchase History</h1>
            <p className="text-slate-400 mb-6">
                {purchases.length} purchase{purchases.length !== 1 ? "s" : ""} recorded
            </p>

            <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
                <div className="relative max-w-md flex-1 min-w-[240px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        placeholder="Search by medicine name..."
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                </div>
                <div className="bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-2.5">
                    <span className="text-slate-400 text-sm">Total Spent: </span>
                    <span className="text-emerald-400 font-bold">{formatCurrency(totalSpent)}</span>
                </div>
            </div>

            {/* Date range + export */}
            <div className="flex items-end gap-3 mb-6 flex-wrap bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                <div>
                    <label className="text-xs text-slate-400 mb-1 block">From Date</label>
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 [color-scheme:dark]"
                    />
                </div>
                <div>
                    <label className="text-xs text-slate-400 mb-1 block">To Date</label>
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 [color-scheme:dark]"
                    />
                </div>
                {(fromDate || toDate) && (
                    <button
                        onClick={clearDateRange}
                        className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm px-3 py-2 transition-colors"
                    >
                        <X className="w-3.5 h-3.5" />
                        Clear
                    </button>
                )}
                <button
                    onClick={handleExport}
                    disabled={!isValidRange}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors ml-auto"
                >
                    <FileSpreadsheet className="w-4 h-4" />
                    Export to Excel
                </button>
            </div>

            {loading ? (
                <p className="text-slate-400">Loading...</p>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-xl">
                    <ClipboardList className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">
                        {search ? "No purchases match your search" : "No purchases recorded yet"}
                    </p>
                </div>
            ) : (
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-800 text-slate-400 text-left">
                                <th className="px-5 py-3 font-medium">Date</th>
                                <th className="px-5 py-3 font-medium">Medicine</th>
                                <th className="px-5 py-3 font-medium">Batch No</th>
                                <th className="px-5 py-3 font-medium">MRP</th>
                                <th className="px-5 py-3 font-medium">Quantity</th>
                                <th className="px-5 py-3 font-medium">Cost Price</th>
                                <th className="px-5 py-3 font-medium">Marked Price</th>
                                <th className="px-5 py-3 font-medium">Total Cost</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.map((p, i) => (
                                <motion.tr
                                    key={p._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: Math.min(i * 0.03, 0.5) }}
                                    className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors"
                                >
                                    <td className="px-5 py-3 text-slate-400">
                                        {formatDate(p.purchaseDate)}
                                    </td>
                                    <td className="px-5 py-3 text-white font-medium">{p.medicineName}</td>
                                    <td className="px-5 py-3 text-slate-300">{p.batchNumber}</td>
                                    <td className="px-5 py-3 text-slate-300">{formatCurrency(p.mrp)}</td>
                                    <td className="px-5 py-3 text-slate-300">{p.quantity}</td>
                                    <td className="px-5 py-3 text-slate-300">{formatCurrency(p.pricePerItem)}</td>
                                    <td className="px-5 py-3 text-slate-300">{formatCurrency(p.markedPrice)}</td>
                                    <td className="px-5 py-3 text-white font-semibold">{formatCurrency(p.totalCost)}</td>
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