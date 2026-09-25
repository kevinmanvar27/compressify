import { FFmpeg } from "@ffmpeg/ffmpeg";
import { FileActions, VideoInputSettings } from "./types";
import { fetchFile } from "@ffmpeg/util";
import {
  customVideoCompressionCommand,
  twitterCompressionCommand,
  whatsappStatusCompressionCommand,
} from "./ffmpegCommands";

export function getFileExtension(fileName: string) {
  const regex = /(?:\.([^.]+))?$/;
  const match = regex.exec(fileName);
  if (match && match[1]) {
    return match[1];
  }

  return "";
}

function removeFileExtension(fileName: string) {
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex !== -1) {
    return fileName.slice(0, lastDotIndex);
  }
  return fileName;
}

export default async function convertFile(
  ffmpeg: FFmpeg,
  actionFile: FileActions,
  videoSettings: VideoInputSettings
): Promise<{
  url: string;
  output: string;
  outputBlob: Blob;
}> {
  const { file, fileName, fileType } = actionFile;
  // Prefix output with "compressed_" to avoid input/output filename collision
  // e.g. "video.mp4" → input: "video.mp4", output: "compressed_video.mp4"
  const output = "compressed_" + removeFileExtension(fileName) + "." + videoSettings.videoType;
  ffmpeg.writeFile(fileName, await fetchFile(file));
  const command = videoSettings.twitterCompressionCommand
    ? twitterCompressionCommand(fileName, output)
    : videoSettings.whatsappStatusCompressionCommand
    ? whatsappStatusCompressionCommand(fileName, output)
    : customVideoCompressionCommand(fileName, output, videoSettings);

  console.log(command.join(" "));
  await ffmpeg.exec(command);
  const data = await ffmpeg.readFile(output);
  // Use the correct full MIME type (e.g. "video/mp4"), not just "video"
  const outputMime = `video/${videoSettings.videoType}`;
  // Handle FileData type (Uint8Array | string) - convert to proper Uint8Array for Blob
  const uint8Data = typeof data === 'string' 
    ? new TextEncoder().encode(data) 
    : new Uint8Array(data);
  const blob = new Blob([uint8Data], { type: outputMime });
  const url = URL.createObjectURL(blob);
  return { url, output, outputBlob: blob };
}

export const formatTime = (seconds: number): string => {
  seconds = Math.round(seconds);

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  let formattedTime = "";

  if (hours > 0) {
    formattedTime += hours + "hr";
    if (minutes > 0 || remainingSeconds > 0) {
      formattedTime += " ";
    }
  }

  if (minutes > 0) {
    formattedTime += `${minutes.toString()} min`;
    if (remainingSeconds > 0) {
      formattedTime += " ";
    }
  }

  if (remainingSeconds > 0 || formattedTime === "") {
    formattedTime += `${remainingSeconds} sec`;
  }

  return formattedTime;
};
