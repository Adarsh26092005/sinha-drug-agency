import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, LogOut, Pill } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

function getInitials(name) {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Navbar() {
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success("Logged out");
        setMenuOpen(false);
        navigate("/");
    };

    return (
        <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 sm:px-10 py-5">
            <Link to="/" className="flex items-center gap-2">
                <div className="bg-emerald-500/10 p-2 rounded-lg">
                    <Pill className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-white font-semibold hidden sm:block">
                    Sinha Drug Agency
                </span>
            </Link>

            {user ? (
                <div className="relative">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="w-10 h-10 rounded-full bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center shadow-lg shadow-emerald-500/20 border-2 border-emerald-400/40"
                    >
                        {getInitials(user.ownerName || user.shopName)}
                    </motion.button>

                    <AnimatePresence>
                        {menuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setMenuOpen(false)}
                                />
                                <motion.div
                                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-20"
                                >
                                    <div className="px-4 py-3 border-b border-slate-800">
                                        <p className="text-white text-sm font-medium">{user.ownerName || user.shopName}</p>
                                        <p className="text-slate-500 text-xs">{user.shopName}</p>
                                        <p className="text-slate-600 text-xs">{user.email}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setMenuOpen(false);
                                            navigate("/dashboard");
                                        }}
                                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        Go to Dashboard
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            ) : (
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link
                        to="/login"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors shadow-lg shadow-emerald-500/20"
                    >
                        Login
                    </Link>
                </motion.div>
            )}
        </nav>
    );
}