import { NavLink, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
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

    const handleLogout = () => {
        logout();
        toast.success("Logged out");
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-slate-950 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900/80 border-r border-slate-800 flex flex-col fixed h-screen">
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

                <nav className="flex-1 px-3 py-4 space-y-1">
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
            <main className="flex-1 ml-64 p-8">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
}