# SAVETRAX 2.0 - Video Annotation & Tracking System

A professional-grade video annotation tool built with React and Electron, designed to handle large video files (up to 5GB) with real-time rectangle marking, FPS tracking, and metadata export.

## Features

✅ **Large Video Support** - Upload and process videos up to 5GB  
✅ **Real-time Rectangle Drawing** - Draw and edit bounding boxes with precision  
✅ **Live FPS Display** - View actual FPS of the loaded video  
✅ **Frame-Perfect Navigation** - Step through frames with keyboard shortcuts  
✅ **Multi-class Labeling** - Support for 9 different vehicle/object classes  
✅ **Dual Export Format** - Export annotations as CSV or JSON with metadata  
✅ **Drag & Drop Upload** - Simply drag video files to upload  
✅ **Progress Tracking** - Real-time upload progress display  
✅ **Error Handling** - Comprehensive error messages and validation  
✅ **Zoom & Pan** - Navigate large videos with zoom and pan controls  

## System Requirements

- **Node.js** v18+ (for backend)
- **FFmpeg** & **FFprobe** (required for video processing)
- **RAM** - Minimum 8GB (16GB recommended for 3.5GB+ videos)
- **Disk Space** - At least 20GB free for temporary processing

## Installation

### 1. Install FFmpeg
Windows:
```bash
# Using Chocolatey
choco install ffmpeg

# Or download from: https://ffmpeg.org/download.html
```

### 2. Install Dependencies

Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd frontend
npm install
```

## Running the Application

### Start Backend Server
```bash
cd backend
npm start
```
Server runs on `http://localhost:4000`

### Start Frontend (Development)
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

### Build for Production
```bash
cd frontend
npm run build
```

## Usage Guide

### Uploading Videos

1. **Click Upload Button** or **Drag & Drop** a video file onto the canvas
2. Supported formats: MP4, MOV, AVI, WebM, MKV, etc.
3. Maximum file size: 5GB per video
4. Video is automatically converted to browser-safe format (H.264, MP4)

### Drawing Annotations

1. **Toggle to DRAW MODE** - Click the draw button or press `D`
2. **Select Class** - Choose from: Auto, Bike, Bus, Car, LCV, Truck, NMV, MultiAxle, Pedestrian
3. **Draw Rectangle** - Click and drag on the video to create a bounding box
4. **Edit Rectangle** - Select the rectangle and drag to move or resize it
5. **Delete** - Press `Delete` or click the trash icon in the sidebar

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play/Pause |
| `→` | Next Frame |
| `←` | Previous Frame |
| `D` | Draw Mode |
| `V` | Edit Mode |
| `H` | Pan Mode |
| `Delete` | Delete Selected |

### Frame Navigation

1. **Go to Specific Frame** - Enter frame number and click search icon
2. **Frame Counter** - Shows current frame / total frames
3. **Timeline** - Click anywhere on timeline to jump to that point
4. **Step Controls** - Use ±1, ±10 frame buttons for fine navigation

### Exporting Annotations

#### CSV Export
```
Label,Frame,Timestamp,X,Y,Width,Height,FPS,TotalFrames,VideoWidth,VideoHeight
Car_1,150,5.00,100,200,150,100,30.00,1800,1920,1080
```

#### JSON Export
```json
{
  "metadata": {
    "fileName": "video.mp4",
    "fps": 30.0,
    "duration": 60.0,
    "totalFrames": 1800,
    "videoWidth": 1920,
    "videoHeight": 1080,
    "exportDate": "2026-02-06T10:30:00Z",
    "annotationCount": 5
  },
  "annotations": [
    {
      "id": "shape-1234567890",
      "label": "Car_1",
      "frame": 150,
      "timestamp": "5.000",
      "x": 100,
      "y": 200,
      "width": 150,
      "height": 100
    }
  ]
}
```

## Project Structure

```
safetrax-react/
├── backend/
│   ├── server.js          # Main Express server
│   ├── package.json       # Backend dependencies
│   ├── uploads/           # Temporary video uploads
│   ├── proxies/           # Converted MP4 files
│   └── metadata/          # Video metadata JSON files
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main routing
│   │   ├── main.jsx       # Entry point
│   │   ├── index.css      # Global styles
│   │   ├── pages/
│   │   │   ├── Editer.jsx # Main annotation editor
│   │   │   └── Splash.jsx # Landing page
│   │   ├── hooks/
│   │   │   └── useAnnotation.js # Annotation utilities
│   │   └── utils/
│   │       └── timeUtils.js # Time/frame utilities
│   ├── package.json
│   └── vite.config.js
```

## API Endpoints

### POST /upload
Upload and process a video file.

**Request:**
```
Content-Type: multipart/form-data
- video: [File]
```

**Response:**
```json
{
  "fileId": "1707200400000-a1b2c3d4e5",
  "fps": 30.0,
  "duration": 60.5,
  "totalFrames": 1815,
  "width": 1920,
  "height": 1080,
  "proxyUrl": "http://localhost:4000/proxy/1707200400000-a1b2c3d4e5.mp4",
  "metadataUrl": "http://localhost:4000/metadata/1707200400000-a1b2c3d4e5"
}
```

### GET /metadata/{fileId}
Retrieve video metadata.

**Response:**
```json
{
  "fileId": "1707200400000-a1b2c3d4e5",
  "timestamp": "2026-02-06T10:30:00Z",
  "fps": 30.0,
  "duration": 60.5,
  "totalFrames": 1815,
  "width": 1920,
  "height": 1080
}
```

### GET /proxy/{videoId}.mp4
Stream the proxy video.

### POST /cleanup/{fileId}
Clean up uploaded and proxy files.

### GET /health
Health check endpoint.

## Troubleshooting

### "FFmpeg not found"
- Ensure FFmpeg is installed and in system PATH
- Verify: `ffmpeg -version` in terminal

### Upload fails for large files
- Check free disk space (need 2x file size)
- Increase Node.js memory: `node --max-old-space-size=4096 server.js`
- Check network stability

### Video plays but no rectangles shown
- Ensure FPS is correctly detected
- Try a different video format
- Check browser console for JavaScript errors

### Export file corruption
- Verify annotations were created (sidebar shows list)
- Check file system permissions
- Try different export format (CSV vs JSON)

## Performance Tips

1. **Large Videos (>2GB)** - FFmpeg encoding takes time, be patient
2. **Zoom Level** - Keep zoom < 5x for smooth interaction
3. **Annotations** - Performance degrades with 500+ rectangles per frame
4. **RAM** - Monitor system RAM during large file processing

## Development

### Adding New Classes
Edit `Editer.jsx` line ~570:
```jsx
<select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
  <option>YourNewClass</option>
</select>
```

### Customizing Export Format
Modify `exportJSON()` and `exportCSV()` functions in `Editer.jsx`

### Changing UI Colors
Main color scheme uses Tailwind classes - modify className values in components

## License

Proprietary - SafeTrAX

## Support

For issues, feature requests, or questions:
- Check the troubleshooting section above
- Review browser console for errors
- Check backend logs: `backend/server.js` output

---

**Version:** 2.0  
**Last Updated:** February 2026  
**Built with:** React, Vite, Konva, FFmpeg, Express, Tailwind CSS
