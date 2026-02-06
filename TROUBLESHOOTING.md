# SafeTrAX Troubleshooting & Optimization Guide

## Quick Diagnostics

Run this script to check your system:

```bash
# Windows
echo "FFmpeg:" && ffmpeg -version && echo "" && echo "Node:" && node -v && echo "" && echo "NPM:" && npm -v

# macOS/Linux
echo "FFmpeg:" && ffmpeg -version && echo "" && echo "Node:" && node -v && echo "" && echo "NPM:" && npm -v
```

---

## Common Issues & Solutions

### ❌ "FFmpeg not found" during upload

**Symptom:** Upload button works, but processing fails with "FFmpeg not found"

**Solutions:**
1. **Verify FFmpeg is installed:**
   ```bash
   ffmpeg -version
   ffprobe -version
   ```

2. **Add to PATH (Windows):**
   ```powershell
   # Find FFmpeg installation
   Get-Command ffmpeg
   
   # If not found, download from https://ffmpeg.org/download.html
   # Then add to PATH:
   [Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\ffmpeg\bin", "User")
   
   # Restart PowerShell and verify
   ffmpeg -version
   ```

3. **Add to PATH (macOS/Linux):**
   ```bash
   which ffmpeg
   
   # If not in PATH:
   export PATH="$PATH:/usr/local/bin"
   ffmpeg -version
   ```

---

### ❌ "Port 4000 already in use"

**Symptom:** Backend fails to start with "Port 4000 already in use"

**Solutions:**
1. **Find and kill existing process:**
   ```bash
   # Windows
   netstat -ano | findstr :4000
   taskkill /PID <PID> /F
   
   # macOS/Linux
   lsof -i :4000
   kill -9 <PID>
   ```

2. **Use different port (backend):**
   Edit `server.js` line (last few lines):
   ```javascript
   const PORT = 4001;  // Change from 4000
   ```

3. **Update frontend API URL:**
   Create `frontend/.env.local`:
   ```
   VITE_API_URL=http://localhost:4001
   ```

---

### ❌ Video upload fails with large files (>2GB)

**Symptom:** Upload starts but fails midway

**Solutions:**

1. **Increase Node.js memory:**
   ```bash
   # Windows (Run backend with increased memory)
   node --max-old-space-size=4096 backend/server.js
   
   # macOS/Linux
   node --max-old-space-size=4096 server.js
   ```

2. **Check disk space:**
   ```bash
   # Windows
   wmic logicaldisk get size,freespace
   
   # macOS
   df -h
   
   # Linux
   df -h
   ```
   Ensure at least 2x the file size is free.

3. **Increase timeout (backend/server.js):**
   ```javascript
   // Line: await execAsync(ffmpegCmd, 1800000);
   // Increase timeout for very large files
   await execAsync(ffmpegCmd, 3600000);  // 60 minutes
   ```

4. **Reduce bitrate for faster processing:**
   Edit `server.js` FFmpeg command:
   ```javascript
   // Change: -b:v 2500k -maxrate 5000k
   // To:
   -b:v 1500k -maxrate 3000k
   ```

---

### ❌ Video plays but no FPS is detected

**Symptom:** Video loads but FPS shows 30 (default) and appears incorrect

**Solutions:**

1. **Check video format:**
   ```bash
   ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,r_frame_rate,avg_frame_rate your_video.mp4
   ```

2. **Try different video codec:**
   ```bash
   # Convert to standard H.264
   ffmpeg -i input.mp4 -c:v libx264 -c:a aac output.mp4
   ```

3. **Manually set FPS:**
   Frontend `Editer.jsx` - find FPS display and manually adjust:
   ```javascript
   setFps(60);  // Manually set if auto-detection fails
   ```

---

### ❌ Rectangles disappear or won't draw

**Symptom:** Can draw rectangles but they disappear or don't sync with video

**Solutions:**

1. **Check browser console for errors:**
   - Press `F12` in browser
   - Check Console tab for JavaScript errors
   - Note any error messages

2. **Clear browser cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Or clear cache in developer tools

3. **Ensure video metadata loaded:**
   - Check that FPS, Duration, and TotalFrames are all > 0
   - If 0, video format may be unsupported

4. **Try different video format:**
   ```bash
   ffmpeg -i input.mov -c:v libx264 -c:a aac output.mp4
   ```

---

### ❌ Export CSV/JSON is empty or corrupt

**Symptom:** Export file exists but is empty or has headers only

**Solutions:**

1. **Verify annotations exist:**
   - Check sidebar for annotation list
   - Make sure at least one rectangle is drawn

2. **Check file permissions:**
   - Ensure Downloads folder is writable
   - Try saving to Desktop instead

3. **Manual export:**
   If automated export fails, use developer console:
   ```javascript
   // In browser console (F12):
   console.log(annotations);  // View annotation data
   ```

---

### ⚠️ System is slow during video processing

**Symptom:** Computer freezes or becomes very slow when uploading large video

**Causes & Solutions:**

1. **Increase system resources to FFmpeg:**
   ```bash
   # Use faster encoding preset (lower quality)
   # Edit server.js, change:
   # -preset medium  →  -preset veryfast
   ```

2. **Close other applications:**
   - Video encoding is CPU intensive
   - Close browsers, editors, etc.

3. **Check RAM usage:**
   ```bash
   # Windows
   tasklist /v | findstr node
   
   # macOS
   top -stats pid,%mem,command -o %mem
   
   # Linux
   top -p $(pgrep node)
   ```

4. **Use external SSD for processing:**
   - Move uploads/proxies directories to SSD
   - Update paths in `server.js`

---

### ⚠️ Network errors during upload

**Symptom:** "Network error during upload" appears midway

**Solutions:**

1. **Check network stability:**
   ```bash
   ping google.com  # Continuous: ping -t google.com (Windows)
   ```

2. **Use smaller chunks:**
   If you have very unstable network, consider:
   - Uploading from the same machine (not over network)
   - Using wired Ethernet instead of WiFi
   - Splitting video into smaller parts

3. **Increase request timeout:**
   Frontend `Editer.jsx`, in `handleFileUpload`:
   ```javascript
   xhr.timeout = 300000;  // 5 minutes
   ```

---

## Performance Optimization

### For faster video processing:

1. **Use faster FFmpeg preset:**
   ```javascript
   // In server.js, change:
   -profile:v main -level 4.1 -preset medium
   // To:
   -profile:v baseline -level 4.1 -preset ultrafast
   ```

2. **Reduce video bitrate:**
   ```javascript
   // Change from:
   -b:v 2500k -maxrate 5000k
   // To:
   -b:v 1500k -maxrate 3000k
   ```

3. **Reduce output resolution (if original is 4K):**
   ```javascript
   ffmpeg -i input.mp4 -vf scale=1920:1080 -c:v libx264 output.mp4
   ```

### For better video quality:

1. **Use slower FFmpeg preset:**
   ```javascript
   -preset slow  // More quality, slower encoding
   ```

2. **Increase CRF (quality):**
   ```javascript
   // Default: -crf 23 (0-51, lower = better)
   // For better quality:
   -crf 18  // High quality but larger file
   ```

3. **Increase bitrate:**
   ```javascript
   -b:v 5000k -maxrate 8000k  // Higher bitrate
   ```

### For streaming optimization:

1. **Use HTTP streaming headers:**
   ```javascript
   -movflags +faststart  // Already included in default
   ```

2. **Segment video for faster loading:**
   Example setup for progressive chunks coming...

---

## System Requirements Check

Run this command to verify your system:

```bash
# Complete system check script
echo "=== SAVETRAX System Check ===" && \
echo "" && \
echo "OS:" && uname -a && \
echo "" && \
echo "Node.js:" && node -v && \
echo "NPM:" && npm -v && \
echo "" && \
echo "FFmpeg:" && ffmpeg -version | head -n 1 && \
echo "FFprobe:" && ffprobe -version | head -n 1 && \
echo "" && \
echo "Disk Space:" && df -h / && \
echo "" && \
echo "Memory:" && \
if [[ "$OSTYPE" == "darwin"* ]]; then sysctl hw.memsize; \
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then free -h; \
elif [[ "$OSTYPE" == "msys" ]]; then wmic os get totalvisiblememorysize; \
fi && \
echo "" && \
echo "=== Check Complete ==="
```

---

## Advanced Configuration

### Custom FFmpeg encoding:

Edit `backend/server.js`:

```javascript
// Find the ffmpegCmd variable around line 90
const ffmpegCmd = `
  ffmpeg -y -i "${inputPath}" \
  -map 0:v:0 -map 0:a? \
  -c:v libx264 \
  -pix_fmt yuv420p \
  -profile:v main \
  -level 4.1 \
  -b:v 2500k \
  -maxrate 5000k \
  -bufsize 10000k \
  -movflags +faststart \
  -c:a aac \
  -b:a 128k \
  "${outputPath}"
`;
```

### Common FFmpeg profiles:

| Profile | Quality | Speed | File Size | Use Case |
|---------|---------|-------|-----------|----------|
| baseline | Low | Fastest | Smallest | Mobile/Web |
| main | Medium | Fast | Medium | Common use |
| high | High | Slower | Larger | Archival |

---

## Logging & Debugging

### Enable detailed logs:

1. **Backend logs (server.js):**
   ```javascript
   // Already includes: console.log, console.error
   // Add more with: DEBUG=* npm start
   ```

2. **Frontend logs (browser console):**
   ```javascript
   // In Editer.jsx, add:
   console.log("Video info:", { fps, duration, totalFrames });
   ```

3. **System logs:**
   ```bash
   # View backend server logs
   tail -f backend_output.log
   ```

---

## Still having issues?

1. **Collect diagnostic info:**
   - System specs (OS, RAM, CPU)
   - FFmpeg version output
   - Full error message from console/terminal
   - Video file details (codec, bitrate, resolution)

2. **Review logs:**
   - Browser console (F12)
   - Backend terminal output
   - Windows Event Viewer (Windows)

3. **Test with different video:**
   - Try with a small test video (100MB)
   - If it works, issue is with file size/format
   - If it fails, system-level issue likely

---

**Last Updated:** February 2026  
**Version:** 2.0
