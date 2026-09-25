# [Compressify](https://github.com/sohamnandi77/compressify) &middot; [![Author Soham](https://img.shields.io/badge/Author-Soham-%3C%3E)](https://www.sohamnandi.com)

## Overview

This project is a web-based video compression tool built using **FFmpeg.wasm** and **Next.js**. It allows users to upload video files, compress them in the browser, and download the compressed versions without needing server-side processing. The project leverages the power of **FFmpeg**, a popular multimedia framework, compiled to WebAssembly (Wasm) to enable video processing directly in the browser.

The frontend is built with **Next.js**, a React framework that provides server-side rendering, static site generation, and API routes, making it a perfect fit for this project. The combination of FFmpeg.wasm and Next.js ensures a seamless user experience with fast, client-side video compression.

[Live Demo](https://compressify.sohamnandi.com/)

![Demo](https://compressify.sohamnandi.com/compressify-demo.gif)

---

## Features

1. **Video Upload**: Users can upload video files in various formats (e.g., MP4, AVI, MOV).
2. **Compression Settings**: Users can adjust compression parameters such as resolution, bitrate, and output format.
3. **Client-Side Processing**: Video compression is performed entirely in the browser using FFmpeg.wasm, ensuring privacy and reducing server load.
4. **Real-Time Progress**: The compression progress is displayed in real-time using a progress bar.
5. **Download Compressed Video**: Users can download the compressed video file after processing.
6. **Responsive Design**: The application is fully responsive and works on both desktop and mobile devices.

---

## Technologies Used

- **FFmpeg.wasm**: A WebAssembly port of FFmpeg for video processing in the browser.
- **Next.js**: A React framework for building server-rendered and static web applications.
- **React**: A JavaScript library for building user interfaces.
- **Tailwind CSS**: A utility-first CSS framework for styling the application.
- **File API**: For handling file uploads and downloads in the browser.
- **Web Workers**: To run FFmpeg.wasm in a separate thread and avoid blocking the main thread.

---

## How It Works

1. **File Upload**: The user selects a video file using the file input. The file is read using the File API and passed to FFmpeg.wasm.
2. **FFmpeg.wasm Setup**: FFmpeg.wasm is initialized in a Web Worker to avoid blocking the main thread. The video file is loaded into FFmpeg.
3. **Compression**: FFmpeg processes the video based on user-defined settings (e.g., resolution, bitrate). The progress is tracked and displayed in real-time.
4. **Output**: Once compression is complete, the processed video is saved as a new file and made available for download.

---

## Limitations

1. **Browser Support**: FFmpeg.wasm relies on WebAssembly, which may not be supported in older browsers.
2. **Performance**: Video compression can be resource-intensive and may cause performance issues on low-end devices.
3. **File Size**: Large video files may take longer to process and could exceed browser memory limits.

---

Enjoy compressing videos with ease! 🎥✨
