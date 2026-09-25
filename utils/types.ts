export type FileActions = {
  file: File;
  fileName: string;
  fileSize: number;
  from: string;
  fileType: string;
  isError?: boolean;
  url?: string;
  output?: string;
  outputBlob?: Blob;
};

export enum QualityType {
  High = "23",    // Good quality, reasonable file size (default)
  Medium = "28",  // Balanced — noticeable compression
  Low = "35",     // Aggressive compression, smaller file
}

export enum VideoFormats {
  MP4 = "mp4",
  MKV = "mkv",
  MOV = "mov",
  AVI = "avi",
  FLV = "flv",
  WEBM = "webm",
}

export type VideoInputSettings = {
  quality: QualityType;
  videoType: VideoFormats;
  customEndTime: number;
  customStartTime: number;
  removeAudio: boolean;
  twitterCompressionCommand: boolean;
  whatsappStatusCompressionCommand: boolean;
};
