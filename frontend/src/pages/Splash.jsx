// import React, { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import { Cpu, ShieldCheck, Zap } from "lucide-react";

// const Splash = () => {
//   const navigate = useNavigate();
//   const [status, setStatus] = useState("Initializing Core Systems...");

//   useEffect(() => {
//     // 1. Text Animation Sequence
//     setTimeout(() => setStatus("Verifying Security Protocols..."), 1000);
//     setTimeout(() => setStatus("Loading User Preferences..."), 2000);

//     // 2. Navigation Logic
//     const timer = setTimeout(() => {
//       const savedUser = localStorage.getItem("savetrax_user");
      
//       if (savedUser) {
//         // User is logged in -> Go to Home Dashboard
//         navigate("/home");
//       } else {
//         // No user found -> Go to Login/Register
//         navigate("/register");
//       }
//     }, 3000); // 3 seconds total duration

//     return () => clearTimeout(timer);
//   }, [navigate]);

//   return (
//     <div className="h-screen w-full flex flex-col items-center justify-center bg-[#09090b] text-white relative overflow-hidden font-sans">
      
//       {/* --- Background Ambience (Matches Auth/Home) --- */}
//       <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
//       <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[120px]" />

//       {/* --- Main Content --- */}
//       <div className="z-10 flex flex-col items-center">
        
//         {/* Logo Icon Animation */}
//         <motion.div
//             initial={{ scale: 0, rotate: -180 }}
//             animate={{ scale: 1, rotate: 0 }}
//             transition={{ duration: 1, type: "spring" }}
//             className="mb-6 relative"
//         >
//             <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-50"></div>
//             <div className="relative w-16 h-16 bg-[#18181b] border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-500 shadow-2xl">
//                 <Cpu size={32} />
//             </div>
//         </motion.div>

//         {/* Brand Name */}
//         <motion.h1
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.3, duration: 0.8 }}
//           className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-2"
//         >
//           SAVETRAX <span className="text-indigo-500">2.0</span>
//         </motion.h1>

//         {/* Subtitle */}
//         <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.6 }}
//             className="flex items-center gap-3 text-xs font-mono text-slate-500 tracking-[0.3em] uppercase mb-8"
//         >
//             <ShieldCheck size={12} className="text-emerald-500" />
//             <span>Secure Annotation Environment</span>
//         </motion.div>

//         {/* Loading Bar */}
//         <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden relative">
//             <motion.div 
//                 initial={{ width: 0 }}
//                 animate={{ width: "100%" }}
//                 transition={{ duration: 2.8, ease: "easeInOut" }}
//                 className="absolute h-full bg-gradient-to-r from-indigo-600 via-purple-500 to-emerald-500"
//             />
//         </div>

//         {/* Dynamic Status Text */}
//         <motion.p
//           key={status} // Key change triggers animation re-run
//           initial={{ opacity: 0, y: 5 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="mt-4 text-slate-400 text-[10px] font-mono"
//         >
//           <span className="animate-pulse mr-2">▋</span>
//           {status}
//         </motion.p>
//       </div>

//       {/* Version Footer */}
//       <div className="absolute bottom-8 text-[10px] text-slate-600 font-mono">
//         SYSTEM VER 2.4.0 • <span className="text-indigo-500/50">INITIALIZING</span>
//       </div>
//     </div>
//   );
// };

// export default Splash;
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Scan, Focus, Aperture, Video } from "lucide-react";

const Splash = () => {
  const navigate = useNavigate();
  const [scanComplete, setScanComplete] = useState(false);

  useEffect(() => {
    // Sequence: Scan finishes at 2.5s, Hold for 0.5s, Redirect
    const timer = setTimeout(() => {
      const savedUser = localStorage.getItem("savetrax_user");
      navigate(savedUser ? "/home" : "/register");
    }, 3200);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#09090b] text-white relative overflow-hidden font-sans select-none">
      
      {/* --- 1. Viewfinder Overlay (Camera UI) --- */}
      {/* Top Left Rec Indicator */}
      <div className="absolute top-8 left-8 flex items-center gap-2">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]" />
        <span className="font-mono text-xs tracking-widest text-red-500/80">REC • 00:00:00:00</span>
      </div>

      {/* Corner Brackets (The "Frame") */}
      <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-white/20" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-white/20" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-white/20" />
      <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-white/20" />

      {/* --- 2. The Scanning Line --- */}
      {/* Moves from top to bottom, revealing objects */}
      <motion.div
        initial={{ top: "0%" }}
        animate={{ top: "100%" }}
        transition={{ duration: 2.5, ease: "easeInOut" }}
        onAnimationComplete={() => setScanComplete(true)}
        className="absolute left-0 right-0 h-[2px] bg-indigo-500 shadow-[0_0_40px_rgba(99,102,241,1)] z-20"
      >
        {/* Scan line text label */}
        <div className="absolute right-4 -top-6 text-[9px] font-mono text-indigo-400 bg-indigo-500/10 px-1 rounded">
          SCANNING_FRAME...
        </div>
      </motion.div>

      {/* --- 3. Detected Bounding Boxes (Pop up as line passes) --- */}
      
      {/* Object 1: Top Left (Appears quickly) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: [0, 1, 0], scale: 1 }} // Flashes and fades
        transition={{ delay: 0.5, duration: 1.5 }}
        className="absolute top-1/4 left-1/4 w-32 h-24 border border-emerald-500/50 rounded bg-emerald-500/5 flex flex-col justify-between p-1"
      >
        <span className="text-[9px] bg-emerald-500 text-black px-1 self-start font-bold">CAR 98%</span>
        <div className="w-full h-full flex items-center justify-center opacity-20"><Video size={20} /></div>
      </motion.div>

      {/* Object 2: Bottom Right (Appears later) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: [0, 1, 0], scale: 1 }}
        transition={{ delay: 1.8, duration: 1.5 }}
        className="absolute bottom-1/3 right-1/4 w-24 h-40 border border-yellow-500/50 rounded bg-yellow-500/5 flex flex-col justify-between p-1"
      >
        <span className="text-[9px] bg-yellow-500 text-black px-1 self-start font-bold">PEDESTRIAN</span>
        <div className="w-full h-full flex items-center justify-center opacity-20"><Scan size={20} /></div>
      </motion.div>

      {/* --- 4. CENTER REVEAL: The Main Logo Box --- */}
      <div className="relative z-30 flex flex-col items-center">
        
        {/* The Center Bounding Box */}
        <motion.div
            initial={{ width: 0, height: 0, opacity: 0, borderColor: "#6366f1" }}
            animate={{ 
                width: 320, 
                height: 120, 
                opacity: 1,
                borderColor: scanComplete ? "#22c55e" : "#6366f1" // Turns green when done
            }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="border-2 border-indigo-500 relative flex items-center justify-center bg-[#09090b]/80 backdrop-blur-sm"
        >
            {/* Corner Anchors for "Selection" look */}
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-indigo-500" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-indigo-500" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-indigo-500" />

            {/* Label Tag on Box */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="absolute -top-5 left-0 bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 flex items-center gap-2"
            >
                {scanComplete ? <span className="flex items-center gap-1"><Aperture size={10} /> PROCESSING_COMPLETE</span> : "DETECTING..."}
            </motion.div>

            {/* Logo Text Reveal */}
            <motion.div
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ delay: 1.4, duration: 0.5 }}
                className="text-center"
            >
                <h1 className="text-4xl font-black tracking-tighter text-white">
                    SAVETRAX
                </h1>
                <div className="flex justify-center gap-4 mt-1">
                     <span className="text-[9px] font-mono text-slate-500">BOUNDING_BOX_GENERATOR</span>
                </div>
            </motion.div>

        </motion.div>

        {/* --- 5. Loading Stats --- */}
        <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: scanComplete ? 0 : 1 }}
             className="absolute -bottom-24 font-mono text-xs text-slate-500 text-center space-y-1"
        >
            <p>LOADING MODELS...</p>
            <div className="flex gap-1 justify-center">
                <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" />
                <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce delay-75" />
                <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce delay-150" />
            </div>
        </motion.div>

      </div>

    </div>
  );
};

export default Splash;