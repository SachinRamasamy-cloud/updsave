// import React, { useState, useRef, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//     Play, Pause, Square, Trash2,
//     Upload, FileDown, Plus,
//     Search, Target, RefreshCcw,
//     ZoomIn, ZoomOut, Hand, MousePointer2, Move,
//     RotateCcw, Rewind, FastForward,
//     HelpCircle, FileVideo,
//     StepForward, StepBack
// } from "lucide-react";
// import { Stage, Layer, Rect, Transformer, Text } from "react-konva";

// const Editor = () => {
//     // --- STATE MANAGEMENT ---

//     // Video & Playback
//     const [videoFile, setVideoFile] = useState(null);
//     const [videoSrc, setVideoSrc] = useState(null);
//     const [isPlaying, setIsPlaying] = useState(false);
//     const [currentTime, setCurrentTime] = useState(0);
//     const [duration, setDuration] = useState(0);
//     const [fps, setFps] = useState(30);
//     const [totalFrames, setTotalFrames] = useState(0);
//     const [currentFrame, setCurrentFrame] = useState(0);
//     const [videoWidth, setVideoWidth] = useState(0);
//     const [videoHeight, setVideoHeight] = useState(0);
//     const [uploadProgress, setUploadProgress] = useState(0);
//     const [isUploading, setIsUploading] = useState(false);
//     const [uploadError, setUploadError] = useState(null);
//     const [fileId, setFileId] = useState(null);
//     const [dragActive, setDragActive] = useState(false);

//     // Layout & Canvas
//     const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0, scale: 1 });
//     const [zoom, setZoom] = useState(1);
//     const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
//     const [showHints, setShowHints] = useState(false);

//     // Tools & Mode
//     const [mode, setMode] = useState("draw"); // Options: 'draw', 'edit', 'pan'
//     const [selectedClass, setSelectedClass] = useState("Car");

//     // Annotation Data
//     const [annotations, setAnnotations] = useState([]);
//     const [selectedId, setSelectedId] = useState(null);
//     const [currentRect, setCurrentRect] = useState(null);
//     const [drawStartPos, setDrawStartPos] = useState({ x: 0, y: 0 });
//     const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
//     const [classCounters, setClassCounters] = useState({});
//     const [goToFrame, setGoToFrame] = useState("");

//     // --- REFS ---
//     const videoRef = useRef(null);
//     const stageRef = useRef(null);
//     const transformerRef = useRef(null);
//     const fileInputRef = useRef(null);
//     const containerRef = useRef(null);
//     const fpsRef = useRef(fps);

//     // --- EFFECTS ---

//     // 1. Update FPS Ref for callbacks
//     useEffect(() => {
//         fpsRef.current = fps;
//     }, [fps]);

//     // 2. Keyboard Shortcuts
//     useEffect(() => {
//         const handleKeyDown = (e) => {
//             if (!videoRef.current || e.target.tagName === 'INPUT') return;

//             switch (e.code) {
//                 case 'Space': e.preventDefault(); togglePlay(); break;
//                 case 'ArrowLeft': e.preventDefault(); stepFrame(-1); break;
//                 case 'ArrowRight': e.preventDefault(); stepFrame(1); break;
//                 case 'Delete':
//                     if (selectedId) {
//                         setAnnotations(prev => prev.filter(a => a.id !== selectedId));
//                         setSelectedId(null);
//                         setMode('edit'); // Stay in edit mode
//                     }
//                     break;
//                 default: break;
//             }
//         };
//         window.addEventListener('keydown', handleKeyDown);
//         return () => window.removeEventListener('keydown', handleKeyDown);
//     }, [selectedId, fps]);

//     // 3. Attach Transformer (Fix for Edit Mode)
//     useEffect(() => {
//         if (selectedId && transformerRef.current && stageRef.current) {
//             const node = stageRef.current.findOne('.' + selectedId);
//             if (node) {
//                 transformerRef.current.nodes([node]);
//                 transformerRef.current.getLayer().batchDraw();
//             } else {
//                 transformerRef.current.nodes([]);
//             }
//         } else if (transformerRef.current) {
//             transformerRef.current.nodes([]);
//         }
//     }, [selectedId, annotations, mode]);

//     // 4. Handle Window Resize
//     useEffect(() => {
//         const handleResize = () => {
//             if (videoRef.current && containerRef.current) updateVideoDimensions();
//         };
//         window.addEventListener('resize', handleResize);
//         return () => window.removeEventListener('resize', handleResize);
//     }, [videoSrc]);

//     // 5. Video Frame Callback (High Precision)
//     useEffect(() => {
//         const video = videoRef.current;
//         if (!video || !video.requestVideoFrameCallback) return;

//         let callbackId;
//         const onFrame = (now, metadata) => {
//             const frame = Math.round(metadata.mediaTime * fpsRef.current);
//             setCurrentFrame(frame);
//             callbackId = video.requestVideoFrameCallback(onFrame);
//         };

//         callbackId = video.requestVideoFrameCallback(onFrame);
//         return () => {
//             if (callbackId) video.cancelVideoFrameCallback(callbackId);
//         };
//     }, [videoSrc, fps]);

//     // --- HELPER FUNCTIONS ---

//     const updateVideoDimensions = () => {
//         if (!videoRef.current || !containerRef.current) return;
//         const video = videoRef.current;
//         const container = containerRef.current;

//         if (video.videoWidth) {
//             const containerRatio = container.offsetWidth / container.offsetHeight;
//             const videoRatio = video.videoWidth / video.videoHeight;
//             let finalWidth, finalHeight;

//             if (videoRatio > containerRatio) {
//                 finalWidth = container.offsetWidth;
//                 finalHeight = finalWidth / videoRatio;
//             } else {
//                 finalHeight = container.offsetHeight;
//                 finalWidth = finalHeight * videoRatio;
//             }

//             setVideoDimensions({
//                 width: finalWidth,
//                 height: finalHeight,
//                 scale: video.videoWidth / finalWidth
//             });
//         }
//     };

//     // Upload logic with progress tracking and error handling
//     const handleFileUpload = async (e) => {
//         const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
//         if (!file) return;

//         if (!file.type.startsWith('video/')) {
//             setUploadError('Please select a valid video file');
//             return;
//         }

//         const fileSizeMB = file.size / (1024 * 1024);
//         if (fileSizeMB > 5000) {
//             setUploadError('File size exceeds 5GB limit');
//             return;
//         }

//         setIsUploading(true);
//         setUploadError(null);
//         setUploadProgress(0);

//         const formData = new FormData();
//         formData.append("video", file);

//         try {
//             const xhr = new XMLHttpRequest();

//             // Progress tracking
//             xhr.upload.addEventListener('progress', (e) => {
//                 if (e.lengthComputable) {
//                     const percentComplete = (e.loaded / e.total) * 100;
//                     setUploadProgress(Math.round(percentComplete));
//                 }
//             });

//             xhr.addEventListener('load', async () => {
//                 if (xhr.status === 200) {
//                     const info = JSON.parse(xhr.responseText);
                    
//                     // Use proxy video for playback
//                     setVideoSrc(info.proxyUrl);
//                     setFps(info.fps);
//                     setDuration(info.duration);
//                     setTotalFrames(info.totalFrames);
//                     setVideoWidth(info.width);
//                     setVideoHeight(info.height);
//                     setFileId(info.fileId);
//                     setVideoFile(file.name);
//                     setUploadProgress(100);
                    
//                     console.log("✅ Video processed:", info);
//                 } else {
//                     const error = JSON.parse(xhr.responseText);
//                     setUploadError(error.details || 'Upload failed');
//                 }
//                 setIsUploading(false);
//                 setUploadProgress(0);
//             });

//             xhr.addEventListener('error', () => {
//                 setUploadError('Network error during upload');
//                 setIsUploading(false);
//                 setUploadProgress(0);
//             });

//             xhr.open('POST', `http://localhost:4000/upload`);
//             xhr.send(formData);
//         } catch (err) {
//             setUploadError(err.message || 'Upload failed');
//             setIsUploading(false);
//             setUploadProgress(0);
//         }
//     };


//     const togglePlay = () => {
//         if (videoRef.current.paused) {
//             videoRef.current.play();
//             setIsPlaying(true);
//         } else {
//             videoRef.current.pause();
//             setIsPlaying(false);
//         }
//     };

//     const stepFrame = (framesToJump) => {
//         if (!videoRef.current) return;
//         videoRef.current.pause();
//         setIsPlaying(false);
//         const newTime = videoRef.current.currentTime + (framesToJump / fps);
//         videoRef.current.currentTime = Math.max(0, Math.min(newTime, duration));
//     };

//     const seekToFrameInput = () => {
//         const targetTime = parseInt(goToFrame) / fps;
//         if (!isNaN(targetTime)) {
//             videoRef.current.currentTime = targetTime;
//             setCurrentTime(targetTime);
//             videoRef.current.pause();
//             setIsPlaying(false);
//         }
//     };

//     // --- ZOOM & PAN ---

//     const handleZoom = (direction) => {
//         setZoom(prev => Math.max(0.5, Math.min(prev * (direction > 0 ? 1.1 : 0.9), 10)));
//     };

//     const resetZoom = () => {
//         setZoom(1);
//         setStagePos({ x: 0, y: 0 });
//     };

//     const selectiveZoom = (ann) => {
//         videoRef.current.pause();
//         setIsPlaying(false);
//         videoRef.current.currentTime = parseFloat(ann.timestamp);

//         // Center object logic
//         const targetZoom = 3;
//         const objCenterX = ann.x + (ann.width / 2);
//         const objCenterY = ann.y + (ann.height / 2);
//         const viewportCenterX = videoDimensions.width / 2;
//         const viewportCenterY = videoDimensions.height / 2;

//         setZoom(targetZoom);
//         setStagePos({
//             x: viewportCenterX - (objCenterX * targetZoom),
//             y: viewportCenterY - (objCenterY * targetZoom)
//         });

//         setSelectedId(ann.id);
//         setMode('edit');
//     };

//     // --- DRAWING LOGIC ---

//     const getRelativePointerPosition = (stage) => {
//         const transform = stage.getAbsoluteTransform().copy().invert();
//         return transform.point(stage.getPointerPosition());
//     };

//     const handleMouseDown = (e) => {
//         if (mode === 'pan') return;

//         const stage = e.target.getStage();
//         const pos = getRelativePointerPosition(stage);

//         if (e.target === stage) {
//             if (mode === "draw") {
//                 // Start Drawing
//                 setSelectedId(null);
//                 const id = `shape-${Date.now()}`;
//                 setDrawStartPos({ x: pos.x, y: pos.y });
//                 setCurrentRect({ x: pos.x, y: pos.y, width: 0, height: 0, id });
//             } else if (mode === "edit") {
//                 // Deselect if clicking background
//                 setSelectedId(null);
//             }
//         }
//     };

//     const handleMouseMove = (e) => {
//         if (mode === 'pan') return;

//         const stage = e.target.getStage();
//         const pos = getRelativePointerPosition(stage);
//         setMousePos(pos);

//         if (!currentRect || mode !== "draw") return;

//         // Calculate dimensions allowing drawing in any direction
//         const newX = Math.min(drawStartPos.x, pos.x);
//         const newY = Math.min(drawStartPos.y, pos.y);
//         const newWidth = Math.abs(pos.x - drawStartPos.x);
//         const newHeight = Math.abs(pos.y - drawStartPos.y);

//         setCurrentRect({ ...currentRect, x: newX, y: newY, width: newWidth, height: newHeight });
//     };

//     const handleMouseUp = () => {
//         if (mode === "draw" && currentRect) {
//             // Only add if size is significant (>5px)
//             if (currentRect.width > 5 && currentRect.height > 5) {
//                 addAnnotation(currentRect);
//             } else {
//                 setCurrentRect(null); // Discard tiny accidental clicks
//             }
//         }
//     };

//     const addAnnotation = (rect) => {
//         const currentCount = (classCounters[selectedClass] || 0) + 1;
//         const newEntry = {
//             ...rect,
//             label: `${selectedClass}_${currentCount}`,
//             frame: currentFrame,
//             timestamp: currentTime.toFixed(3),
//             id: rect.id
//         };

//         setAnnotations([...annotations, newEntry]);
//         setClassCounters({ ...classCounters, [selectedClass]: currentCount });
//         setCurrentRect(null);

//         // AUTO-SWITCH TO EDIT MODE
//         setSelectedId(newEntry.id);
//         setMode("edit");
//     };

//     const handleDrag = (e) => {
//         e.preventDefault();
//         e.stopPropagation();
//         if (e.type === "dragenter" || e.type === "dragover") {
//             setDragActive(true);
//         } else if (e.type === "dragleave") {
//             setDragActive(false);
//         }
//     };

//     const handleDrop = (e) => {
//         e.preventDefault();
//         e.stopPropagation();
//         setDragActive(false);
        
//         const file = e.dataTransfer?.files?.[0];
//         if (file && file.type.startsWith('video/')) {
//             handleFileUpload({ dataTransfer: e.dataTransfer });
//         }
//     };

//     const exportCSV = () => {
//         const scale = videoDimensions.scale;
//         const headers = "Label,Frame,Timestamp,X,Y,Width,Height,FPS,TotalFrames,VideoWidth,VideoHeight\n";
//         const rows = annotations.map(ann =>
//             `${ann.label},${ann.frame},${ann.timestamp},${Math.round(ann.x * scale)},${Math.round(ann.y * scale)},${Math.round(ann.width * scale)},${Math.round(ann.height * scale)},${fps},${totalFrames},${videoWidth},${videoHeight}`
//         ).join("\n");
//         const blob = new Blob([headers + rows], { type: 'text/csv' });
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = `annotations_${Date.now()}.csv`;
//         a.click();
//         window.URL.revokeObjectURL(url);
//     };

//     const exportJSON = () => {
//         const scale = videoDimensions.scale;
//         const data = {
//             metadata: {
//                 fileName: videoFile || 'unknown',
//                 fps,
//                 duration,
//                 totalFrames,
//                 videoWidth,
//                 videoHeight,
//                 exportDate: new Date().toISOString(),
//                 annotationCount: annotations.length
//             },
//             annotations: annotations.map(ann => ({
//                 ...ann,
//                 x: Math.round(ann.x * scale),
//                 y: Math.round(ann.y * scale),
//                 width: Math.round(ann.width * scale),
//                 height: Math.round(ann.height * scale)
//             }))
//         };
//         const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = `annotations_${Date.now()}.json`;
//         a.click();
//         window.URL.revokeObjectURL(url);
//     };

//     // --- UI HELPER ---
//     const Hint = ({ text }) => showHints ? (
//         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute -top-10 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-50 border border-white/20">
//             {text} <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-600 rotate-45"></div>
//         </motion.div>
//     ) : null;

//     return (
//         <div className="flex flex-col h-screen w-full bg-[#09090b] text-slate-300 overflow-hidden font-sans select-none">

//             {/* --- HEADER --- */}
//             <div className="h-14 bg-[#111114] border-b border-white/5 flex items-center px-6 justify-between z-30">
//                 <div className="flex items-center gap-4">
//                     <h1 className="text-lg font-black text-white tracking-tight">SAVETRAX <span className="text-indigo-500"> - </span>2.0</h1>
//                     <div className="h-6 w-[1px] bg-white/10 mx-2"></div>
//                     <div className="flex items-center gap-2 text-[11px] font-mono bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
//                         <span className="text-slate-500">FPS:</span>
//                         <span className="text-white font-bold">{fps.toFixed(2)}</span>
//                     </div>
//                     {videoWidth > 0 && (
//                         <div className="flex items-center gap-2 text-[11px] font-mono bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
//                             <span className="text-slate-500">RES:</span>
//                             <span className="text-white font-bold">{videoWidth}x{videoHeight}</span>
//                         </div>
//                     )}
//                 </div>

//                 <div className="flex items-center gap-4">
//                     <button onClick={() => setShowHints(!showHints)} className={`flex items-center gap-2 px-3 py-1.5 rounded text-[11px] font-bold transition-all ${showHints ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
//                         <HelpCircle size={14} /> {showHints ? 'HINTS ON' : 'HELP'}
//                     </button>
//                     <div className="flex items-center gap-2 text-[10px] font-mono">
//                         <span className={`w-2 h-2 rounded-full ${videoSrc ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
//                         <span>{videoSrc ? "SYSTEM READY" : "NO SOURCE"}</span>
//                     </div>
//                 </div>
//             </div>

//             <div className="flex flex-1 overflow-hidden">
//                 {/* --- MAIN CANVAS AREA --- */}
//                 <main className="flex-1 flex flex-col relative bg-[#050507]">

//                     {/* OVERLAYS */}
//                     <div className="absolute top-4 left-6 z-20 pointer-events-none">
//                         <div className="bg-black/90 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 shadow-xl">
//                             <span className="text-[9px] text-indigo-400 font-bold block mb-1 opacity-70">CANVAS POSITION</span>
//                             <span className="text-sm font-mono text-white tracking-widest">X:{Math.round(mousePos.x)} Y:{Math.round(mousePos.y)}</span>
//                         </div>
//                     </div>

//                     <div className="absolute top-4 right-6 z-20 flex flex-col items-end gap-3">
//                         <div className="bg-black/90 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 shadow-xl text-right">
//                             <span className="text-[9px] text-emerald-400 font-bold block mb-1 opacity-70">FRAMES</span>
//                             <div className="text-sm font-mono text-white tracking-widest">
//                                 <span className="text-white">{currentFrame}</span>
//                                 <span className="text-slate-600 mx-1">/</span>
//                                 <span className="text-slate-400">{totalFrames}</span>
//                             </div>
//                         </div>
//                         <div className="bg-black/90 backdrop-blur-md p-1.5 rounded-lg border border-white/10 shadow-xl flex flex-col gap-1">
//                             <button onClick={() => handleZoom(1)} className="p-2 hover:bg-white/10 rounded text-indigo-400"><ZoomIn size={18} /></button>
//                             <button onClick={() => handleZoom(-1)} className="p-2 hover:bg-white/10 rounded text-slate-400"><ZoomOut size={18} /></button>
//                             <button onClick={resetZoom} className="p-2 hover:bg-white/10 rounded text-slate-400"><RefreshCcw size={16} /></button>
//                         </div>
//                     </div>

//                     {/* VIDEO CONTAINER */}
//                     <div 
//                         ref={containerRef} 
//                         className="flex-1 relative flex items-center justify-center overflow-hidden"
//                         onDragEnter={handleDrag}
//                         onDragLeave={handleDrag}
//                         onDragOver={handleDrag}
//                         onDrop={handleDrop}
//                     >
//                         {videoSrc ? (
//                             <div style={{ width: videoDimensions.width, height: videoDimensions.height, position: 'relative' }}>
//                                 <video
//                                     ref={videoRef}
//                                     src={videoSrc}
//                                     onTimeUpdate={() => setCurrentTime(videoRef.current.currentTime)}
//                                     onLoadedMetadata={(e) => { setDuration(e.target.duration); updateVideoDimensions(); }}
//                                     className="w-full h-full object-contain pointer-events-none"
//                                     style={{
//                                         transform: `translate(${stagePos.x}px, ${stagePos.y}px) scale(${zoom})`,
//                                         transformOrigin: 'top left'
//                                     }}
//                                 />
//                                 <Stage
//                                     width={videoDimensions.width}
//                                     height={videoDimensions.height}
//                                     scaleX={zoom}
//                                     scaleY={zoom}
//                                     x={stagePos.x}
//                                     y={stagePos.y}
//                                     draggable={mode === 'pan'}
//                                     onDragEnd={(e) => setStagePos({ x: e.target.x(), y: e.target.y() })}
//                                     className={`absolute top-0 left-0 ${mode === 'pan' ? 'cursor-grab active:cursor-grabbing' : mode === 'draw' ? 'cursor-crosshair' : 'cursor-default'}`}
//                                     onMouseDown={handleMouseDown}
//                                     onMouseMove={handleMouseMove}
//                                     onMouseUp={handleMouseUp}
//                                     ref={stageRef}
//                                 >
//                                     <Layer>
//                                         {/* Existing Annotations */}
//                                         {annotations.filter(a => Math.abs(a.timestamp - currentTime) < (1 / fps)).map((ann) => (
//                                             <React.Fragment key={ann.id}>
//                                                 <Text
//                                                     text={ann.label}
//                                                     x={ann.x}
//                                                     y={ann.y - 18 / zoom}
//                                                     fontSize={14 / zoom}
//                                                     fill="#e5e7eb"
//                                                     padding={4 / zoom}
//                                                     background="#111827"
//                                                     listening={false}
//                                                 />
//                                                 <Rect
//                                                     {...ann}
//                                                     name={ann.id}
//                                                     draggable={mode === 'edit' && selectedId === ann.id}
//                                                     onClick={() => { setSelectedId(ann.id); setMode('edit'); }}
//                                                     onTap={() => { setSelectedId(ann.id); setMode('edit'); }}
//                                                     onDragEnd={(e) => {
//                                                         const node = e.target;
//                                                         setAnnotations(annotations.map(a => a.id === ann.id ? { ...a, x: node.x(), y: node.y() } : a));
//                                                     }}
//                                                     onTransformEnd={(e) => {
//                                                         const node = e.target;
//                                                         setAnnotations(annotations.map(a => a.id === ann.id ? {
//                                                             ...a, x: node.x(), y: node.y(), width: node.width() * node.scaleX(), height: node.height() * node.scaleY()
//                                                         } : a));
//                                                         node.scaleX(1); node.scaleY(1);
//                                                     }}
//                                                     stroke={selectedId === ann.id ? "#f43f5e" : "#818cf8"}
//                                                     strokeWidth={selectedId === ann.id ? 2 / zoom : 1.5 / zoom}
//                                                     fill={selectedId === ann.id ? "rgba(244, 63, 94, 0.1)" : "transparent"}
//                                                 />
//                                             </React.Fragment>
//                                         ))}

//                                         {/* Currently Drawing Shape */}
//                                         {currentRect && (
//                                             <Rect {...currentRect} stroke="#34d399" strokeWidth={2 / zoom} dash={[4, 2]} />
//                                         )}

//                                         {/* Edit Transformer */}
//                                         <Transformer
//                                             ref={transformerRef}
//                                             rotateEnabled={false}
//                                             borderStroke="#f43f5e"
//                                             anchorStroke="#f43f5e"
//                                             anchorSize={8}
//                                             anchorCornerRadius={2}
//                                             boundBoxFunc={(oldBox, newBox) => (newBox.width < 5 || newBox.height < 5) ? oldBox : newBox}
//                                         />
//                                     </Layer>
//                                 </Stage>
//                             </div>
//                         ) : (
//                             <div className={`text-center opacity-30 select-none w-full h-full flex flex-col items-center justify-center transition-all ${dragActive ? 'opacity-100 bg-indigo-500/10 border-2 border-indigo-500' : ''}`}>
//                                 {isUploading ? (
//                                     <div className="flex flex-col items-center gap-4 opacity-100">
//                                         <div className="animate-spin">
//                                             <FileVideo size={80} className="text-indigo-500" />
//                                         </div>
//                                         <p className="text-2xl font-black tracking-tighter text-white">UPLOADING VIDEO</p>
//                                         <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
//                                             <div 
//                                                 className="h-full bg-indigo-500 transition-all duration-300"
//                                                 style={{ width: `${uploadProgress}%` }}
//                                             />
//                                         </div>
//                                         <p className="text-sm font-mono text-slate-400">{uploadProgress}%</p>
//                                     </div>
//                                 ) : uploadError ? (
//                                     <div className="flex flex-col items-center gap-4 opacity-100">
//                                         <FileVideo size={80} className="text-red-500" />
//                                         <p className="text-2xl font-black tracking-tighter text-red-500">ERROR</p>
//                                         <p className="text-sm text-red-400 max-w-xs">{uploadError}</p>
//                                         <button 
//                                             onClick={() => fileInputRef.current?.click()}
//                                             className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-500"
//                                         >
//                                             Try Again
//                                         </button>
//                                     </div>
//                                 ) : (
//                                     <div className="flex flex-col items-center gap-4 opacity-30 hover:opacity-100 transition-opacity">
//                                         <FileVideo size={80} />
//                                         <p className="text-2xl font-black tracking-tighter">DRAG & DROP VIDEO</p>
//                                         <p className="text-sm text-slate-400">or click upload button</p>
//                                         <p className="text-xs text-slate-500 max-w-xs">Supports video files up to 5GB • 3.5GB recommended</p>
//                                     </div>
//                                 )}
//                             </div>
//                         )}
//                     </div>
//                 </main>

//                 {/* --- SIDEBAR --- */}
//                 <aside className="w-80 bg-[#0e0e11] border-l border-white/5 flex flex-col z-30">
//                     <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#131316]">
//                         <h2 className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">Detection List</h2>
//                         <span className="bg-white/10 text-white text-[10px] px-2 py-0.5 rounded font-mono">{annotations.length}</span>
//                     </div>

//                     <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
//                         <AnimatePresence>
//                             {annotations.map((ann) => (
//                                 <motion.div
//                                     key={ann.id}
//                                     initial={{ opacity: 0, x: 20 }}
//                                     animate={{ opacity: 1, x: 0 }}
//                                     exit={{ opacity: 0, x: -20 }}
//                                     className={`p-3 rounded border transition-all relative ${selectedId === ann.id ? 'bg-indigo-500/10 border-indigo-500' : 'bg-[#18181b] border-white/5 hover:border-white/20'}`}
//                                 >
//                                     <div className="flex justify-between items-start mb-2 cursor-pointer" onClick={() => selectiveZoom(ann)}>
//                                         <div>
//                                             <h4 className="text-[11px] font-bold text-white tracking-tight flex items-center gap-2">
//                                                 <Square size={10} className={selectedId === ann.id ? "text-indigo-400" : "text-slate-500"} />
//                                                 {ann.label}
//                                             </h4>
//                                             <div className="mt-1 space-y-0.5">
//                                                 <div className="text-[9px] text-slate-500 font-mono">
//                                                     FRAME: <span className="text-slate-300">{ann.frame}</span> | TIME: <span className="text-slate-300">{parseFloat(ann.timestamp).toFixed(2)}s</span>
//                                                 </div>
//                                                 <div className="text-[9px] text-slate-500 font-mono">
//                                                     POS: X:<span className="text-slate-300">{Math.round(ann.x)}</span> Y:<span className="text-slate-300">{Math.round(ann.y)}</span>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                     <button onClick={() => {
//                                         setAnnotations(annotations.filter(a => a.id !== ann.id));
//                                         if (selectedId === ann.id) setSelectedId(null);
//                                     }} className="absolute top-3 right-3 text-slate-600 hover:text-rose-500 transition-colors">
//                                         <Trash2 size={12} />
//                                     </button>
//                                 </motion.div>
//                             ))}
//                         </AnimatePresence>
//                     </div>

//                     <div className="p-4 border-t border-white/5 space-y-3">
//                         <button
//                             onClick={() => { setMode('draw'); setSelectedId(null); }}
//                             className={`w-full py-3 rounded text-[10px] font-black tracking-widest flex items-center justify-center gap-2 transition-all ${mode === 'draw' ? 'bg-indigo-600 text-white shadow-lg shadow-emerald-900/50' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
//                         >
//                             <Plus size={14} /> {mode === 'draw' ? 'DRAW MODE ACTIVE' : 'ADD ANNOTATION'}
//                         </button>
//                     </div>
//                 </aside>
//             </div>

//             {/* --- FOOTER --- */}
//             <footer className="bg-[#111114] border-t border-white/5 p-4 z-40">
//                 <div className="max-w-[1800px] mx-auto space-y-4">

//                     {/* TIMELINE */}
//                     <div className="flex items-center gap-4 group">
//                         <div className="text-[10px] font-mono text-slate-500 w-12 text-right">{currentTime.toFixed(2)}s</div>
//                         <div className="flex-1 relative h-6 flex items-center">
//                             <input
//                                 type="range"
//                                 min="0" max={duration || 0} step="0.01"
//                                 value={currentTime}
//                                 onChange={(e) => {
//                                     videoRef.current.currentTime = e.target.value;
//                                     videoRef.current.pause(); setIsPlaying(false);
//                                 }}
//                                 className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 focus:outline-none z-10"
//                             />
//                             {annotations.map((ann, i) => (
//                                 <div key={i} className="absolute h-2 w-[2px] bg-indigo-500/50 top-2 pointer-events-none" style={{ left: `${(parseFloat(ann.timestamp) / duration) * 100}%` }} />
//                             ))}
//                         </div>
//                         <div className="text-[10px] font-mono text-slate-500 w-12">{duration.toFixed(2)}s</div>
//                     </div>

//                     {/* CONTROL BAR */}
//                     <div className="flex items-center justify-between">

//                         <div className="flex items-center gap-6 relative">
//                             <Hint text="Playback Controls" />
//                             <div className="flex items-center gap-1 bg-black/40 p-1 rounded-full border border-white/5">
//                                 <button onClick={() => { videoRef.current.currentTime = 0; setIsPlaying(false); }} className="p-2 text-slate-400 hover:text-white" title="Restart"><Square size={14} /></button>
//                                 <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
//                                 <button onClick={() => stepFrame(-10)} className="p-2 text-slate-400 hover:text-white text-[10px] font-bold w-8"><Rewind size={14} /></button>
//                                 <button onClick={() => stepFrame(-1)} className="p-2 text-slate-400 hover:text-white text-[10px] font-bold w-8"><StepBack size={14} /></button>
//                                 <button onClick={togglePlay} className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-indigo-600 transition-all shadow-lg hover:bg-indigo-500">
//                                     {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
//                                 </button>
//                                 <button onClick={() => stepFrame(1)} className="p-2 text-slate-400 hover:text-white text-[10px] font-bold w-8"><StepForward size={14} /></button>
//                                 <button onClick={() => stepFrame(10)} className="p-2 text-slate-400 hover:text-white text-[10px] font-bold w-8"><FastForward size={14} /></button>
//                             </div>
//                             <div className="relative">
//                                 <button onClick={() => fileInputRef.current.click()} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded text-[10px] font-bold flex items-center gap-2 transition-colors border border-white/5">
//                                     <Upload size={14} /> Upload
//                                 </button>
//                                 <Hint text="Load Local Video" />
//                                 <input type="file" ref={fileInputRef} hidden accept="video/*" onChange={handleFileUpload} />
//                             </div>
//                         </div>

//                         <div className="flex items-center gap-4 bg-black/40 px-4 py-2 rounded-lg border border-white/5 relative">
//                             <Hint text="Interaction Modes" />
//                             <div className="flex gap-1 bg-black/50 p-1 rounded border border-white/5">
//                                 <button onClick={() => setMode('pan')} className={`p-1.5 rounded transition-all ${mode === 'pan' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`} title="Pan (H)"><Hand size={16} /></button>
//                                 <button onClick={() => { setMode('draw'); setSelectedId(null); }} className={`p-1.5 rounded transition-all ${mode === 'draw' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`} title="Draw (D)"><Plus size={16} /></button>
//                                 <button onClick={() => setMode('edit')} className={`p-1.5 rounded transition-all ${mode === 'edit' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`} title="Edit (V)"><MousePointer2 size={16} /></button>
//                             </div>
//                             <div className="w-[1px] h-6 bg-white/10" />
//                             <div className="flex flex-col relative">
//                                 <label className="text-[8px] font-bold text-slate-500 uppercase mb-0.5">Label Class</label>
//                                 <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="bg-transparent text-[11px] font-bold text-white outline-none w-24">
//                                     <option className="bg-[#111]">Auto</option>
//                                     <option className="bg-[#111]">Bike</option>
//                                     <option className="bg-[#111]">Bus</option>
//                                     <option className="bg-[#111]">Car</option>
//                                     <option className="bg-[#111]">LCV</option>
//                                     <option className="bg-[#111]">Truck</option>
//                                     <option className="bg-[#111]">NMV</option>
//                                     <option className="bg-[#111]">MultiAxle</option>
//                                     <option className="bg-[#111]">Pedestrian</option>
//                                 </select>
//                             </div>
//                         </div>

//                         <div className="flex items-center gap-3 relative">
//                             <Hint text="Jump to Frame / Export" />
//                             <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded border border-white/5">
//                                 <Target size={12} className="text-slate-500" />
//                                 <input type="text" placeholder="FRAME" value={goToFrame} onChange={(e) => setGoToFrame(e.target.value)} className="bg-transparent text-[11px] w-12 text-white outline-none font-mono" />
//                                 <button onClick={seekToFrameInput} className="text-indigo-400 hover:text-white"><Search size={14} /></button>
//                             </div>
//                             <div className="flex gap-2">
//                                 <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded text-[10px] font-bold hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/50">
//                                     <FileDown size={14} /> CSV
//                                 </button>
//                                 <button onClick={exportJSON} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded text-[10px] font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/50">
//                                     <FileDown size={14} /> JSON
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </footer>
//         </div>
//     );
// };

// export default Editor;

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Play, Pause, Square, Trash2,
    Upload, FileDown, Plus,
    Search, Target, RefreshCcw,
    ZoomIn, ZoomOut, Hand, MousePointer2,
    Rewind, FastForward,
    HelpCircle, FileVideo,
    StepForward, StepBack,
    CheckCircle, Settings
} from "lucide-react";
import { Stage, Layer, Rect, Transformer, Text } from "react-konva";

const Editor = () => {
    // --- STATE MANAGEMENT ---

    // Video & Playback
    const [videoFile, setVideoFile] = useState(null);
    const [videoSrc, setVideoSrc] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    
    // FPS Management
    const [fps, setFps] = useState(30);
    const [detectedFps, setDetectedFps] = useState(0);
    const [showFpsPopup, setShowFpsPopup] = useState(false); // Controls the popup
    
    const [totalFrames, setTotalFrames] = useState(0);
    const [currentFrame, setCurrentFrame] = useState(0);
    const [videoWidth, setVideoWidth] = useState(0);
    const [videoHeight, setVideoHeight] = useState(0);
    
    // Upload State
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [fileId, setFileId] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    // Layout & Canvas
    const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0, scale: 1 });
    const [zoom, setZoom] = useState(1);
    const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
    const [showHints, setShowHints] = useState(false);

    // Tools & Mode
    const [mode, setMode] = useState("draw"); // Options: 'draw', 'edit', 'pan'
    const [selectedClass, setSelectedClass] = useState("Car");

    // Annotation Data
    const [annotations, setAnnotations] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [currentRect, setCurrentRect] = useState(null);
    const [drawStartPos, setDrawStartPos] = useState({ x: 0, y: 0 });
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [classCounters, setClassCounters] = useState({});
    const [goToFrame, setGoToFrame] = useState("");

    // --- REFS ---
    const videoRef = useRef(null);
    const stageRef = useRef(null);
    const transformerRef = useRef(null);
    const fileInputRef = useRef(null);
    const containerRef = useRef(null);
    const fpsRef = useRef(fps);

    // --- EFFECTS ---

    // 1. Update FPS Ref
    useEffect(() => {
        fpsRef.current = fps;
    }, [fps]);

    // 2. Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!videoRef.current || e.target.tagName === 'INPUT' || showFpsPopup) return;

            switch (e.code) {
                case 'Space': e.preventDefault(); togglePlay(); break;
                case 'ArrowLeft': e.preventDefault(); stepFrame(-1); break;
                case 'ArrowRight': e.preventDefault(); stepFrame(1); break;
                case 'Delete':
                    if (selectedId) {
                        setAnnotations(prev => prev.filter(a => a.id !== selectedId));
                        setSelectedId(null);
                        setMode('edit');
                    }
                    break;
                default: break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId, fps, showFpsPopup]);

    // 3. Attach Transformer
    useEffect(() => {
        if (selectedId && transformerRef.current && stageRef.current) {
            const node = stageRef.current.findOne('.' + selectedId);
            if (node) {
                transformerRef.current.nodes([node]);
                transformerRef.current.getLayer().batchDraw();
            } else {
                transformerRef.current.nodes([]);
            }
        } else if (transformerRef.current) {
            transformerRef.current.nodes([]);
        }
    }, [selectedId, annotations, mode]);

    // 4. Resize Handler
    useEffect(() => {
        const handleResize = () => {
            if (videoRef.current && containerRef.current) updateVideoDimensions();
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [videoSrc]);

    // 5. Video Frame Callback
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !video.requestVideoFrameCallback) return;

        let callbackId;
        const onFrame = (now, metadata) => {
            const frame = Math.round(metadata.mediaTime * fpsRef.current);
            setCurrentFrame(frame);
            callbackId = video.requestVideoFrameCallback(onFrame);
        };

        callbackId = video.requestVideoFrameCallback(onFrame);
        return () => {
            if (callbackId) video.cancelVideoFrameCallback(callbackId);
        };
    }, [videoSrc, fps]);

    // --- HELPER FUNCTIONS ---

    const updateVideoDimensions = () => {
        if (!videoRef.current || !containerRef.current) return;
        const video = videoRef.current;
        const container = containerRef.current;

        if (video.videoWidth) {
            const containerRatio = container.offsetWidth / container.offsetHeight;
            const videoRatio = video.videoWidth / video.videoHeight;
            let finalWidth, finalHeight;

            if (videoRatio > containerRatio) {
                finalWidth = container.offsetWidth;
                finalHeight = finalWidth / videoRatio;
            } else {
                finalHeight = container.offsetHeight;
                finalWidth = finalHeight * videoRatio;
            }

            setVideoDimensions({
                width: finalWidth,
                height: finalHeight,
                scale: video.videoWidth / finalWidth
            });
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('video/')) {
            setUploadError('Please select a valid video file');
            return;
        }

        setIsUploading(true);
        setUploadError(null);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append("video", file);

        try {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    setUploadProgress(Math.round(percentComplete));
                }
            });

            xhr.addEventListener('load', async () => {
                if (xhr.status === 200) {
                    const info = JSON.parse(xhr.responseText);
                    
                    // 1. Set Video Basics
                    setVideoSrc(info.proxyUrl);
                    setDuration(info.duration);
                    setVideoWidth(info.width);
                    setVideoHeight(info.height);
                    setFileId(info.fileId);
                    setVideoFile(file.name);
                    
                    // 2. TRIGGER POPUP - Do NOT set active FPS yet
                    setDetectedFps(info.fps); // Store backend FPS
                    setShowFpsPopup(true);    // Open selection modal
                    
                    setUploadProgress(100);
                } else {
                    const error = JSON.parse(xhr.responseText);
                    setUploadError(error.details || 'Upload failed');
                }
                setIsUploading(false);
                setUploadProgress(0);
            });

            xhr.open('POST', `http://localhost:4000/upload`);
            xhr.send(formData);
        } catch (err) {
            setUploadError(err.message || 'Upload failed');
            setIsUploading(false);
        }
    };

    const confirmFpsSelection = (selectedFps) => {
        setFps(selectedFps);
        setTotalFrames(Math.round(selectedFps * duration)); // Recalculate total frames based on choice
        setShowFpsPopup(false);
    };

    const togglePlay = () => {
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const stepFrame = (framesToJump) => {
        if (!videoRef.current) return;
        videoRef.current.pause();
        setIsPlaying(false);
        const newTime = videoRef.current.currentTime + (framesToJump / fps);
        videoRef.current.currentTime = Math.max(0, Math.min(newTime, duration));
    };

    const seekToFrameInput = () => {
        const targetTime = parseInt(goToFrame) / fps;
        if (!isNaN(targetTime)) {
            videoRef.current.currentTime = targetTime;
            setCurrentTime(targetTime);
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    // --- ENHANCED ZOOM & PAN (MOUSE WHEEL) ---

    const handleWheel = (e) => {
        e.evt.preventDefault(); // Stop page scrolling
        
        const scaleBy = 1.1; // Sensitivity
        const stage = stageRef.current;
        const oldScale = stage.scaleX();
        
        // Get pointer relative to stage
        const pointer = stage.getPointerPosition();

        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        // Calculate new scale
        let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
        
        // Clamp zoom level (0.5x to 15x)
        newScale = Math.max(0.5, Math.min(newScale, 15));

        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };

        setZoom(newScale);
        setStagePos(newPos);
    };

    const handleZoom = (direction) => {
        const center = { x: videoDimensions.width / 2, y: videoDimensions.height / 2 };
        const newZoom = Math.max(0.5, Math.min(zoom * (direction > 0 ? 1.2 : 0.8), 10));
        
        // Zoom towards center if using buttons
        const newPos = {
            x: center.x - (center.x - stagePos.x) * (newZoom / zoom),
            y: center.y - (center.y - stagePos.y) * (newZoom / zoom)
        };

        setZoom(newZoom);
        setStagePos(newPos);
    };

    const resetZoom = () => {
        setZoom(1);
        setStagePos({ x: 0, y: 0 });
    };

    const selectiveZoom = (ann) => {
        videoRef.current.pause();
        setIsPlaying(false);
        videoRef.current.currentTime = parseFloat(ann.timestamp);

        const targetZoom = 3;
        const objCenterX = ann.x + (ann.width / 2);
        const objCenterY = ann.y + (ann.height / 2);
        const viewportCenterX = videoDimensions.width / 2;
        const viewportCenterY = videoDimensions.height / 2;

        setZoom(targetZoom);
        setStagePos({
            x: viewportCenterX - (objCenterX * targetZoom),
            y: viewportCenterY - (objCenterY * targetZoom)
        });

        setSelectedId(ann.id);
        setMode('edit');
    };

    // --- DRAWING LOGIC ---

    const getRelativePointerPosition = (stage) => {
        const transform = stage.getAbsoluteTransform().copy().invert();
        return transform.point(stage.getPointerPosition());
    };

    const handleMouseDown = (e) => {
        // Middle click for pan or pan mode
        if (e.evt.button === 1 || mode === 'pan') {
            setMode('pan'); // Temporary pan if middle click
            return;
        }

        const stage = e.target.getStage();
        const pos = getRelativePointerPosition(stage);

        if (e.target === stage) {
            if (mode === "draw") {
                setSelectedId(null);
                const id = `shape-${Date.now()}`;
                setDrawStartPos({ x: pos.x, y: pos.y });
                setCurrentRect({ x: pos.x, y: pos.y, width: 0, height: 0, id });
            } else if (mode === "edit") {
                setSelectedId(null);
            }
        }
    };

    const handleMouseMove = (e) => {
        const stage = e.target.getStage();
        const pos = getRelativePointerPosition(stage);
        setMousePos(pos);

        if (!currentRect || mode !== "draw") return;

        const newX = Math.min(drawStartPos.x, pos.x);
        const newY = Math.min(drawStartPos.y, pos.y);
        const newWidth = Math.abs(pos.x - drawStartPos.x);
        const newHeight = Math.abs(pos.y - drawStartPos.y);

        setCurrentRect({ ...currentRect, x: newX, y: newY, width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
        if (mode === "draw" && currentRect) {
            if (currentRect.width > 5 && currentRect.height > 5) {
                addAnnotation(currentRect);
            } else {
                setCurrentRect(null);
            }
        }
    };

    const addAnnotation = (rect) => {
        const currentCount = (classCounters[selectedClass] || 0) + 1;
        const newEntry = {
            ...rect,
            label: `${selectedClass}_${currentCount}`,
            frame: currentFrame,
            timestamp: currentTime.toFixed(3),
            id: rect.id
        };

        setAnnotations([...annotations, newEntry]);
        setClassCounters({ ...classCounters, [selectedClass]: currentCount });
        setCurrentRect(null);
        setSelectedId(newEntry.id);
        setMode("edit");
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const file = e.dataTransfer?.files?.[0];
        if (file && file.type.startsWith('video/')) handleFileUpload({ dataTransfer: e.dataTransfer });
    };

    const exportCSV = () => {
        const scale = videoDimensions.scale;
        const headers = "Label,Frame,Timestamp,X,Y,Width,Height,FPS,TotalFrames,VideoWidth,VideoHeight\n";
        const rows = annotations.map(ann =>
            `${ann.label},${ann.frame},${ann.timestamp},${Math.round(ann.x * scale)},${Math.round(ann.y * scale)},${Math.round(ann.width * scale)},${Math.round(ann.height * scale)},${fps},${totalFrames},${videoWidth},${videoHeight}`
        ).join("\n");
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `annotations_${Date.now()}.csv`;
        a.click();
    };

    const exportJSON = () => {
        const scale = videoDimensions.scale;
        const data = {
            metadata: { fileName: videoFile || 'unknown', fps, duration, totalFrames, videoWidth, videoHeight, exportDate: new Date().toISOString() },
            annotations: annotations.map(ann => ({ ...ann, x: Math.round(ann.x * scale), y: Math.round(ann.y * scale), width: Math.round(ann.width * scale), height: Math.round(ann.height * scale) }))
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `annotations_${Date.now()}.json`;
        a.click();
    };

    // --- COMPONENTS ---
    const Hint = ({ text }) => showHints ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute -top-10 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-50 border border-white/20">
            {text} <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-600 rotate-45"></div>
        </motion.div>
    ) : null;

    // --- FPS POPUP MODAL ---
    const FpsSelectionModal = () => {
        // Allowed list logic: Only 10, 25, 30, 60 AND only if value <= detectedFps
        const allOptions = [10, 25, 30, 60];
        const validOptions = allOptions.filter(opt => opt <= detectedFps);
        
        // If detected FPS is very low (e.g. 15), ensure we show at least the lower bounds or the specific detected one
        // If validOptions is empty (e.g. video is 5fps), we show detectedFps as custom option
        const finalOptions = validOptions.length > 0 ? validOptions : [Math.floor(detectedFps)];

        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-[#111114] border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
                    
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><Settings size={20} /></div>
                        <h3 className="text-lg font-bold text-white">Configure Frame Rate</h3>
                    </div>

                    <p className="text-slate-400 text-xs mb-4 leading-relaxed">
                        Detected Source FPS: <span className="text-white font-mono font-bold">{detectedFps.toFixed(2)}</span>
                        <br/>
                        Select a standard frame rate for annotation consistency.
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                        {finalOptions.map(opt => (
                            <button
                                key={opt}
                                onClick={() => confirmFpsSelection(opt)}
                                className="flex items-center justify-between px-4 py-3 bg-[#09090b] border border-white/5 hover:border-indigo-500 rounded-lg group transition-all"
                            >
                                <span className="font-mono font-bold text-indigo-400 group-hover:text-white transition-colors">{opt} FPS</span>
                                <CheckCircle size={16} className="text-slate-700 group-hover:text-indigo-500 transition-colors" />
                            </button>
                        ))}
                    </div>
                </motion.div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-screen w-full bg-[#09090b] text-slate-300 overflow-hidden font-sans select-none">
            
            {showFpsPopup && <FpsSelectionModal />}

            {/* --- HEADER --- */}
            <div className="h-14 bg-[#111114] border-b border-white/5 flex items-center px-6 justify-between z-30">
                <div className="flex items-center gap-4">
                    <h1 className="text-lg font-black text-white tracking-tight">SAVETRAX <span className="text-indigo-500"> - </span>2.0</h1>
                    <div className="h-6 w-[1px] bg-white/10 mx-2"></div>
                    <div className="flex items-center gap-2 text-[11px] font-mono bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                        <span className="text-slate-500">FPS:</span>
                        <span className="text-white font-bold">{fps.toFixed(2)}</span>
                    </div>
                    {videoWidth > 0 && (
                        <div className="flex items-center gap-2 text-[11px] font-mono bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                            <span className="text-slate-500">RES:</span>
                            <span className="text-white font-bold">{videoWidth}x{videoHeight}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={() => setShowHints(!showHints)} className={`flex items-center gap-2 px-3 py-1.5 rounded text-[11px] font-bold transition-all ${showHints ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
                        <HelpCircle size={14} /> {showHints ? 'HINTS ON' : 'HELP'}
                    </button>
                    <div className="flex items-center gap-2 text-[10px] font-mono">
                        <span className={`w-2 h-2 rounded-full ${videoSrc ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        <span>{videoSrc ? "SYSTEM READY" : "NO SOURCE"}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* --- MAIN CANVAS AREA --- */}
                <main className="flex-1 flex flex-col relative bg-[#050507]">

                    {/* OVERLAYS */}
                    <div className="absolute top-4 left-6 z-20 pointer-events-none">
                        <div className="bg-black/90 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 shadow-xl">
                            <span className="text-[9px] text-indigo-400 font-bold block mb-1 opacity-70">CANVAS POSITION</span>
                            <span className="text-sm font-mono text-white tracking-widest">X:{Math.round(mousePos.x)} Y:{Math.round(mousePos.y)}</span>
                        </div>
                    </div>

                    <div className="absolute top-4 right-6 z-20 flex flex-col items-end gap-3">
                        <div className="bg-black/90 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 shadow-xl text-right">
                            <span className="text-[9px] text-emerald-400 font-bold block mb-1 opacity-70">FRAMES</span>
                            <div className="text-sm font-mono text-white tracking-widest">
                                <span className="text-white">{currentFrame}</span>
                                <span className="text-slate-600 mx-1">/</span>
                                <span className="text-slate-400">{totalFrames}</span>
                            </div>
                        </div>
                        <div className="bg-black/90 backdrop-blur-md p-1.5 rounded-lg border border-white/10 shadow-xl flex flex-col gap-1">
                            <button onClick={() => handleZoom(1)} className="p-2 hover:bg-white/10 rounded text-indigo-400"><ZoomIn size={18} /></button>
                            <button onClick={() => handleZoom(-1)} className="p-2 hover:bg-white/10 rounded text-slate-400"><ZoomOut size={18} /></button>
                            <button onClick={resetZoom} className="p-2 hover:bg-white/10 rounded text-slate-400"><RefreshCcw size={16} /></button>
                        </div>
                    </div>

                    {/* VIDEO CONTAINER */}
                    <div 
                        ref={containerRef} 
                        className="flex-1 relative flex items-center justify-center overflow-hidden"
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        {videoSrc ? (
                            <div style={{ width: videoDimensions.width, height: videoDimensions.height, position: 'relative' }}>
                                <video
                                    ref={videoRef}
                                    src={videoSrc}
                                    onTimeUpdate={() => setCurrentTime(videoRef.current.currentTime)}
                                    className="w-full h-full object-contain pointer-events-none"
                                    style={{
                                        transform: `translate(${stagePos.x}px, ${stagePos.y}px) scale(${zoom})`,
                                        transformOrigin: 'top left'
                                    }}
                                />
                                <Stage
                                    width={videoDimensions.width}
                                    height={videoDimensions.height}
                                    scaleX={zoom}
                                    scaleY={zoom}
                                    x={stagePos.x}
                                    y={stagePos.y}
                                    draggable={mode === 'pan'}
                                    onWheel={handleWheel} // ADDED WHEEL HANDLER HERE
                                    onDragEnd={(e) => setStagePos({ x: e.target.x(), y: e.target.y() })}
                                    className={`absolute top-0 left-0 ${mode === 'pan' ? 'cursor-grab active:cursor-grabbing' : mode === 'draw' ? 'cursor-crosshair' : 'cursor-default'}`}
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    ref={stageRef}
                                >
                                    <Layer>
                                        {annotations.filter(a => Math.abs(a.timestamp - currentTime) < (1 / fps)).map((ann) => (
                                            <React.Fragment key={ann.id}>
                                                <Text
                                                    text={ann.label}
                                                    x={ann.x}
                                                    y={ann.y - 18 / zoom}
                                                    fontSize={14 / zoom}
                                                    fill="#e5e7eb"
                                                    padding={4 / zoom}
                                                    background="#111827"
                                                    listening={false}
                                                />
                                                <Rect
                                                    {...ann}
                                                    name={ann.id}
                                                    draggable={mode === 'edit' && selectedId === ann.id}
                                                    onClick={() => { setSelectedId(ann.id); setMode('edit'); }}
                                                    onTap={() => { setSelectedId(ann.id); setMode('edit'); }}
                                                    onDragEnd={(e) => {
                                                        const node = e.target;
                                                        setAnnotations(annotations.map(a => a.id === ann.id ? { ...a, x: node.x(), y: node.y() } : a));
                                                    }}
                                                    onTransformEnd={(e) => {
                                                        const node = e.target;
                                                        setAnnotations(annotations.map(a => a.id === ann.id ? {
                                                            ...a, x: node.x(), y: node.y(), width: node.width() * node.scaleX(), height: node.height() * node.scaleY()
                                                        } : a));
                                                        node.scaleX(1); node.scaleY(1);
                                                    }}
                                                    stroke={selectedId === ann.id ? "#f43f5e" : "#818cf8"}
                                                    strokeWidth={selectedId === ann.id ? 2 / zoom : 1.5 / zoom}
                                                    fill={selectedId === ann.id ? "rgba(244, 63, 94, 0.1)" : "transparent"}
                                                />
                                            </React.Fragment>
                                        ))}
                                        {currentRect && (
                                            <Rect {...currentRect} stroke="#34d399" strokeWidth={2 / zoom} dash={[4, 2]} />
                                        )}
                                        <Transformer
                                            ref={transformerRef}
                                            rotateEnabled={false}
                                            borderStroke="#f43f5e"
                                            anchorStroke="#f43f5e"
                                            anchorSize={8}
                                            anchorCornerRadius={2}
                                            boundBoxFunc={(oldBox, newBox) => (newBox.width < 5 || newBox.height < 5) ? oldBox : newBox}
                                        />
                                    </Layer>
                                </Stage>
                            </div>
                        ) : (
                            <div className={`text-center opacity-30 select-none w-full h-full flex flex-col items-center justify-center transition-all ${dragActive ? 'opacity-100 bg-indigo-500/10 border-2 border-indigo-500' : ''}`}>
                                {isUploading ? (
                                    <div className="flex flex-col items-center gap-4 opacity-100">
                                        <div className="animate-spin"><FileVideo size={80} className="text-indigo-500" /></div>
                                        <p className="text-2xl font-black tracking-tighter text-white">UPLOADING VIDEO</p>
                                        <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                        </div>
                                        <p className="text-sm font-mono text-slate-400">{uploadProgress}%</p>
                                    </div>
                                ) : uploadError ? (
                                    <div className="flex flex-col items-center gap-4 opacity-100">
                                        <FileVideo size={80} className="text-red-500" />
                                        <p className="text-2xl font-black tracking-tighter text-red-500">ERROR</p>
                                        <p className="text-sm text-red-400 max-w-xs">{uploadError}</p>
                                        <button onClick={() => fileInputRef.current?.click()} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-500">Try Again</button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4 opacity-30 hover:opacity-100 transition-opacity">
                                        <FileVideo size={80} />
                                        <p className="text-2xl font-black tracking-tighter">DRAG & DROP VIDEO</p>
                                        <p className="text-sm text-slate-400">or click upload button</p>
                                        <p className="text-xs text-slate-500 max-w-xs">Supports video files up to 5GB • 3.5GB recommended</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>

                {/* --- SIDEBAR --- */}
                <aside className="w-80 bg-[#0e0e11] border-l border-white/5 flex flex-col z-30">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#131316]">
                        <h2 className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">Detection List</h2>
                        <span className="bg-white/10 text-white text-[10px] px-2 py-0.5 rounded font-mono">{annotations.length}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                        <AnimatePresence>
                            {annotations.map((ann) => (
                                <motion.div
                                    key={ann.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className={`p-3 rounded border transition-all relative ${selectedId === ann.id ? 'bg-indigo-500/10 border-indigo-500' : 'bg-[#18181b] border-white/5 hover:border-white/20'}`}
                                >
                                    <div className="flex justify-between items-start mb-2 cursor-pointer" onClick={() => selectiveZoom(ann)}>
                                        <div>
                                            <h4 className="text-[11px] font-bold text-white tracking-tight flex items-center gap-2">
                                                <Square size={10} className={selectedId === ann.id ? "text-indigo-400" : "text-slate-500"} />
                                                {ann.label}
                                            </h4>
                                            <div className="mt-1 space-y-0.5">
                                                <div className="text-[9px] text-slate-500 font-mono">FRAME: <span className="text-slate-300">{ann.frame}</span> | TIME: <span className="text-slate-300">{parseFloat(ann.timestamp).toFixed(2)}s</span></div>
                                                <div className="text-[9px] text-slate-500 font-mono">POS: X:<span className="text-slate-300">{Math.round(ann.x)}</span> Y:<span className="text-slate-300">{Math.round(ann.y)}</span></div>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => {
                                        setAnnotations(annotations.filter(a => a.id !== ann.id));
                                        if (selectedId === ann.id) setSelectedId(null);
                                    }} className="absolute top-3 right-3 text-slate-600 hover:text-rose-500 transition-colors"><Trash2 size={12} /></button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="p-4 border-t border-white/5 space-y-3">
                        <button onClick={() => { setMode('draw'); setSelectedId(null); }} className={`w-full py-3 rounded text-[10px] font-black tracking-widest flex items-center justify-center gap-2 transition-all ${mode === 'draw' ? 'bg-indigo-600 text-white shadow-lg shadow-emerald-900/50' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                            <Plus size={14} /> {mode === 'draw' ? 'DRAW MODE ACTIVE' : 'ADD ANNOTATION'}
                        </button>
                    </div>
                </aside>
            </div>

            {/* --- FOOTER --- */}
            <footer className="bg-[#111114] border-t border-white/5 p-4 z-40">
                <div className="max-w-[1800px] mx-auto space-y-4">
                    {/* TIMELINE */}
                    <div className="flex items-center gap-4 group">
                        <div className="text-[10px] font-mono text-slate-500 w-12 text-right">{currentTime.toFixed(2)}s</div>
                        <div className="flex-1 relative h-6 flex items-center group/timeline">
                            <input
                                type="range"
                                min="0" max={duration || 0} step="0.01"
                                value={currentTime}
                                onChange={(e) => {
                                    videoRef.current.currentTime = e.target.value;
                                    videoRef.current.pause(); setIsPlaying(false);
                                }}
                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 focus:outline-none z-10 transition-all hover:h-1.5"
                            />
                            {annotations.map((ann, i) => (
                                <motion.div 
                                    key={i} 
                                    initial={{ height: 0 }}
                                    animate={{ height: 8 }}
                                    className="absolute w-[2px] bg-indigo-500/50 top-2 pointer-events-none" 
                                    style={{ left: `${(parseFloat(ann.timestamp) / duration) * 100}%` }} 
                                />
                            ))}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 w-12">{duration.toFixed(2)}s</div>
                    </div>

                    {/* CONTROL BAR */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 relative">
                            <Hint text="Playback Controls" />
                            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-full border border-white/5">
                                <button onClick={() => { videoRef.current.currentTime = 0; setIsPlaying(false); }} className="p-2 text-slate-400 hover:text-white" title="Restart"><Square size={14} /></button>
                                <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
                                <button onClick={() => stepFrame(-10)} className="p-2 text-slate-400 hover:text-white text-[10px] font-bold w-8"><Rewind size={14} /></button>
                                <button onClick={() => stepFrame(-1)} className="p-2 text-slate-400 hover:text-white text-[10px] font-bold w-8"><StepBack size={14} /></button>
                                <button onClick={togglePlay} className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-indigo-600 transition-all shadow-lg hover:bg-indigo-500 scale-100 hover:scale-105 active:scale-95">
                                    {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                                </button>
                                <button onClick={() => stepFrame(1)} className="p-2 text-slate-400 hover:text-white text-[10px] font-bold w-8"><StepForward size={14} /></button>
                                <button onClick={() => stepFrame(10)} className="p-2 text-slate-400 hover:text-white text-[10px] font-bold w-8"><FastForward size={14} /></button>
                            </div>
                            <div className="relative">
                                <button onClick={() => fileInputRef.current.click()} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded text-[10px] font-bold flex items-center gap-2 transition-colors border border-white/5">
                                    <Upload size={14} /> Upload
                                </button>
                                <Hint text="Load Local Video" />
                                <input type="file" ref={fileInputRef} hidden accept="video/*" onChange={handleFileUpload} />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-black/40 px-4 py-2 rounded-lg border border-white/5 relative">
                            <Hint text="Interaction Modes" />
                            <div className="flex gap-1 bg-black/50 p-1 rounded border border-white/5">
                                <button onClick={() => setMode('pan')} className={`p-1.5 rounded transition-all ${mode === 'pan' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`} title="Pan (H)"><Hand size={16} /></button>
                                <button onClick={() => { setMode('draw'); setSelectedId(null); }} className={`p-1.5 rounded transition-all ${mode === 'draw' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`} title="Draw (D)"><Plus size={16} /></button>
                                <button onClick={() => setMode('edit')} className={`p-1.5 rounded transition-all ${mode === 'edit' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`} title="Edit (V)"><MousePointer2 size={16} /></button>
                            </div>
                            <div className="w-[1px] h-6 bg-white/10" />
                            <div className="flex flex-col relative">
                                <label className="text-[8px] font-bold text-slate-500 uppercase mb-0.5">Label Class</label>
                                <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="bg-transparent text-[11px] font-bold text-white outline-none w-24">
                                    <option className="bg-[#111]">Auto</option>
                                    <option className="bg-[#111]">Bike</option>
                                    <option className="bg-[#111]">Bus</option>
                                    <option className="bg-[#111]">Car</option>
                                    <option className="bg-[#111]">LCV</option>
                                    <option className="bg-[#111]">Truck</option>
                                    <option className="bg-[#111]">NMV</option>
                                    <option className="bg-[#111]">MultiAxle</option>
                                    <option className="bg-[#111]">Pedestrian</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 relative">
                            <Hint text="Jump to Frame / Export" />
                            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded border border-white/5">
                                <Target size={12} className="text-slate-500" />
                                <input type="text" placeholder="FRAME" value={goToFrame} onChange={(e) => setGoToFrame(e.target.value)} className="bg-transparent text-[11px] w-12 text-white outline-none font-mono" />
                                <button onClick={seekToFrameInput} className="text-indigo-400 hover:text-white"><Search size={14} /></button>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded text-[10px] font-bold hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/50">
                                    <FileDown size={14} /> CSV
                                </button>
                                <button onClick={exportJSON} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded text-[10px] font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/50">
                                    <FileDown size={14} /> JSON
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Editor;