import { getFileExtension } from "./convert";
import { VideoFormats, VideoInputSettings } from "./types";

export const whatsappStatusCompressionCommand = (
  input: string,
  output: string
) => [
  "-i",
  input,
  "-c:v",
  "libx264",
  "-preset",
  "veryfast",
  "-crf",
  "35",
  "-vf",
  "scale=-2:min(480\\,ih)",  // cap at 480p for WhatsApp (9MB limit)
  "-c:a",
  "aac",
  "-b:a",
  "64k",
  "-movflags",
  "faststart",
  "-maxrate",
  "1000k",
  "-bufsize",
  "1000k",
  "-fs",
  "9M",
  output,
];

export const twitterCompressionCommand = (input: string, output: string) => [
  "-i",
  input,
  "-c:v",
  "libx264",
  "-profile:v",
  "high",
  "-level:v",
  "4.2",
  "-pix_fmt",
  "yuv420p",
  "-vf",
  "scale=-2:min(720\\,ih)",  // cap at 720p for Twitter
  "-r",
  "30",
  "-c:a",
  "aac",
  "-b:a",
  "192k",
  "-movflags",
  "faststart",
  "-maxrate",
  "5000k",
  "-bufsize",
  "5000k",
  "-tune",
  "film",
  output,
];

export const customVideoCompressionCommand = (
  input: string,
  output: string,
  videoSettings: VideoInputSettings
): string[] => {
  const inputType = getFileExtension(input);
  if (inputType === "mp4") return getMP4toMP4Command(input, output, videoSettings);

  switch (videoSettings.videoType) {
    case VideoFormats.MP4:
      return getMP4Command(input, output, videoSettings);
    case VideoFormats.AVI:
      return getAVICommand(input, output, videoSettings);
    case VideoFormats.MKV:
      return getMKVCommand(input, output, videoSettings);
    case VideoFormats.MOV:
      return getMOVCommand(input, output, videoSettings);
    case VideoFormats.FLV:
      return getFLVCommand(input, output, videoSettings);
    default:
      return ["-i", input, output];
  }
};

// Fix: was ignoring videoSettings (quality/trim) for MP4→MP4 and had no -vf scale
const getMP4toMP4Command = (
  input: string,
  output: string,
  videoSettings: VideoInputSettings
) => {
  const ffmpegCommand: string[] = [
    "-i",
    input,
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    videoSettings.quality,  // use selected quality (High=15, Medium=18, Low=20)
    "-vf",
    "scale=-2:min(720\\,ih)",  // cap at 720p, never upscale, keep aspect ratio
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "faststart",
  ];

  // Only add trim if the user actually trimmed (start > 0 or end < duration)
  if (videoSettings.customStartTime > 0) {
    ffmpegCommand.push("-ss", videoSettings.customStartTime.toString());
  }
  if (videoSettings.customEndTime > 0) {
    ffmpegCommand.push("-to", videoSettings.customEndTime.toString());
  }

  if (!videoSettings.removeAudio) {
    ffmpegCommand.push("-c:a", "aac", "-b:a", "128k");
  } else {
    ffmpegCommand.push("-an");
  }

  ffmpegCommand.push(output);
  return ffmpegCommand;
};

const getMP4Command = (
  input: string,
  output: string,
  videoSettings: VideoInputSettings
) => {
  const ffmpegCommand: string[] = [
    "-i",
    input,
    "-c:v",
    "libx264",
    "-profile:v",
    "high",
    "-level:v",
    "4.2",
    "-pix_fmt",
    "yuv420p",
    "-vf",
    "scale=-2:min(720\\,ih)",
    "-r",
    "30",
    "-maxrate",
    "5000k",
    "-bufsize",
    "5000k",
    "-tune",
    "film",
    "-crf",
    videoSettings.quality,
    "-preset",
    "veryfast",
  ];

  // Only trim if user actually set trim points
  if (videoSettings.customStartTime > 0) {
    ffmpegCommand.push("-ss", videoSettings.customStartTime.toString());
  }
  if (videoSettings.customEndTime > 0) {
    ffmpegCommand.push("-to", videoSettings.customEndTime.toString());
  }

  if (!videoSettings.removeAudio) {
    ffmpegCommand.push("-c:a", "aac", "-b:a", "192k", "-movflags", "faststart");
  } else {
    ffmpegCommand.push("-an");
  }
  ffmpegCommand.push(output);

  return ffmpegCommand;
};

const getMOVCommand = (
  input: string,
  output: string,
  videoSettings: VideoInputSettings
) => {
  const audioOptions = videoSettings.removeAudio ? ["-an"] : ["-c:a", "aac", "-b:a", "128k"];
  const ffmpegCommand: string[] = [
    "-i",
    input,
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    videoSettings.quality,
    "-vf",
    "scale=-2:min(720\\,ih)",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "faststart",
    ...audioOptions,
  ];

  if (videoSettings.customStartTime > 0) {
    ffmpegCommand.push("-ss", videoSettings.customStartTime.toString());
  }
  if (videoSettings.customEndTime > 0) {
    ffmpegCommand.push("-to", videoSettings.customEndTime.toString());
  }

  ffmpegCommand.push(output);
  return ffmpegCommand;
};

const getMKVCommand = (
  input: string,
  output: string,
  videoSettings: VideoInputSettings
) => {
  const audioOptions = videoSettings.removeAudio ? ["-an"] : ["-c:a", "aac", "-b:a", "128k"];
  const ffmpegCommand: string[] = [
    "-i",
    input,
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    videoSettings.quality,
    "-vf",
    "scale=-2:min(720\\,ih)",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "faststart",
    ...audioOptions,
  ];

  if (videoSettings.customStartTime > 0) {
    ffmpegCommand.push("-ss", videoSettings.customStartTime.toString());
  }
  if (videoSettings.customEndTime > 0) {
    ffmpegCommand.push("-to", videoSettings.customEndTime.toString());
  }

  ffmpegCommand.push(output);
  return ffmpegCommand;
};

const getAVICommand = (
  input: string,
  output: string,
  videoSettings: VideoInputSettings
) => {
  const audioOptions = videoSettings.removeAudio ? ["-an"] : ["-c:a", "aac", "-b:a", "128k"];
  const ffmpegCommand: string[] = [
    "-i",
    input,
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    videoSettings.quality,
    "-vf",
    "scale=-2:min(720\\,ih)",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "faststart",
    ...audioOptions,
  ];

  if (videoSettings.customStartTime > 0) {
    ffmpegCommand.push("-ss", videoSettings.customStartTime.toString());
  }
  if (videoSettings.customEndTime > 0) {
    ffmpegCommand.push("-to", videoSettings.customEndTime.toString());
  }

  ffmpegCommand.push(output);
  return ffmpegCommand;
};

const getFLVCommand = (
  input: string,
  output: string,
  videoSettings: VideoInputSettings
) => {
  const audioOptions = videoSettings.removeAudio ? ["-an"] : ["-c:a", "aac", "-b:a", "128k"];
  const ffmpegCommand: string[] = [
    "-i",
    input,
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    videoSettings.quality,
    "-vf",
    "scale=-2:min(720\\,ih)",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "faststart",
    ...audioOptions,
  ];

  if (videoSettings.customStartTime > 0) {
    ffmpegCommand.push("-ss", videoSettings.customStartTime.toString());
  }
  if (videoSettings.customEndTime > 0) {
    ffmpegCommand.push("-to", videoSettings.customEndTime.toString());
  }

  ffmpegCommand.push(output);
  return ffmpegCommand;
};
