# 🚀 Quick Start Guide - SafeTrAX 2.0

## ⚡ 5-Minute Setup

### Step 1: Install FFmpeg (One-time only)

**Windows:**
```powershell
# Using Chocolatey
choco install ffmpeg -y

# Verify installation
ffmpeg -version
```

**macOS:**
```bash
brew install ffmpeg
ffmpeg -version
```

**Linux (Ubuntu):**
```bash
sudo apt update && sudo apt install ffmpeg -y
ffmpeg -version
```

### Step 2: Start the Application

**Windows:** Double-click `START.bat`

**macOS/Linux:** 
```bash
chmod +x start.sh
./start.sh
```

That's it! 🎉

---

## 💻 Access the Application

Once started, open your browser:
```
http://localhost:5173
```

---

## 📹 Upload Your 3.5GB Video

### Method 1: Click Upload
1. Click the **Upload** button in the footer
2. Select your video file
3. Watch the progress bar

### Method 2: Drag & Drop
1. Simply drag your video onto the main canvas
2. Release to upload
3. Progress displays in real-time

**Expected Time:** 20-35 minutes for 3.5GB file

---

## ✏️ Draw Rectangles

1. **Enter Draw Mode**: Press `D` or click **Draw Mode** button
2. **Select Class**: Choose from dropdown (Car, Truck, Bike, etc.)
3. **Draw**: Click and drag on video to create rectangle
4. **Edit**: Press `V` or click **Edit Mode** to adjust
5. **Delete**: Select rectangle and press `Delete`

---

## 📊 Track FPS

**FPS displays in the header right next to the title**

Example: `FPS: 29.97` and `RES: 1920x1080`

---

## 💾 Export Your Work

Two formats available:

### CSV Export
- Opens in Excel
- Includes: Label, Frame, Time, X, Y, Width, Height, **FPS**, Resolution

### JSON Export
- Full metadata
- Structured format
- Includes all video information

**Button Location:** Bottom right of screen

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play/Pause |
| `→` | Next Frame |
| `←` | Previous Frame |
| `D` | Draw Mode |
| `V` | Edit Mode |
| `H` | Pan Mode |
| `Delete` | Delete Selected Rectangle |

---

## 🎮 Playback Controls

- **Play/Pause**: Large play button or Space key
- **Step Frames**: ±1 or ±10 buttons
- **Go to Frame**: Enter frame number and search
- **Timeline**: Click anywhere to jump

---

## 🔍 Frame Navigation

In the **Jump to Frame** field (bottom right):
1. Type frame number (e.g., `150`)
2. Click the search icon
3. Video jumps to that frame

---

## 🖱️ Canvas Navigation

- **Zoom In/Out**: Buttons in top-right (or scroll wheel)
- **Pan**: Click **Pan Mode** (hand icon) and drag
- **Reset**: Click refresh button

---

## ✅ Full Workflow Example

```
1. START: Double-click START.bat / run ./start.sh
2. WAIT: For servers to start (~5 seconds)
3. UPLOAD: Drag 3.5GB video onto canvas
4. WAIT: For encoding (20-35 minutes) ☕
5. DRAW: Create rectangles on objects
6. LABEL: Choose class from dropdown
7. EXPORT: Click CSV or JSON button
8. DONE: Use file in your application
```

---

## 🆘 Common Issues

### "FFmpeg not found"
```bash
# Verify installation
ffmpeg -version

# If not found, install:
choco install ffmpeg  # Windows
brew install ffmpeg   # macOS
sudo apt install ffmpeg  # Linux
```

### Upload fails
- Check disk space: Need 2x file size free
- Verify internet connection
- Try with smaller video first

### No FPS display
- Video may not be loaded
- Try uploading a different video
- Check browser console (F12)

### Rectangles won't draw
- Make sure you're in **Draw Mode** (press `D`)
- Check that video is fully loaded
- Refresh page and try again

---

## 📁 Project Structure

```
safetrax-react/
├── START.bat                 # Windows launcher
├── start.sh                  # macOS/Linux launcher
├── README.md                 # Full documentation
├── TROUBLESHOOTING.md        # Help & fixes
│
├── backend/
│   ├── server.js             # Main backend
│   ├── CONFIG.md             # Setup guide
│   ├── API.md                # API reference
│   ├── uploads/              # Temporary files
│   ├── proxies/              # Converted videos
│   └── metadata/             # Video info
│
└── frontend/
    ├── src/
    │   ├── pages/Editer.jsx  # Main editor
    │   └── hooks/            # Utilities
    └── package.json
```

---

## 🎯 Next Steps

### After First Use
1. Read [README.md](README.md) for full features
2. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for help
3. See [backend/API.md](backend/API.md) for technical details

### For Development
1. Edit frontend in `frontend/src/pages/Editer.jsx`
2. Edit backend in `backend/server.js`
3. Changes auto-reload in dev mode

### Production Deployment
1. Build frontend: `npm run build` in frontend/
2. Use production build: `dist/` folder
3. Point backend to static files
4. Deploy to server

---

## 📊 Performance Tips

| Action | Tip |
|--------|-----|
| **Slow Upload** | Use wired connection, close apps |
| **Slow Encoding** | Close background apps, more RAM |
| **Laggy Drawing** | Lower zoom level, fewer annotations visible |
| **Browser Issues** | Clear cache (Ctrl+Shift+R), restart |

---

## 🎓 Learn More

- **Features**: See [README.md](README.md)
- **Setup Help**: See [backend/CONFIG.md](backend/CONFIG.md)
- **Troubleshooting**: See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **API Docs**: See [backend/API.md](backend/API.md)
- **Summary**: See [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

---

## ✨ You're All Set!

Everything is ready to handle 3.5GB videos with real-time FPS tracking and annotations.

**Happy annotating!** 🎬

---

**Need help?** Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

**Questions?** See [README.md](README.md) for comprehensive documentation
