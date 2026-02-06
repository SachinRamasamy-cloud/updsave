import express from "express";
import multer from "multer";
import cors from "cors";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

const UPLOAD_DIR = "./uploads";
const PROXY_DIR = "./proxies";
const METADATA_DIR = "./metadata";

fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(PROXY_DIR, { recursive: true });
fs.mkdirSync(METADATA_DIR, { recursive: true });

// Multer – handles 3.5GB+ files safely with streaming
const upload = multer({
  dest: UPLOAD_DIR,
  limits: { fileSize: 5 * 1024 * 1024 * 1024 }, // 5GB limit
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      cb(null, uniqueName);
    }
  })
});

// Helper function for promises
function execAsync(cmd, timeout = 600000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("FFmpeg operation timeout"));
    }, timeout);

    exec(cmd, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      clearTimeout(timer);

      if (err) {
        reject(new Error(stderr || err.message));
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}


// Video Metadata Extraction
async function extractVideoMetadata(videoPath) {
  try {
    const probeCmd = `ffprobe -v error -select_streams v:0 -show_entries stream=avg_frame_rate,width,height -show_entries format=duration -of json "${videoPath}"`;
    
    const result = await execAsync(probeCmd);
    const info = JSON.parse(result.stdout);

    if (!info.streams || info.streams.length === 0) {
      throw new Error("No video stream found");
    }

    const stream = info.streams[0];
    const format = info.format;

    let fps = 30; // Default
    if (stream.avg_frame_rate && stream.avg_frame_rate !== "0/0") {
      const [num, den] = stream.avg_frame_rate.split("/");
      fps = Number(num) / Number(den);
    }

    const duration = parseFloat(format.duration) || 0;
    const totalFrames = Math.round(fps * duration);
    const width = stream.width || 1920;
    const height = stream.height || 1080;

    return { fps, duration, totalFrames, width, height };
  } catch (err) {
    console.error("Metadata extraction failed:", err);
    throw err;
  }
}

// Upload + Normalize endpoint
app.post("/upload", upload.single("video"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No video file uploaded" });
  }

  const inputPath = req.file.path;
  const fileId = req.file.filename;
  const outputPath = path.join(PROXY_DIR, `${fileId}.mp4`);
  const metadataPath = path.join(METADATA_DIR, `${fileId}.json`);

  try {
    console.log(`📹 Processing video: ${inputPath}`);

    // 1️⃣ Extract metadata
    const metadata = await extractVideoMetadata(inputPath);
    console.log(`✅ Metadata extracted:`, metadata);

    // 2️⃣ Create browser-safe proxy with lower bitrate for streaming
    console.log("🎬 Encoding proxy video...");
    const ffmpegCmd = `ffmpeg -y -i "${inputPath}" -map 0:v:0 -map 0:a? -c:v libx264 -pix_fmt yuv420p -profile:v main -level 4.1 -b:v 2500k -maxrate 5000k -bufsize 10000k -movflags +faststart -c:a aac -b:a 128k "${outputPath}"`;

    await execAsync(ffmpegCmd, 1800000); // 30 min timeout for encoding
    console.log("✅ Proxy video created");

    // 3️⃣ Save metadata for later retrieval
    fs.writeFileSync(metadataPath, JSON.stringify({
      fileId,
      timestamp: new Date().toISOString(),
      ...metadata
    }, null, 2));

    // 4️⃣ Clean up original uploaded file
    try {
      fs.unlinkSync(inputPath);
    } catch (e) {
      console.warn("Could not delete uploaded file:", e);
    }

    res.json({
      fileId,
      fps: metadata.fps,
      duration: metadata.duration,
      totalFrames: metadata.totalFrames,
      width: metadata.width,
      height: metadata.height,
      proxyUrl: `http://localhost:4000/proxy/${fileId}.mp4`,
      metadataUrl: `http://localhost:4000/metadata/${fileId}`
    });

  } catch (err) {
    console.error("❌ Upload error:", err);
    
    // Cleanup on error
    try {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    } catch (e) {}
    
    res.status(500).json({ 
      error: "Video processing failed",
      details: err.message 
    });
  }
});

// Serve proxy videos
app.use("/proxy", express.static(PROXY_DIR));

// Metadata endpoint
app.get("/metadata/:fileId", (req, res) => {
  const metadataPath = path.join(METADATA_DIR, `${req.params.fileId}.json`);
  
  if (!fs.existsSync(metadataPath)) {
    return res.status(404).json({ error: "Metadata not found" });
  }

  try {
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    res.json(metadata);
  } catch (err) {
    res.status(500).json({ error: "Failed to read metadata" });
  }
});

// Cleanup endpoint (optional)
app.post("/cleanup/:fileId", (req, res) => {
  const fileId = req.params.fileId;
  const proxyPath = path.join(PROXY_DIR, `${fileId}.mp4`);
  const metadataPath = path.join(METADATA_DIR, `${fileId}.json`);

  try {
    if (fs.existsSync(proxyPath)) fs.unlinkSync(proxyPath);
    if (fs.existsSync(metadataPath)) fs.unlinkSync(metadataPath);
    res.json({ success: true, message: "Files cleaned up" });
  } catch (err) {
    res.status(500).json({ error: "Cleanup failed" });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🎥 Video backend running on http://localhost:${PORT}`);
  console.log(`📁 Uploads: ${UPLOAD_DIR}`);
  console.log(`🎬 Proxies: ${PROXY_DIR}`);
});
