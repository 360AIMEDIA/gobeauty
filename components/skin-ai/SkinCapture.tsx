"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { analyzeImageElement } from "@/lib/skin/cv";
import type { ClientMetrics } from "@/lib/skin/types";
import { METRIC_META } from "@/lib/skin/metrics";
import { METRIC_KEYS } from "@/lib/skin/types";

const MAX_DIM = 1024;

export type PreparedSelfie = {
  base64: string;
  mediaType: "image/jpeg";
  preview: string;
  clientMetrics: ClientMetrics;
};

async function fileToPrepared(file: File): Promise<PreparedSelfie> {
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Could not load the image."));
    el.src = dataUrl;
  });

  const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process the image.");
  ctx.drawImage(img, 0, 0, w, h);
  const out = canvas.toDataURL("image/jpeg", 0.88);

  let clientMetrics: ClientMetrics = {};
  try {
    clientMetrics = analyzeImageElement(img);
  } catch {
    clientMetrics = {};
  }

  return {
    base64: out.split(",")[1] ?? "",
    mediaType: "image/jpeg",
    preview: out,
    clientMetrics,
  };
}

export default function SkinCapture({
  onReady,
  busy,
}: {
  onReady: (selfie: PreparedSelfie) => void;
  busy?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [pending, setPending] = useState<PreparedSelfie | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [mode, setMode] = useState<"upload" | "camera">("upload");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const pickFile = useCallback(async (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setPreparing(true);
    try {
      setPending(await fileToPrepared(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read that image.");
      setPending(null);
    } finally {
      setPreparing(false);
    }
  }, []);

  // Camera controls
  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
      setMode("camera");
    } catch (err) {
      setError(
        err instanceof Error && err.name === "NotAllowedError"
          ? "Camera access denied. Please allow camera permission and try again."
          : "Could not access camera. Make sure your device has a working camera."
      );
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  const takePhoto = useCallback(async () => {
    if (!videoRef.current || isCapturing) return;

    setIsCapturing(true);
    setError(null);

    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      const displayWidth = video.videoWidth || 1280;
      const displayHeight = video.videoHeight || 720;
      canvas.width = displayWidth;
      canvas.height = displayHeight;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("Could not get canvas context");

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
      const blob = await fetch(dataUrl).then((r) => r.blob());
      const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });

      const prepared = await fileToPrepared(file);
      setPending(prepared);
      stopCamera();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to capture photo. Try again.");
    } finally {
      setIsCapturing(false);
    }
  }, [stopCamera, isCapturing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="rounded-3xl border border-line bg-white p-5 shadow-lg sm:p-6">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="user"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void pickFile(f);
          e.target.value = "";
        }}
      />

      {!pending ? (
        <div className="space-y-4">
          {/* Mode tabs */}
          <div className="flex rounded-full bg-surface-soft p-1 text-sm font-medium">
            <button
              type="button"
              onClick={() => {
                setMode("upload");
                stopCamera();
              }}
              className={`flex-1 rounded-full px-6 py-2 transition ${
                mode === "upload"
                  ? "bg-white shadow text-ink"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              📤 Upload
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("camera");
                if (!isCameraActive) void startCamera();
              }}
              className={`flex-1 rounded-full px-6 py-2 transition ${
                mode === "camera"
                  ? "bg-white shadow text-ink"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              📷 Camera
            </button>
          </div>

          {mode === "upload" ? (
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") fileRef.current?.click();
              }}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const f = e.dataTransfer.files?.[0];
                if (f) void pickFile(f);
              }}
              className={`flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
                dragging
                  ? "border-brand-400 bg-brand-50"
                  : "border-line bg-gradient-to-b from-[var(--beauty-blush)] to-white hover:border-brand-300"
              }`}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-md text-3xl" aria-hidden>
                📸
              </div>
              <p className="mt-5 font-display text-2xl text-ink">Upload selfie</p>
              <p className="mt-2 max-w-xs text-[14.5px] text-ink-muted">
                Best with natural daylight, face straight on, no heavy makeup or filters
              </p>
              <span className="mt-6 inline-flex min-h-11 items-center rounded-pill bg-brand-500 px-6 py-2 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(232,90,130,0.28)]">
                {preparing ? "Preparing…" : "Choose from gallery"}
              </span>
            </div>
          ) : (
            <div className="rounded-3xl border border-line bg-white overflow-hidden">
              {!isCameraActive ? (
                <div className="flex min-h-[340px] flex-col items-center justify-center bg-gradient-to-b from-[var(--beauty-blush)] to-white p-8 text-center">
                  <div className="text-6xl mb-6">📷</div>
                  <p className="font-display text-2xl text-ink">Open Camera</p>
                  <p className="mt-3 max-w-[260px] text-ink-muted">
                    Take a well-lit selfie in natural light for the most accurate skin analysis
                  </p>
                  <button
                    onClick={startCamera}
                    className="mt-8 rounded-full bg-brand-500 px-10 py-3.5 text-white font-semibold shadow-lg hover:bg-brand-600 transition text-lg"
                  >
                    Start Camera
                  </button>
                </div>
              ) : (
                <div className="relative bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full aspect-[4/3] object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-64 border-2 border-white/70 rounded-full"></div>
                  </div>
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                    <button
                      onClick={stopCamera}
                      className="rounded-full bg-white/90 px-8 py-3 text-sm font-semibold text-black shadow-xl hover:bg-white transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={takePhoto}
                      disabled={isCapturing}
                      className="rounded-full bg-white px-10 py-3 text-sm font-semibold text-black shadow-2xl hover:scale-105 active:scale-95 transition flex items-center gap-2 disabled:opacity-70"
                    >
                      {isCapturing ? "Capturing..." : "📸 Take Photo"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="relative mx-auto max-w-sm overflow-hidden rounded-2xl bg-surface-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pending.preview}
              alt="Your selfie preview"
              className="mx-auto max-h-[360px] w-full object-contain"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => onReady(pending)}
              className="inline-flex min-h-12 flex-1 items-center justify-center rounded-pill bg-brand-500 px-6 text-[15px] font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
            >
              {busy ? "Analyzing…" : "Analyze my skin"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setPending(null);
                setError(null);
                // If we came from camera, restart it
                if (mode === "camera" && !isCameraActive) {
                  setTimeout(() => startCamera(), 100);
                }
              }}
              className="inline-flex min-h-12 items-center justify-center rounded-pill border border-line bg-white px-7 text-[14px] font-semibold text-ink hover:bg-surface-tint disabled:opacity-60"
            >
              Retake
            </button>
          </div>
          {Object.keys(pending.clientMetrics).length > 0 && (
            <p className="mt-3 text-[12px] text-ink-faint">
              Local texture scan ready ·{" "}
              {METRIC_KEYS.filter((k) => pending.clientMetrics[k] != null)
                .slice(0, 3)
                .map((k) => `${METRIC_META[k].short} ${pending.clientMetrics[k]}`)
                .join(" · ")}
              …
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-[13.5px] text-rose-800" role="alert">
          {error}
        </p>
      )}

      <ul className="mt-6 grid gap-2 text-[12.5px] text-ink-muted sm:grid-cols-2">
        <li className="rounded-xl bg-surface-soft px-3 py-2">✓ Face fills most of the frame</li>
        <li className="rounded-xl bg-surface-soft px-3 py-2">✓ Soft natural daylight recommended</li>
        <li className="rounded-xl bg-surface-soft px-3 py-2">✓ No heavy makeup, filters, or glasses</li>
        <li className="rounded-xl bg-surface-soft px-3 py-2">✓ Look straight at camera with neutral expression</li>
      </ul>
    </div>
  );
}
