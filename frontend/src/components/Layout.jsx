import { useState } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Receipt,
    History,
    ClipboardList,
    LogOut,
    Pill,
    Home,
    CalendarClock,
    AlertOctagon,
    PackageX,
    Menu,
    X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const navItems = [
    { to: "/", label: "Home", icon: Home },
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/buy-stock", label: "Buy Stock", icon: ShoppingCart },
    { to: "/stock", label: "Stock/Inventory", icon: Package },
    { to: "/sell", label: "Sell / Billing", icon: Receipt },
    { to: "/low-stock", label: "Low Stock", icon: PackageX },
    { to: "/expiring-soon", label: "Expiring Soon", icon: CalendarClock },
    { to: "/expired", label: "Expired", icon: AlertOctagon },
    { to: "/purchase-history", label: "Purchase History", icon: ClipboardList },
    { to: "/sales-history", label: "Sales History", icon: History },
];

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        toast.success("Logged out");
        navigate("/login");
    };

    const closeMobile = () => setMobileOpen(false);

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Mobile top bar */}
            <div className="md:hidden sticky top-0 z-30 flex items-center justify-between bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="bg-emerald-500/10 p-1.5 rounded-lg">
                        <Pill className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-white font-semibold text-sm">
                        {user?.shopName || "Sinha Drug Agency"}
                    </span>
                </div>
                <button
                    onClick={() => setMobileOpen(true)}
                    className="text-slate-300 p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>
            </div>

            {/* Mobile overlay + drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeMobile}
                            className="md:hidden fixed inset-0 bg-black/60 z-40"
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "tween", duration: 0.25 }}
                            className="md:hidden fixed top-0 left-0 h-screen w-72 bg-slate-900 border-r border-slate-800 z-50 flex flex-col"
                        >
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
                                <Link to="/" onClick={closeMobile} className="flex items-center gap-2.5">
                                    <div className="bg-emerald-500/10 p-2 rounded-lg">
                                        <Pill className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold text-sm leading-tight">
                                            {user?.shopName || "Sinha Drug Agency"}
                                        </p>
                                        <p className="text-slate-500 text-xs">{user?.ownerName}</p>
                                    </div>
                                </Link>
                                <button
                                    onClick={closeMobile}
                                    className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        end={item.to === "/"}
                                        onClick={closeMobile}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                                                ? "bg-emerald-500/15 border border-emerald-500/30 text-white"
                                                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                                            }`
                                        }
                                    >
                                        <item.icon className="w-4 h-4" />
                                        <span>{item.label}</span>
                                    </NavLink>
                                ))}
                            </nav>

                            <div className="p-3 border-t border-slate-800">
                                <button
                                    onClick={() => {
                                        closeMobile();
                                        handleLogout();
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            <div className="flex">
                {/* Desktop sidebar */}
                <aside className="hidden md:flex w-64 bg-slate-900/80 border-r border-slate-800 flex-col fixed h-screen">
                    <Link
                        to="/"
                        className="flex items-center gap-3 px-6 py-5 border-b border-slate-800 hover:bg-slate-800/40 transition-colors"
                    >
                        <div className="bg-emerald-500/10 p-2 rounded-lg">
                            <Pill className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h1 className="text-white font-semibold text-sm leading-tight">
                                {user?.shopName || "Sinha Drug Agency"}
                            </h1>
                            <p className="text-slate-500 text-xs">{user?.ownerName}</p>
                        </div>
                    </Link>

                    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === "/"}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative ${isActive
                                        ? "text-white"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeNav"
                                                className="absolute inset-0 bg-emerald-500/15 border border-emerald-500/30 rounded-lg"
                                                transition={{ type: "spring", duration: 0.4 }}
                                            />
                                        )}
                                        <item.icon className="w-4 h-4 relative z-10" />
                                        <span className="relative z-10">{item.label}</span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="p-3 border-t border-slate-800">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </aside>

                {/* Main content */}
                <main className="flex-1 md:ml-64 p-4 md:p-8 min-w-0">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
}