import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Package, DollarSign, BarChart3, Award } from "lucide-react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
} from "recharts";
import API from "../api/axios";
import Layout from "../components/Layout";
import { formatCurrency } from "../utils/formatCurrency";

function StatCard({ icon: Icon, label, value, color, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            className="bg-slate-900/60 border border-slate-800 rounded-xl p-5"
        >
            <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${color}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <p className="text-slate-400 text-sm">{label}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </motion.div>
    );
}

function CustomTooltip({ active, payload, label }) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
                <p className="text-slate-300 text-xs mb-1">{label}</p>
                <p className="text-emerald-400 font-semibold text-sm">
                    {formatCurrency(payload[0].value)} revenue
                </p>
                <p className="text-slate-400 text-xs">{payload[0].payload.bills} bills</p>
            </div>
        );
    }
    return null;
}

export default function Dashboard() {
    const [summary, setSummary] = useState(null);
    const [monthlySales, setMonthlySales] = useState([]);
    const [topSelling, setTopSelling] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [summaryRes, monthlyRes, topSellingRes] = await Promise.all([
                    API.get("/dashboard/summary"),
                    API.get("/dashboard/monthly-sales"),
                    API.get("/dashboard/top-selling"),
                ]);
                setSummary(summaryRes.data);
                setMonthlySales(monthlyRes.data);
                setTopSelling(topSellingRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <Layout>
            <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
            <p className="text-slate-400 mb-6">Overview of your shop's stock and sales</p>

            {loading ? (
                <p className="text-slate-400">Loading...</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <StatCard
                            icon={DollarSign}
                            label="Today's Revenue"
                            value={formatCurrency(summary.todayRevenue)}
                            color="bg-emerald-500/15 text-emerald-400"
                            delay={0}
                        />
                        <StatCard
                            icon={TrendingUp}
                            label="Today's Bills"
                            value={summary.todaySalesCount}
                            color="bg-blue-500/15 text-blue-400"
                            delay={0.1}
                        />
                        <StatCard
                            icon={Package}
                            label="Total Medicines"
                            value={summary.totalMedicines}
                            color="bg-purple-500/15 text-purple-400"
                            delay={0.2}
                        />
                        <StatCard
                            icon={DollarSign}
                            label="Stock Value (Cost)"
                            value={formatCurrency(summary.totalStockValue)}
                            color="bg-amber-500/15 text-amber-400"
                            delay={0.3}
                        />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, duration: 0.4 }}
                        className="bg-slate-900/60 border border-slate-800 rounded-xl p-5"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart3 className="w-5 h-5 text-emerald-400" />
                            <h2 className="text-white font-semibold">
                                Monthly Sales — {new Date().getFullYear()}
                            </h2>
                        </div>

                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={monthlySales}>
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => `₹${val}`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    fill="url(#revenueGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Top Selling Medicines This Month */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                        className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 mt-6"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Award className="w-5 h-5 text-purple-400" />
                            <h2 className="text-white font-semibold">
                                Top Selling Medicines — {new Date().toLocaleString("default", { month: "long" })}
                            </h2>
                        </div>

                        {topSelling.length === 0 ? (
                            <p className="text-slate-500 text-sm py-6 text-center">
                                No sales recorded this month yet.
                            </p>
                        ) : (
                            <ResponsiveContainer width="100%" height={Math.max(topSelling.length * 40, 200)}>
                                <BarChart data={topSelling} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                                    <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        stroke="#64748b"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        width={140}
                                    />
                                    <Tooltip
                                        content={({ active, payload }) =>
                                            active && payload && payload.length ? (
                                                <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
                                                    <p className="text-slate-300 text-xs mb-1">{payload[0].payload.name}</p>
                                                    <p className="text-purple-400 font-semibold text-sm">
                                                        {payload[0].value} units sold
                                                    </p>
                                                    <p className="text-slate-400 text-xs">
                                                        {formatCurrency(payload[0].payload.revenue)} revenue
                                                    </p>
                                                </div>
                                            ) : null
                                        }
                                        cursor={{ fill: "rgba(168, 85, 247, 0.08)" }}
                                    />
                                    <Bar dataKey="quantity" radius={[0, 6, 6, 0]} barSize={18}>
                                        {topSelling.map((_, index) => (
                                            <Cell key={index} fill="#a855f7" fillOpacity={1 - index * 0.08} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </motion.div>
                </>
            )}
        </Layout>
    );
}