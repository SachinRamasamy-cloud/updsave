import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
    ArrowLeft, 
    Search, 
    FileVideo, 
    Calendar, 
    Clock, 
    MoreVertical, 
    Eye, 
    Download, 
    Trash2, 
    Database,
    Filter
} from "lucide-react";

// --- DUMMY DATA GENERATOR ---
const INITIAL_DATA = [
    { id: 'vid_001', name: 'Traffic_Cam_Intersection_04.mp4', date: '2024-02-14', size: '142 MB', duration: '00:45', fps: 30, status: 'processed' },
    { id: 'vid_002', name: 'Drone_Footage_Forest_B.mp4', date: '2024-02-12', size: '890 MB', duration: '03:20', fps: 60, status: 'processed' },
    { id: 'vid_003', name: 'Security_Feed_Lobby_Night.mkv', date: '2024-02-10', size: '45 MB', duration: '00:15', fps: 25, status: 'pending' },
    { id: 'vid_004', name: 'Autonomous_Vehicle_Sensor_Test.mp4', date: '2024-02-08', size: '1.2 GB', duration: '05:00', fps: 60, status: 'processed' },
    { id: 'vid_005', name: 'Highway_Surveillance_Raw.avi', date: '2024-02-05', size: '2.1 GB', duration: '12:30', fps: 30, status: 'archived' },
];

const Recent = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(INITIAL_DATA);
    const [searchTerm, setSearchTerm] = useState("");

    // --- ACTIONS ---
    
    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this dataset? This action is irreversible.")) {
            setData(prev => prev.filter(item => item.id !== id));
        }
    };

    const handleView = (file) => {
        // Logic to load this specific file into Editor
        console.log("Loading file:", file.name);
        navigate('/editor');
    };

    const handleDownload = (fileName) => {
        alert(`Initiating secure download for: ${fileName}`);
    };

    // Filter Logic
    const filteredData = data.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- SUB-COMPONENTS ---

    const StatusBadge = ({ status }) => {
        const styles = {
            processed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
            pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
            archived: "bg-slate-500/10 text-slate-400 border-slate-500/20",
        };
        
        return (
            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${styles[status] || styles.archived}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-white flex flex-col font-sans selection:bg-indigo-500/30">
            
            {/* Background Texture */}
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20" />

            {/* --- Header --- */}
            <header className="px-8 py-6 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-20 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/home')}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/5"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Data Repository</h1>
                        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Manage Annotated Datasets</p>
                    </div>
                </div>
            </header>

            {/* --- Main Content --- */}
            <main className="flex-1 p-8 max-w-7xl mx-auto w-full relative z-10">
                
                {/* Controls Bar */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
                    
                    {/* Search Input */}
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search filename..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#111114] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600"
                        />
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 text-xs font-mono text-slate-500">
                        <div className="px-3 py-1.5 bg-[#111114] rounded border border-white/5">
                            TOTAL: <span className="text-white">{data.length}</span>
                        </div>
                        <div className="px-3 py-1.5 bg-[#111114] rounded border border-white/5">
                            STORAGE: <span className="text-indigo-400">45%</span>
                        </div>
                    </div>
                </div>

                {/* --- Data Table --- */}
                <div className="bg-[#111114] border border-white/5 rounded-xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            {/* Table Head */}
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-1/3">Filename</th>
                                    <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date Created</th>
                                    <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Metadata</th>
                                    <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>

                            {/* Table Body */}
                            <tbody>
                                <AnimatePresence mode="popLayout">
                                    {filteredData.length > 0 ? (
                                        filteredData.map((file, index) => (
                                            <motion.tr 
                                                key={file.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -20, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                                                transition={{ delay: index * 0.05 }}
                                                className="border-b border-white/5 hover:bg-white/[0.02] group transition-colors"
                                            >
                                                {/* File Name */}
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-indigo-500/10 rounded text-indigo-400">
                                                            <FileVideo size={18} />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition-colors cursor-pointer" onClick={() => handleView(file)}>
                                                                {file.name}
                                                            </div>
                                                            <div className="text-[10px] text-slate-600 font-mono">{file.size}</div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Date */}
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                                        <Calendar size={12} className="text-slate-600" />
                                                        {file.date}
                                                    </div>
                                                </td>

                                                {/* Metadata */}
                                                <td className="p-4">
                                                    <div className="flex gap-3 text-[10px] font-mono text-slate-500">
                                                        <span className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                                                            <Clock size={10} /> {file.duration}
                                                        </span>
                                                        <span className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                                                            FPS: {file.fps}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="p-4">
                                                    <StatusBadge status={file.status} />
                                                </td>

                                                {/* Actions */}
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button 
                                                            onClick={() => handleView(file)}
                                                            className="p-2 hover:bg-indigo-500/20 text-slate-500 hover:text-indigo-400 rounded transition-colors" 
                                                            title="View in Editor"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDownload(file.name)}
                                                            className="p-2 hover:bg-emerald-500/20 text-slate-500 hover:text-emerald-400 rounded transition-colors" 
                                                            title="Download Data"
                                                        >
                                                            <Download size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(file.id)}
                                                            className="p-2 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded transition-colors" 
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    ) : (
                                        // Empty State
                                        <tr>
                                            <td colSpan="5" className="p-12 text-center">
                                                <div className="flex flex-col items-center justify-center opacity-30">
                                                    <Database size={48} className="mb-4" />
                                                    <p className="text-lg font-bold">No Records Found</p>
                                                    <p className="text-sm font-mono">Try adjusting your search criteria</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Recent;