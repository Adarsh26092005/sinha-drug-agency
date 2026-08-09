import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Mail, Loader2, ArrowLeft, Pill } from "lucide-react";
import toast from "react-hot-toast";
import API from "../api/axios";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post("/auth/forgot-password", { email });
            setSent(true);
        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8"
            >
                <div className="flex flex-col items-center mb-6">
                    <div className="bg-emerald-500/10 p-3 rounded-xl mb-3">
                        <Pill className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h1 className="text-xl font-bold text-white">Reset your password</h1>
                    <p className="text-slate-400 text-sm mt-1 text-center">
                        Enter your email and we'll send you a reset link
                    </p>
                </div>

                {sent ? (
                    <div className="text-center py-4">
                        <div className="bg-emerald-500/15 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Mail className="w-6 h-6 text-emerald-400" />
                        </div>
                        <p className="text-slate-300 text-sm mb-1">
                            If that email is registered, a reset link has been sent.
                        </p>
                        <p className="text-slate-500 text-xs">Check your inbox (and spam folder).</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm text-slate-300 mb-1 block">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="you@example.com"
                                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                "Send Reset Link"
                            )}
                        </motion.button>
                    </form>
                )}

                <Link
                    to="/login"
                    className="flex items-center justify-center gap-1.5 text-slate-400 hover:text-white text-sm mt-6 transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Login
                </Link>
            </motion.div>
        </div>
    );
}