/**
 * Export annotations to CSV with metadata
 */
export const exportToCSV = (data, metadata = {}) => {
  const { fps = 30, duration = 0, totalFrames = 0, videoWidth = 0, videoHeight = 0 } = metadata;
  
  const headers = ["Label", "Frame", "Timestamp", "X", "Y", "Width", "Height", "FPS", "TotalFrames", "VideoWidth", "VideoHeight"];
  const rows = data.map(item => [
    item.label,
    item.frame,
    item.timestamp,
    item.x,
    item.y,
    item.w || item.width,
    item.h || item.height,
    fps.toFixed(2),
    totalFrames,
    videoWidth,
    videoHeight
  ]);

  const csvContent = "data:text/csv;charset=utf-8," 
    + [headers, ...rows].map(e => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `annotations_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export annotations to JSON with full metadata
 */
export const exportToJSON = (data, metadata = {}) => {
  const output = {
    metadata: {
      exportDate: new Date().toISOString(),
      ...metadata,
      annotationCount: data.length
    },
    annotations: data
  };

  const jsonString = JSON.stringify(output, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `annotations_${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Calculate FPS from video
 */
export const calculateFPS = (duration, totalFrames) => {
  return totalFrames / duration;
};

/**
 * Convert frame number to timestamp
 */
export const frameToTime = (frame, fps) => {
  if (!fps || fps <= 0) return 0;
  return frame / fps;
};

/**
 * Convert timestamp to frame number
 */
export const timeToFrame = (time, fps) => {
  if (!fps || fps <= 0) return 0;
  return Math.round(time * fps);
};

/**
 * Validate annotation rect
 */
export const isValidRect = (rect, minSize = 5) => {
  return rect && rect.width > minSize && rect.height > minSize;
};

/**
 * Scale annotation to original video dimensions
 */
export const scaleAnnotationToOriginal = (annotation, scale) => {
  return {
    ...annotation,
    x: Math.round(annotation.x * scale),
    y: Math.round(annotation.y * scale),
    width: Math.round(annotation.width * scale),
    height: Math.round(annotation.height * scale)
  };
};