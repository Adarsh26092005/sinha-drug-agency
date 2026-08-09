import { useState } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Loader2, Pill, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import API from "../api/axios";

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            await API.post(`/auth/reset-password/${token}`, { password });
            setSuccess(true);
            toast.success("Password reset successful");
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            toast.error(err.response?.data?.message || "Reset link is invalid or expired");
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
                    <h1 className="text-xl font-bold text-white">Set a new password</h1>
                </div>

                {success ? (
                    <div className="text-center py-4">
                        <div className="bg-emerald-500/15 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        </div>
                        <p className="text-slate-300 text-sm">Password reset! Redirecting to login...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm text-slate-300 mb-1 block">New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                placeholder="••••••••"
                                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-slate-300 mb-1 block">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Resetting...
                                </>
                            ) : (
                                "Reset Password"
                            )}
                        </motion.button>
                    </form>
                )}

                {!success && (
                    <Link
                        to="/login"
                        className="block text-center text-slate-400 hover:text-white text-sm mt-6 transition-colors"
                    >
                        Back to Login
                    </Link>
                )}
            </motion.div>
        </div>
    );
}