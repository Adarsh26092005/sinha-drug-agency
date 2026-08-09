import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Pill, Loader2 } from "lucide-react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const [isRegister, setIsRegister] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ shopName: "", ownerName: "", email: "", password: "" });
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = isRegister ? "/auth/register" : "/auth/login";
            const payload = isRegister
                ? form
                : { email: form.email, password: form.password };

            const { data } = await API.post(url, payload);
            login(data);
            toast.success(isRegister ? "Account created!" : "Welcome back!");
            navigate("/dashboard");
        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background glow effects */}
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8"
            >
                {/* Logo/Header */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="flex flex-col items-center mb-8"
                >
                    <div className="bg-emerald-500/10 p-3 rounded-xl mb-3">
                        <Pill className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Sinha Drug Agency</h1>
                    <p className="text-slate-400 text-sm mt-1">Stock & Billing Management</p>
                </motion.div>

                {/* Tabs */}
                <div className="flex bg-slate-800/60 rounded-lg p-1 mb-6">
                    <button
                        onClick={() => setIsRegister(false)}
                        className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${!isRegister
                            ? "bg-emerald-500 text-white shadow-lg"
                            : "text-slate-400 hover:text-white"
                            }`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setIsRegister(true)}
                        className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${isRegister
                            ? "bg-emerald-500 text-white shadow-lg"
                            : "text-slate-400 hover:text-white"
                            }`}
                    >
                        Register
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegister && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="text-sm text-slate-300 mb-1 block">Shop Name</label>
                                <input
                                    type="text"
                                    name="shopName"
                                    value={form.shopName}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Sinha Drug Agency"
                                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-slate-300 mb-1 block">Owner Name</label>
                                <input
                                    type="text"
                                    name="ownerName"
                                    value={form.ownerName}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Neetu Kumari"
                                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                />
                            </div>
                        </motion.div>
                    )}

                    <div>
                        <label className="text-sm text-slate-300 mb-1 block">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            placeholder="you@example.com"
                            className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-slate-300 mb-1 block">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                            placeholder="••••••••"
                            className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Please wait...
                            </>
                        ) : isRegister ? (
                            "Create Account"
                        ) : (
                            "Login"
                        )}
                    </motion.button>
                </form>

                {!isRegister && (
                    <Link
                        to="/forgot-password"
                        className="block text-center text-slate-400 hover:text-emerald-400 text-sm mt-4 transition-colors"
                    >
                        Forgot password?
                    </Link>
                )}
            </motion.div>
        </div>
    );
}