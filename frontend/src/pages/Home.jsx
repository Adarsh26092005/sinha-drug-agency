import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Pill, ArrowRight, Package, Receipt, TrendingUp } from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const features = [
    { icon: Package, label: "Smart Stock Tracking" },
    { icon: Receipt, label: "Instant Billing & PDF Bills" },
    { icon: TrendingUp, label: "Sales Insights & Trends" },
];

export default function Home() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-slate-950 relative overflow-hidden flex flex-col">
            {/* Animated background blobs */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    animate={{
                        x: [0, 60, 0],
                        y: [0, 40, 0],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] left-[10%] w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        x: [0, -50, 0],
                        y: [0, 60, 0],
                    }}
                    transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[-10%] right-[10%] w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        x: [0, 30, 0],
                        y: [0, -30, 0],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[40%] left-[45%] w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"
                />

                {/* Grid overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage:
                            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                        backgroundSize: "48px 48px",
                    }}
                />
            </div>

            <Navbar />

            {/* Hero content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
                <motion.div
                    initial={{ scale: 0.7, opacity: 0, rotate: -10 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-2xl mb-6 shadow-2xl shadow-emerald-500/10"
                >
                    <Pill className="w-10 h-10 text-emerald-400" />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-5xl sm:text-7xl font-extrabold text-white tracking-tight mb-4"
                >
                    Sinha Drug Agency
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.6 }}
                    className="text-slate-400 text-lg sm:text-xl max-w-xl mb-10"
                >
                    Modern stock &amp; billing management for your medicine wholesale
                    business — fast, simple, and reliable.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                >
                    <Link to={user ? "/dashboard" : "/login"}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                            className="group bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors shadow-xl shadow-emerald-500/20 flex items-center gap-2 mx-auto"
                        >
                            {user ? "Go to Dashboard" : "Get Started"}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                    </Link>
                </motion.div>

                {/* Feature pills */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                    className="flex flex-wrap items-center justify-center gap-3 mt-16"
                >
                    {features.map((f, i) => (
                        <motion.div
                            key={f.label}
                            whileHover={{ y: -3 }}
                            className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 backdrop-blur-sm px-4 py-2.5 rounded-full"
                        >
                            <f.icon className="w-4 h-4 text-emerald-400" />
                            <span className="text-slate-300 text-sm">{f.label}</span>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            <footer className="relative z-10 border-t border-slate-800/60 mt-10">
                <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col items-center text-center gap-3">
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-slate-400 text-sm">
                        <span>Pawan Lodge Road, Rajendra Nagar, Khagaria, Bihar - 851205</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-slate-400 text-sm">
                        <a href="tel:+916201045188" className="hover:text-emerald-400 transition-colors">
                            📞 6201045188
                        </a>
                        <a href="mailto:prasadjay1967@gmail.com" className="hover:text-emerald-400 transition-colors">
                            ✉️ prasadjay1967@gmail.com
                        </a>
                        <span>GSTIN: 10BITPK8391N1ZI</span>
                    </div>
                    <p className="text-slate-600 text-xs mt-2">
                        © {new Date().getFullYear()} Sinha Drug Agency. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}