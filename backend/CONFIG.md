# Backend Configuration

## Environment Variables

Create a `.env` file in the backend directory (optional):

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# File Limits (in bytes)
MAX_FILE_SIZE=5368709120  # 5GB
MAX_UPLOAD_FILES=10

# Directories
UPLOAD_DIR=./uploads
PROXY_DIR=./proxies
METADATA_DIR=./metadata

# FFmpeg Settings
FFMPEG_PRESET=medium          # ultrafast, superfast, veryfast, faster, fast, medium, slow, slower
FFMPEG_CRF=23                 # 0-51, lower = better quality, higher = smaller file
FFMPEG_BITRATE=2500k          # Video bitrate
FFMPEG_TIMEOUT=1800000        # Timeout in milliseconds (30 minutes)

# Cleanup
AUTO_CLEANUP_DAYS=7           # Delete old files after N days
```

## FFmpeg Installation

### Windows (Recommended Methods)

**Option 1: Download Pre-built Binary**
1. Visit: https://ffmpeg.org/download.html
2. Download Windows build (gyan.dev recommended)
3. Extract to `C:\ffmpeg`
4. Add to PATH: `setx PATH "%PATH%;C:\ffmpeg\bin"`
5. Restart terminal and verify: `ffmpeg -version`

**Option 2: Using Chocolatey**
```powershell
choco install ffmpeg -y
ffmpeg -version
```

**Option 3: Using Scoop**
```powershell
scoop install ffmpeg
ffmpeg -version
```

### macOS

```bash
# Using Homebrew
brew install ffmpeg ffprobe

# Verify
ffmpeg -version
ffprobe -version
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install ffmpeg

# Verify
ffmpeg -version
ffprobe -version
```

### Linux (Fedora/RHEL)

```bash
sudo dnf install ffmpeg

# Verify
ffmpeg -version
```

## Server Startup

### Development Mode
```bash
npm start
```

Backend will start on `http://localhost:4000` with logs enabled.

### Production Mode
```bash
NODE_ENV=production npm start
```

Or with PM2 for process management:
```bash
npm install -g pm2
pm2 start server.js --name "savetrax-backend"
pm2 save
pm2 startup
```

## Disk Space Requirements

| File Size | Recommended Disk | Processing Time |
|-----------|-----------------|-----------------|
| 500MB     | 2GB             | 2-5 min         |
| 1GB       | 4GB             | 5-10 min        |
| 2GB       | 8GB             | 10-20 min       |
| 3.5GB     | 12GB            | 20-35 min       |
| 5GB       | 16GB            | 30-50 min       |

## Monitoring

### Check Server Health
```bash
curl http://localhost:4000/health
```

### View Processing Status
Monitor the terminal output for FFmpeg progress:
```
[time] Bitrate= 500.5kbits/s frame= 1500 fps= 29 q=-1.0...
```

### Cleanup Old Files (Manual)
```bash
# Remove files older than 7 days
find ./uploads -type f -mtime +7 -delete
find ./proxies -type f -mtime +7 -delete
```

## Troubleshooting

### "FFmpeg not found" Error
```bash
# Check if FFmpeg is installed
ffmpeg -version

# Check PATH
echo $PATH  # macOS/Linux
echo %PATH%  # Windows

# Add to PATH if needed (Windows)
setx PATH "%PATH%;C:\path\to\ffmpeg\bin"
```

### Port Already in Use
```bash
# Kill process on port 4000
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :4000
kill -9 <PID>
```

### Out of Memory During Processing
```bash
# Increase Node.js heap size
node --max-old-space-size=4096 server.js
```

### Slow Video Processing
1. Check disk I/O performance
2. Reduce bitrate in FFmpeg command
3. Use faster preset: `FFMPEG_PRESET=veryfast`
4. Close other applications

## Performance Tuning

### For Faster Encoding
```env
FFMPEG_PRESET=veryfast
FFMPEG_BITRATE=2000k
FFMPEG_CRF=28
```

### For Better Quality
```env
FFMPEG_PRESET=slow
FFMPEG_BITRATE=5000k
FFMPEG_CRF=18
```

### For Streaming (Low Latency)
```env
FFMPEG_PRESET=ultrafast
FFMPEG_BITRATE=1500k
```
