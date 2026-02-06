import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; 
import { User, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

const Auth = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate(); 
    
    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(""); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const endpoint = isLogin ? "/login" : "/register";
        
        try {
            const response = await fetch(`http://localhost:4000${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            // --- 💾 NEW: Save User Data to Local Storage ---
            // This stores the name and email immediately upon success
            localStorage.setItem("savetrax_user", JSON.stringify(data.user));

            // 1. Update Parent State (if function provided)
            if (onLogin) {
                onLogin(data.user);
            }

            // 2. Navigate to Home
            navigate("/home");
            
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#09090b] items-center justify-center relative overflow-hidden font-sans">
            
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[100px]" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-[#111114] border border-white/5 p-8 rounded-2xl shadow-2xl relative z-10"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-black text-white tracking-tight mb-2">
                        SAVETRAX <span className="text-indigo-500">2.0</span>
                    </h1>
                    <p className="text-slate-400 text-sm">
                        {isLogin ? "Welcome back, Operator." : "Initialize new user profile."}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {!isLogin && (
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={16} />
                                <input 
                                    type="text" 
                                    name="name"
                                    required
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-[#09090b] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={16} />
                            <input 
                                type="email" 
                                name="email"
                                required
                                placeholder="name@company.com"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-[#09090b] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={16} />
                            <input 
                                type="password" 
                                name="password"
                                required
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-[#09090b] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded flex items-center justify-center">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : (isLogin ? "ACCESS SYSTEM" : "CREATE ACCOUNT")}
                        {!loading && <ArrowRight size={18} />}
                    </button>
                </form>

                {/* Footer Toggle */}
                <div className="mt-8 text-center">
                    <p className="text-slate-500 text-xs">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button 
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError("");
                                setFormData({ name: "", email: "", password: "" });
                            }} 
                            className="text-indigo-400 hover:text-indigo-300 font-bold ml-1 transition-colors"
                        >
                            {isLogin ? "Register Now" : "Login Here"}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Auth;