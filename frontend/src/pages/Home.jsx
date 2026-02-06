import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
    Cpu, 
    Bot, 
    Database, 
    ArrowRight, 
    X, 
    Zap,
    Clock,
    LogOut,
    ShieldCheck
} from "lucide-react";

const Home = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const [showPopup, setShowPopup] = useState(false);

    // --- LOGOUT LOGIC ---
    const handleLogoutAction = () => {
        // 1. Trigger the cleanup in Parent (App.js)
        onLogout(); 
        // 2. Force immediate navigation to Login/Register page
        navigate("/register");
    };

    // Card Component
    const OptionCard = ({ title, desc, icon: Icon, onClick, color, delay }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            onClick={onClick}
            className="group relative bg-[#111114] border border-white/5 p-6 rounded-2xl cursor-pointer hover:border-indigo-500/50 transition-all hover:-translate-y-1 overflow-hidden"
        >
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${color}`} />
            
            <div className="relative z-10 flex flex-col h-full">
                <div className={`w-12 h-12 rounded-lg bg-black/50 border border-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${color.replace('from-', 'text-').split(' ')[0]}`}>
                    <Icon size={24} />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">
                    {desc}
                </p>
                
                <div className="flex items-center text-xs font-bold tracking-widest uppercase text-slate-500 group-hover:text-white transition-colors">
                    Select Option <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-[#09090b] text-white flex flex-col relative overflow-hidden font-sans">
            
            {/* Background Ambience */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <header className="px-8 py-6 flex items-center justify-between border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-black shadow-[0_0_15px_rgba(79,70,229,0.5)]">S</div>
                    <h1 className="text-lg font-bold tracking-tight">SAVETRAX <span className="text-indigo-500">HUB</span></h1>
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">OPERATOR ID</p>
                        <p className="text-sm font-bold text-white font-mono">{user?.name || "UNKNOWN"}</p>
                    </div>
                    
                    {/* LOGOUT BUTTON WITH FIXED REDIRECT */}
                    <button 
                        onClick={handleLogoutAction}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg text-xs font-bold transition-all border border-red-500/20 hover:border-red-500/50"
                    >
                        <LogOut size={14} />
                        LOGOUT
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
                <div className="max-w-5xl w-full">
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12 text-center"
                    >
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500">
                            Select Workflow <span className="text-indigo-500">Protocol</span>
                        </h2>
                        <p className="text-slate-400 max-w-xl mx-auto">
                            Choose your data processing method. Manual intervention allows for precision, while automated pipelines optimize for speed.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        
                        {/* 1. SEMI-AUTOMATED */}
                        <OptionCard 
                            title="Semi-Automated"
                            desc="AI-assisted manual annotation tool. Best for complex scenes requiring human verification and fine-tuning."
                            icon={Cpu}
                            color="from-indigo-500 to-purple-600"
                            delay={0.1}
                            onClick={() => navigate('/editor')}
                        />

                        {/* 2. FULLY AUTOMATED */}
                        <OptionCard 
                            title="Fully Automated"
                            desc="End-to-end pipeline using pre-trained heavy models. Zero human intervention required for standard datasets."
                            icon={Bot}
                            color="from-emerald-500 to-teal-600"
                            delay={0.2}
                            onClick={() => setShowPopup(true)}
                        />

                        {/* 3. LOAD DATA */}
                        <OptionCard 
                            title="Load Dataset"
                            desc="Access previously processed videos, manage stored metadata, and resume suspended annotation sessions."
                            icon={Database}
                            color="from-orange-500 to-red-600"
                            delay={0.3}
                            onClick={() => navigate('/recent')}
                        />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 bg-[#111114] px-8 py-4 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"/> 
                        SYSTEM ONLINE
                    </span>
                    <span className="flex items-center gap-1">
                        <ShieldCheck size={10} /> v2.4.0-stable
                    </span>
                </div>
                <div>LATENCY: 24ms</div>
            </footer>

            {/* Popup Modal */}
            <AnimatePresence>
                {showPopup && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPopup(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
                        />
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-[#18181b] border border-white/10 p-6 rounded-2xl shadow-2xl z-50 overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>

                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400">
                                    <Zap size={24} />
                                </div>
                                <button onClick={() => setShowPopup(false)} className="text-slate-500 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <h3 className="text-xl font-bold text-white mb-2">Feature Coming Soon</h3>
                            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                The Fully Automated pipeline is currently under development. We are fine-tuning the models for higher accuracy.
                            </p>
                            
                            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 bg-black/30 p-3 rounded border border-white/5 mb-6">
                                <Clock size={12} />
                                <span>ESTIMATED ARRIVAL: Q3 2026</span>
                            </div>

                            <button 
                                onClick={() => setShowPopup(false)}
                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-sm transition-colors shadow-lg shadow-indigo-900/20"
                            >
                                Acknowledge
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Home;