import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { History, Search, Download, Printer, FileSpreadsheet, X } from "lucide-react";
import toast from "react-hot-toast";
import API from "../api/axios";
import Layout from "../components/Layout";
import { exportSalesToExcel } from "../utils/exportExcel";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate, formatDateTime, formatExpiry } from "../utils/formatDate";
import Pagination, { paginate } from "../components/Pagination";

export default function SalesHistory() {
    const [sales, setSales] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const { data } = await API.get("/sales");
                setSales(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSales();
    }, []);

    const filtered = sales.filter((s) => {
        const matchesSearch =
            s.billNumber.toLowerCase().includes(search.toLowerCase()) ||
            s.items.some((i) => i.medicineName.toLowerCase().includes(search.toLowerCase()));

        if (!matchesSearch) return false;

        const saleDate = new Date(s.saleDate);
        if (fromDate) {
            const from = new Date(fromDate);
            from.setHours(0, 0, 0, 0);
            if (saleDate < from) return false;
        }
        if (toDate) {
            const to = new Date(toDate);
            to.setHours(23, 59, 59, 999);
            if (saleDate > to) return false;
        }
        return true;
    });

    const paginated = paginate(filtered, currentPage);

    const totalRevenue = filtered.reduce((sum, s) => sum + s.totalAmount, 0);

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
            toast.error("No sales in this range to export");
            return;
        }

        exportSalesToExcel(filtered, `Sales_History_${fromDate}_to_${toDate}`);
        toast.success("Exported to Excel");
    };

    const clearDateRange = () => {
        setFromDate("");
        setToDate("");
    };

    const handleDownloadPdf = async (sale) => {
        try {
            const res = await API.get(`/sales/${sale._id}/pdf`, { responseType: "blob" });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${sale.billNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error(err);
        }
    };

    const handlePrintPdf = async (sale) => {
        try {
            const res = await API.get(`/sales/${sale._id}/pdf`, { responseType: "blob" });
            const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
            window.open(url, "_blank");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Layout>
            <h1 className="text-2xl font-bold text-white mb-1">Sales History</h1>
            <p className="text-slate-400 mb-6">
                {sales.length} bill{sales.length !== 1 ? "s" : ""} generated
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
                        placeholder="Search by bill number or medicine..."
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                </div>
                <div className="bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-2.5">
                    <span className="text-slate-400 text-sm">Total Revenue: </span>
                    <span className="text-emerald-400 font-bold">{formatCurrency(totalRevenue)}</span>
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
                    <History className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">
                        {search ? "No bills match your search" : "No sales recorded yet"}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {paginated.map((sale, i) => (
                        <motion.div
                            key={sale._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(i * 0.04, 0.5) }}
                            className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden"
                        >
                            <div
                                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
                                onClick={() =>
                                    setExpandedId(expandedId === sale._id ? null : sale._id)
                                }
                            >
                                <div>
                                    <p className="text-white font-medium">
                                        {sale.billNumber}
                                        {sale.customerName && (
                                            <span className="text-slate-400 font-normal"> — {sale.customerName}</span>
                                        )}
                                    </p>
                                    <p className="text-slate-500 text-xs">
                                        {formatDateTime(sale.saleDate)} •{" "}
                                        {sale.items.length} item{sale.items.length !== 1 ? "s" : ""}
                                        {sale.customerDLNo && ` • DL No: ${sale.customerDLNo}`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-emerald-400 font-bold">
                                        {formatCurrency(sale.totalAmount)}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePrintPdf(sale);
                                        }}
                                        className="text-slate-400 hover:text-blue-400 transition-colors p-2 hover:bg-slate-800 rounded-lg"
                                        title="Print PDF"
                                    >
                                        <Printer className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownloadPdf(sale);
                                        }}
                                        className="text-slate-400 hover:text-emerald-400 transition-colors p-2 hover:bg-slate-800 rounded-lg"
                                        title="Download PDF"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {expandedId === sale._id && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="border-t border-slate-800 px-5 py-4 bg-slate-950/40"
                                >
                                    {(sale.customerName || sale.customerDLNo || sale.customerAddress) && (
                                        <div className="mb-3 pb-3 border-b border-slate-800 text-xs text-slate-400 space-y-0.5">
                                            {sale.customerName && (
                                                <p>
                                                    <span className="text-slate-500">Customer:</span> {sale.customerName}
                                                </p>
                                            )}
                                            {sale.customerDLNo && (
                                                <p>
                                                    <span className="text-slate-500">DL No:</span> {sale.customerDLNo}
                                                </p>
                                            )}
                                            {sale.customerAddress && (
                                                <p>
                                                    <span className="text-slate-500">Address:</span> {sale.customerAddress}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    <table className="w-full text-sm mb-3">
                                        <thead>
                                            <tr className="text-slate-500 text-left">
                                                <th className="pb-2 font-medium">Medicine</th>
                                                <th className="pb-2 font-medium">Batch</th>
                                                <th className="pb-2 font-medium">Qty</th>
                                                <th className="pb-2 font-medium">Price</th>
                                                <th className="pb-2 font-medium">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sale.items.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="py-1 text-slate-200">{item.medicineName}</td>
                                                    <td className="py-1 text-slate-400">{item.batchNumber}</td>
                                                    <td className="py-1 text-slate-300">{item.quantity}</td>
                                                    <td className="py-1 text-slate-300">{formatCurrency(item.pricePerItem)}</td>
                                                    <td className="py-1 text-slate-300">{formatCurrency(item.total)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="flex justify-end gap-6 text-sm border-t border-slate-800 pt-2">
                                        <span className="text-slate-400">
                                            Subtotal: <span className="text-slate-200">{formatCurrency(sale.subtotal)}</span>
                                        </span>
                                        <span className="text-slate-400">
                                            Discount: <span className="text-red-400">
                                                {sale.discountPercent}% (-{formatCurrency(sale.discountAmount)})
                                            </span>
                                        </span>
                                        <span className="text-slate-300 font-semibold">
                                            Total: <span className="text-emerald-400">{formatCurrency(sale.totalAmount)}</span>
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
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
