"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CustomDropZone } from "./custom-dropzone";
import { acceptedVideoFiles } from "@/utils/formats";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FileActions,
  QualityType,
  VideoFormats,
  VideoInputSettings,
} from "@/utils/types";
import { VideoDisplay } from "./video-display";
import { VideoInputDetails } from "./video-input-details";
import { VideoTrim } from "./video-trim";
import { VideoInputControl } from "./video-input-control";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { toast } from "sonner";
import convertFile from "@/utils/convert";
import { VideoCompressProgress } from "./video-compress-progress";
import { VideoOutputDetails } from "./video-output-details";

const CompressVideo = () => {
  const [videoFile, setVideoFile] = useState<FileActions>();
  const [progress, setProgress] = useState<number>(0);
  const [time, setTime] = useState<{
    startTime?: Date;
    elapsedSeconds?: number;
  }>({ elapsedSeconds: 0 });
  const [status, setStatus] = useState<
    "notStarted" | "converted" | "compressing"
  >("notStarted");
  const [videoSettings, setVideoSettings] = useState<VideoInputSettings>({
    quality: QualityType.High,
    videoType: VideoFormats.MP4,
    customEndTime: 0,
    customStartTime: 0,
    removeAudio: false,
    twitterCompressionCommand: false,
    whatsappStatusCompressionCommand: false,
  });

  const handleUpload = (file: File) => {
    setVideoFile({
      fileName: file.name,
      fileSize: file.size,
      from: file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2),
      fileType: file.type,
      file,
      isError: false,
    });
  };

  // ── Elapsed timer ────────────────────────────────────────────────────────
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (time?.startTime) {
      timer = setInterval(() => {
        const timeDifference = new Date().getTime() - time.startTime!.getTime();
        setTime((prev) => ({ ...prev, elapsedSeconds: timeDifference }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [time?.startTime]);

  // ── FFmpeg: create a NEW instance per compression so WASM memory is fresh ─
  // Using a ref to track whether FFmpeg is currently loaded
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const isLoadedRef = useRef(false);

  const createFreshFFmpeg = useCallback(async (): Promise<FFmpeg> => {
    // Always create a brand-new FFmpeg instance to avoid WASM memory issues
    const ffmpeg = new FFmpeg();

    await ffmpeg.load({
      coreURL: await toBlobURL(
        `${process.env.NEXT_PUBLIC_APP_URL}/download/ffmpeg-core.js`,
        "text/javascript"
      ),
      wasmURL: await toBlobURL(
        `${process.env.NEXT_PUBLIC_APP_URL}/download/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });

    return ffmpeg;
  }, []);

  // ── Pre-load FFmpeg on mount (for faster first compress) ─────────────────
  const load = useCallback(async () => {
    if (isLoadedRef.current) return;
    const ffmpeg = new FFmpeg();
    await ffmpeg.load({
      coreURL: await toBlobURL(
        `${process.env.NEXT_PUBLIC_APP_URL}/download/ffmpeg-core.js`,
        "text/javascript"
      ),
      wasmURL: await toBlobURL(
        `${process.env.NEXT_PUBLIC_APP_URL}/download/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });
    ffmpegRef.current = ffmpeg;
    isLoadedRef.current = true;
  }, []);

  useEffect(() => {
    toast.promise(load(), {
      loading: "Loading FFmpeg packages…",
      success: "FFmpeg ready",
      error: "Error loading FFmpeg packages",
    });
  }, [load]);

  const disableDuringCompression = status === "compressing";

  // ── Compress ─────────────────────────────────────────────────────────────
  const compress = async () => {
    if (!videoFile) return;

    try {
      setTime({ startTime: new Date(), elapsedSeconds: 0 });
      setStatus("compressing");

      // Always create a fresh FFmpeg instance — prevents WASM memory crash
      // on second/third compress and eliminates duplicate log listeners
      const ffmpeg = await createFreshFFmpeg();

      // Single listener per instance — no stacking
      ffmpeg.on("progress", ({ progress: completion }) => {
        setProgress(Math.round(completion * 100));
      });

      const { url, output, outputBlob } = await convertFile(
        ffmpeg,
        videoFile,
        videoSettings
      );

      setVideoFile({ ...videoFile, url, output, outputBlob });
      setTime((prev) => ({ ...prev, startTime: undefined }));
      setStatus("converted");
      setProgress(0);

    } catch (err) {
      console.error("Compression error:", err);
      setStatus("notStarted");
      setProgress(0);
      setTime({ elapsedSeconds: 0, startTime: undefined });
      toast.error("Error compressing video");
    }
  };

  return (
    <>
      <motion.div
        layout
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        key={"drag"}
        transition={{ type: "tween" }}
        className="border rounded-3xl col-span-5 flex w-full md:h-full bg-gray-50/35"
      >
        {videoFile ? (
          <VideoDisplay videoUrl={URL.createObjectURL(videoFile.file)} />
        ) : (
          <CustomDropZone
            handleUpload={handleUpload}
            acceptedFiles={acceptedVideoFiles}
          />
        )}
      </motion.div>

      <AnimatePresence mode="popLayout">
        <motion.div className="border rounded-3xl col-span-3 flex w-full md:h-full bg-gray-50/35 p-4 relative">
          <div className="flex flex-col gap-4 w-full">
            {videoFile && (
              <>
                <VideoInputDetails
                  videoFile={videoFile}
                  onClear={() => window.location.reload()}
                />
                <VideoTrim
                  disable={disableDuringCompression}
                  onVideoSettingsChange={setVideoSettings}
                  videoSettings={videoSettings}
                />
              </>
            )}

            <VideoInputControl
              disable={disableDuringCompression}
              onVideoSettingsChange={setVideoSettings}
              videoSettings={videoSettings}
            />

            <motion.div
              layout
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              key={"button"}
              transition={{ type: "tween" }}
              className="bg-gray-100 border-gray-200 rounded-2xl p-3 h-fit"
            >
              {status === "compressing" && (
                <VideoCompressProgress
                  progress={progress}
                  seconds={time.elapsedSeconds!}
                />
              )}

              {(status === "notStarted" || status === "converted") && (
                <button
                  onClick={compress}
                  type="button"
                  className="bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-zinc-700 via-zinc-950 to-zinc-950 rounded-lg text-white/90 relative px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition ease-in-out duration-500 focus:ring-zinc-950 flex-shrink-0"
                >
                  {status === "converted" ? "Compress Again" : "Compress"}
                </button>
              )}
            </motion.div>

            {status === "converted" && videoFile && (
              <VideoOutputDetails
                timeTaken={time.elapsedSeconds}
                videoFile={videoFile}
              />
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default CompressVideo;
