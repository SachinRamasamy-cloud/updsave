const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegPath);

function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // React dev server
  win.loadURL("http://localhost:5173");
}

ipcMain.handle("get-video-info", async (_, filePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);

      const videoStream = metadata.streams.find(
        (s) => s.codec_type === "video"
      );

      resolve({
        fps: eval(videoStream.avg_frame_rate), // REAL FPS
        totalFrames: Number(videoStream.nb_frames), // REAL TOTAL FRAMES
        duration: metadata.format.duration,
      });
    });
  });
});

app.whenReady().then(createWindow);
