export const videoFormat = [".mp4", ".mov", ".mkv", ".avi", ".flv", ".webm"];

// react-dropzone requires explicit MIME types as keys (not "video/*" wildcard)
export const acceptedVideoFiles = {
  "video/mp4":       [".mp4"],
  "video/quicktime": [".mov"],
  "video/x-matroska":[".mkv"],
  "video/x-msvideo": [".avi"],
  "video/x-flv":     [".flv"],
  "video/webm":      [".webm"],
};
