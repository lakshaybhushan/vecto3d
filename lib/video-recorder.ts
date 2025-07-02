import { toast } from "sonner";

export interface RecordingOptions {
  duration?: number;
  fps?: number;
  format: "mp4" | "gif";
  quality?: number;
  onProgress?: (progress: number, elapsedTime: number) => void;
}

export interface RecordingControls {
  start: () => Promise<void>;
  stop: () => Promise<Blob | null>;
  pause: () => void;
  resume: () => void;
  isRecording: boolean;
  isPaused: boolean;
}

export class VideoRecorder {
  private canvas: HTMLCanvasElement;
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private options: RecordingOptions;
  private _isRecording = false;
  private _isPaused = false;
  private recordingStartTime = 0;
  private animationId: number | null = null;
  private progressInterval: NodeJS.Timeout | null = null;

  constructor(canvas: HTMLCanvasElement, options: RecordingOptions) {
    this.canvas = canvas;
    this.options = {
      fps: options.format === "gif" ? 15 : 60,
      quality: 0.8,
      ...options,
    };
  }

  get isRecording(): boolean {
    return this._isRecording;
  }

  get isPaused(): boolean {
    return this._isPaused;
  }

  async start(): Promise<void> {
    if (this._isRecording) {
      throw new Error("Recording is already in progress");
    }

    try {
      this.chunks = [];
      this._isRecording = true;
      this._isPaused = false;
      this.recordingStartTime = Date.now();

      if (this.options.format === "mp4") {
        await this.startMP4Recording();
      } else {
        await this.startGIFRecording();
      }

      // Start progress tracking
      this.startProgressTracking();

      console.log(`Started recording ${this.options.format.toUpperCase()}`);
    } catch (error) {
      this._isRecording = false;
      throw error;
    }
  }

  private async startMP4Recording(): Promise<void> {
    try {
      this.stream = this.canvas.captureStream(this.options.fps);

      const mimeType = this.getSupportedMimeType();
      console.log("Starting MP4 recording with mimeType:", mimeType);

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType,
        videoBitsPerSecond: 2500000,
      });

      this.mediaRecorder.ondataavailable = (event) => {
        console.log("Data available:", event.data.size, "bytes");
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      this.mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
      };

      this.mediaRecorder.onstart = () => {
        console.log("MediaRecorder started");
      };

      this.mediaRecorder.onstop = () => {
        console.log("MediaRecorder stopped, chunks:", this.chunks.length);
      };

      // Start recording with shorter timeslice for more frequent data events
      this.mediaRecorder.start(250);
    } catch (error) {
      throw new Error(`Failed to start MP4 recording: ${error}`);
    }
  }

  private async startGIFRecording(): Promise<void> {
    const frameInterval = 1000 / (this.options.fps || 30);
    let lastFrameTime = 0;

    const captureFrame = (timestamp: number) => {
      if (!this._isRecording) return;

      if (timestamp - lastFrameTime >= frameInterval) {
        this.canvas.toBlob(
          (blob) => {
            if (blob && !this._isPaused) {
              this.chunks.push(blob);
            }
          },
          "image/png",
          this.options.quality,
        );

        lastFrameTime = timestamp;
      }

      this.animationId = requestAnimationFrame(captureFrame);
    };

    this.animationId = requestAnimationFrame(captureFrame);
  }

  private startProgressTracking(): void {
    if (!this.options.duration || !this.options.onProgress) return;

    this.progressInterval = setInterval(() => {
      if (!this._isRecording) return;

      const elapsedTime = (Date.now() - this.recordingStartTime) / 1000;
      const progress = Math.min(
        (elapsedTime / this.options.duration!) * 100,
        100,
      );

      this.options.onProgress!(progress, elapsedTime);
    }, 100);
  }

  pause(): void {
    if (!this._isRecording) return;

    this._isPaused = true;
    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      this.mediaRecorder.pause();
    }
  }

  resume(): void {
    if (!this._isRecording || !this._isPaused) return;

    this._isPaused = false;
    if (this.mediaRecorder && this.mediaRecorder.state === "paused") {
      this.mediaRecorder.resume();
    }
  }

  async stop(): Promise<Blob | null> {
    if (!this._isRecording) {
      return null;
    }

    this._isRecording = false;
    this._isPaused = false;

    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    if (this.options.format === "mp4") {
      return this.stopMP4Recording();
    } else {
      return this.stopGIFRecording();
    }
  }

  private async stopMP4Recording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        console.error("No mediaRecorder available");
        resolve(null);
        return;
      }

      // Set up the stop handler before stopping
      this.mediaRecorder.onstop = () => {
        console.log("Stop event fired, chunks length:", this.chunks.length);

        if (this.chunks.length === 0) {
          console.error("No chunks collected");
          this.cleanup();
          resolve(null);
          return;
        }

        const mimeType = this.getSupportedMimeType();
        let blob = new Blob(this.chunks, { type: mimeType });

        console.log("Created blob:", {
          size: blob.size,
          type: blob.type,
          chunks: this.chunks.length,
        });

        // Try to create a proper MP4 blob if possible
        if (mimeType.includes("mp4")) {
          blob = new Blob(this.chunks, { type: "video/mp4" });
        } else if (mimeType.includes("webm")) {
          // Keep as WebM but with clear type
          blob = new Blob(this.chunks, { type: "video/webm" });
        }

        this.cleanup();
        resolve(blob);
      };

      // Check MediaRecorder state before stopping
      console.log("MediaRecorder state before stop:", this.mediaRecorder.state);

      if (this.mediaRecorder.state === "recording") {
        this.mediaRecorder.stop();
      } else {
        console.warn(
          "MediaRecorder not in recording state:",
          this.mediaRecorder.state,
        );
        resolve(null);
      }
    });
  }

  private async stopGIFRecording(): Promise<Blob | null> {
    if (this.chunks.length === 0) {
      this.cleanup();
      return null;
    }

    try {
      const gif = await this.createGIFFromFrames(this.chunks);
      this.cleanup();
      return gif;
    } catch (error) {
      console.error("Failed to create GIF:", error);
      this.cleanup();
      throw error;
    }
  }

  private async createGIFFromFrames(frames: Blob[]): Promise<Blob> {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not get canvas context for GIF creation");
    }

    const GIF = (await import("gif.js")).default;

    canvas.width = this.canvas.width;
    canvas.height = this.canvas.height;

    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: canvas.width,
      height: canvas.height,
      workerScript: "/gif.worker.js",
    });

    const delay = Math.round(1000 / (this.options.fps || 30));

    for (const frameBlob of frames) {
      const img = new Image();
      const imageUrl = URL.createObjectURL(frameBlob);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          gif.addFrame(canvas, { delay, copy: true });
          URL.revokeObjectURL(imageUrl);
          resolve();
        };
        img.onerror = reject;
        img.src = imageUrl;
      });
    }

    return new Promise((resolve, reject) => {
      gif.on("finished", (blob: Blob) => resolve(blob));
      gif.on("abort", reject);
      gif.render();
    });
  }

  private getSupportedMimeType(): string {
    const types = [
      "video/mp4;codecs=h264",
      "video/mp4",
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return "video/webm";
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    this.mediaRecorder = null;
    this.chunks = [];
  }

  destroy(): void {
    this.cleanup();
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }
}

export function createRecorderControls(
  canvas: HTMLCanvasElement,
  options: RecordingOptions,
): RecordingControls {
  const recorder = new VideoRecorder(canvas, options);

  return {
    start: () => recorder.start(),
    stop: () => recorder.stop(),
    pause: () => recorder.pause(),
    resume: () => recorder.resume(),
    get isRecording() {
      return recorder.isRecording;
    },
    get isPaused() {
      return recorder.isPaused;
    },
  };
}

export function downloadRecording(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

// Toast-based recording functions
export interface ToastRecordingOptions {
  canvas: HTMLCanvasElement;
  format: "mp4" | "gif";
  duration: number;
  onComplete?: (blob: Blob) => void;
  onError?: (error: Error) => void;
}

export async function recordWithToastProgress({
  canvas,
  format,
  duration,
  onComplete,
  onError,
}: ToastRecordingOptions): Promise<void> {
  let toastId: string | number;
  let recorder: VideoRecorder;

  try {
    // Create initial progress toast
    toastId = toast.loading(`Recording ${format.toUpperCase()} - 0.0s`, {
      duration: Infinity,
      dismissible: false,
    });

    recorder = new VideoRecorder(canvas, {
      format,
      fps: format === "gif" ? 15 : 60,
      quality: format === "gif" ? 0.8 : 0.9,
      duration,
      onProgress: (progress, elapsedTime) => {
        const progressText = `Recording ${format.toUpperCase()} - ${elapsedTime.toFixed(1)}s (${progress.toFixed(0)}%)`;
        toast.loading(progressText, {
          id: toastId,
          duration: Infinity,
          dismissible: false,
        });
      },
    });

    await recorder.start();

    // Auto-stop after duration with a small buffer
    setTimeout(
      async () => {
        try {
          // Update toast to processing
          toast.loading(`Processing ${format.toUpperCase()}...`, {
            id: toastId,
            duration: Infinity,
            dismissible: false,
          });

          // Add a small delay to ensure recording has data
          await new Promise((resolve) => setTimeout(resolve, 200));

          const blob = await recorder.stop();

          if (blob && blob.size > 0) {
            // Success toast
            toast.success(
              `Recording completed! (${(blob.size / 1024 / 1024).toFixed(2)} MB)`,
              { id: toastId, duration: 4000 },
            );
            onComplete?.(blob);
          } else {
            console.error("Recording failed: blob is null or empty", {
              blob,
              size: blob?.size,
            });
            throw new Error("Recording failed - no data captured");
          }
        } catch (error) {
          console.error("Recording error:", error);
          toast.error("Recording failed", { id: toastId, duration: 4000 });
          onError?.(error as Error);
        }
      },
      duration * 1000 + 100,
    ); // Add 100ms buffer
  } catch (error) {
    console.error("Failed to start recording:", error);
    toast.error("Failed to start recording", { id: toastId! });
    onError?.(error as Error);
  }
}
