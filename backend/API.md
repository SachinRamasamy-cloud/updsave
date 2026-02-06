# SafeTrAX Backend API Documentation

## Base URL
```
http://localhost:4000
```

## Authentication
No authentication required (development mode)

---

## Endpoints

### 1. Upload & Process Video

**POST** `/upload`

Upload a video file and process it for web playback.

#### Request

**Content-Type:** `multipart/form-data`

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `video` | File | Yes | Video file (max 5GB) |

**cURL Example:**
```bash
curl -X POST -F "video=@myvideo.mp4" http://localhost:4000/upload
```

**JavaScript Example:**
```javascript
const formData = new FormData();
formData.append('video', fileInput.files[0]);

fetch('http://localhost:4000/upload', {
  method: 'POST',
  body: formData
})
.then(r => r.json())
.then(data => console.log(data));
```

#### Response

**Status:** `200 OK`

```json
{
  "fileId": "1707200400000-a1b2c3d4e5",
  "fps": 29.97,
  "duration": 123.456,
  "totalFrames": 3703,
  "width": 1920,
  "height": 1080,
  "proxyUrl": "http://localhost:4000/proxy/1707200400000-a1b2c3d4e5.mp4",
  "metadataUrl": "http://localhost:4000/metadata/1707200400000-a1b2c3d4e5"
}
```

**Response Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `fileId` | string | Unique identifier for this video |
| `fps` | number | Frames per second (actual from video) |
| `duration` | number | Duration in seconds |
| `totalFrames` | number | Total frame count |
| `width` | number | Video width in pixels |
| `height` | number | Video height in pixels |
| `proxyUrl` | string | URL to stream the browser-compatible MP4 |
| `metadataUrl` | string | URL to retrieve stored metadata |

#### Error Responses

**Status:** `400 Bad Request`
```json
{
  "error": "No video file uploaded"
}
```

**Status:** `500 Internal Server Error`
```json
{
  "error": "Video processing failed",
  "details": "FFmpeg error: Invalid data found when processing input"
}
```

#### Processing Time

| File Size | Typical Time | Max Time |
|-----------|-------------|----------|
| 500MB | 2-5 min | 10 min |
| 1GB | 5-10 min | 15 min |
| 2GB | 10-20 min | 30 min |
| 3.5GB | 20-35 min | 45 min |
| 5GB | 30-50 min | 60 min |

---

### 2. Get Video Metadata

**GET** `/metadata/{fileId}`

Retrieve stored metadata for a previously processed video.

#### Request

**Parameters:**
| Parameter | Type | Location | Description |
|-----------|------|----------|-------------|
| `fileId` | string | URL path | Video file ID from upload response |

**cURL Example:**
```bash
curl http://localhost:4000/metadata/1707200400000-a1b2c3d4e5
```

#### Response

**Status:** `200 OK`

```json
{
  "fileId": "1707200400000-a1b2c3d4e5",
  "timestamp": "2026-02-06T10:30:00.000Z",
  "fps": 29.97,
  "duration": 123.456,
  "totalFrames": 3703,
  "width": 1920,
  "height": 1080
}
```

#### Error Responses

**Status:** `404 Not Found`
```json
{
  "error": "Metadata not found"
}
```

---

### 3. Stream Proxy Video

**GET** `/proxy/{videoId}.mp4`

Stream the converted, browser-compatible MP4 video file.

#### Request

**Parameters:**
| Parameter | Type | Location | Description |
|-----------|------|----------|-------------|
| `videoId` | string | URL path | Video file ID (filename without extension) |

**URL Example:**
```
http://localhost:4000/proxy/1707200400000-a1b2c3d4e5.mp4
```

#### Response

**Status:** `200 OK`

**Content-Type:** `video/mp4`

**Headers:**
```
Content-Length: 10485760
Content-Range: bytes 0-10485759/10485760
Accept-Ranges: bytes
Cache-Control: public, max-age=86400
```

#### Range Requests

Supports HTTP range requests for efficient streaming:

```bash
curl -H "Range: bytes=0-1023" http://localhost:4000/proxy/videoId.mp4
```

Response: `206 Partial Content`

---

### 4. Health Check

**GET** `/health`

Check if the backend server is running.

#### Request

```bash
curl http://localhost:4000/health
```

#### Response

**Status:** `200 OK`

```json
{
  "status": "ok",
  "timestamp": "2026-02-06T10:30:00.000Z"
}
```

---

### 5. Cleanup Files

**POST** `/cleanup/{fileId}`

Delete uploaded and proxy files for a specific video.

#### Request

**Parameters:**
| Parameter | Type | Location | Description |
|-----------|------|----------|-------------|
| `fileId` | string | URL path | Video file ID to cleanup |

**cURL Example:**
```bash
curl -X POST http://localhost:4000/cleanup/1707200400000-a1b2c3d4e5
```

#### Response

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "Files cleaned up"
}
```

#### Error Responses

**Status:** `500 Internal Server Error`
```json
{
  "error": "Cleanup failed"
}
```

---

## Data Types

### Annotation Object

```json
{
  "id": "shape-1707200401234",
  "label": "Car_1",
  "frame": 150,
  "timestamp": "5.000",
  "x": 100,
  "y": 200,
  "width": 150,
  "height": 100
}
```

**Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique annotation ID |
| `label` | string | Class label (e.g., "Car_1") |
| `frame` | number | Frame number where annotation appears |
| `timestamp` | string | Time in seconds (float as string) |
| `x` | number | X coordinate in pixels |
| `y` | number | Y coordinate in pixels |
| `width` | number | Bounding box width |
| `height` | number | Bounding box height |

---

## Request/Response Examples

### Complete Upload Workflow

```javascript
// Step 1: Upload video
async function uploadVideo(file) {
  const formData = new FormData();
  formData.append('video', file);

  const response = await fetch('http://localhost:4000/upload', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) throw new Error('Upload failed');
  return await response.json();
}

// Step 2: Get metadata
async function getMetadata(fileId) {
  const response = await fetch(`http://localhost:4000/metadata/${fileId}`);
  
  if (!response.ok) throw new Error('Metadata fetch failed');
  return await response.json();
}

// Step 3: Stream video
function startStreaming(fileId) {
  const videoUrl = `http://localhost:4000/proxy/${fileId}.mp4`;
  document.querySelector('video').src = videoUrl;
}

// Step 4: Cleanup (optional)
async function cleanup(fileId) {
  const response = await fetch(`http://localhost:4000/cleanup/${fileId}`, {
    method: 'POST'
  });
  
  if (!response.ok) throw new Error('Cleanup failed');
  return await response.json();
}

// Usage
const file = document.getElementById('videoInput').files[0];
const { fileId, proxyUrl } = await uploadVideo(file);
const metadata = await getMetadata(fileId);

console.log('Video loaded:', {
  fps: metadata.fps,
  duration: metadata.duration,
  resolution: `${metadata.width}x${metadata.height}`
});

startStreaming(fileId);
```

---

## Error Handling

### Common HTTP Status Codes

| Status | Description | Example |
|--------|-------------|---------|
| 200 | Success | Video metadata retrieved |
| 206 | Partial Content | Range request accepted |
| 400 | Bad Request | Missing required field |
| 404 | Not Found | FileId doesn't exist |
| 413 | Payload Too Large | File > 5GB |
| 500 | Server Error | FFmpeg crashed |
| 503 | Service Unavailable | Server overloaded |

### Error Response Format

All errors use this format:

```json
{
  "error": "Human readable error message",
  "details": "Technical details (if available)"
}
```

---

## Rate Limiting

Currently no rate limiting. Recommended limits:

- Max concurrent uploads: 3
- Max file size: 5GB
- Max total storage: 100GB (configurable)
- Response timeout: 30 minutes

---

## CORS Headers

All responses include:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

## File Storage Structure

```
backend/
├── uploads/                          # Temporary uploaded files
│   └── 170720...                     # Raw uploaded video (deleted after processing)
├── proxies/                          # Compressed MP4 files
│   └── 1707200400000-a1b2c3d4e5.mp4 # Browser-compatible video
└── metadata/                         # Metadata JSON files
    └── 1707200400000-a1b2c3d4e5.json # Video metadata
```

---

## Performance Considerations

### Request Size Limits

```
Max POST body: 5GB
Max file upload: 5GB
Max URL length: 2048 chars
```

### Connection Requirements

- **Bandwidth:** Minimum 1 Mbps for streaming
- **Latency:** Up to 1000ms (1 second) acceptable
- **Timeout:** 30 minutes for large file processing

### Optimization Tips

1. Use range requests for large videos
2. Implement retry logic for network failures
3. Cache metadata locally
4. Batch processes when possible
5. Monitor disk space during encoding

---

## Development

### Enable Debug Logging

```bash
DEBUG=savetrax:* npm start
```

### Test Endpoints

```bash
# Health check
curl -i http://localhost:4000/health

# Upload test (requires test.mp4)
curl -i -X POST -F "video=@test.mp4" http://localhost:4000/upload

# Get metadata
curl -i http://localhost:4000/metadata/YOUR_FILE_ID
```

---

## Changelog

### Version 2.0 (Current)
- ✅ Support for 5GB+ files
- ✅ Real-time FPS detection
- ✅ Metadata caching
- ✅ Better error messages
- ✅ Cleanup endpoint
- ✅ Health check endpoint

### Version 1.0
- ✅ Basic video upload
- ✅ MP4 conversion
- ✅ Single metadata extraction

---

**Last Updated:** February 2026  
**API Version:** 2.0
