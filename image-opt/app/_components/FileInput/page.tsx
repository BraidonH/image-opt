/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";

const IMAGE_CONTAINER_CLASS =
  "relative w-full min-w-[280px] sm:min-w-[320px] lg:min-w-[280px] max-w-[280px] sm:max-w-[320px] lg:max-w-[280px] aspect-square mx-auto overflow-hidden rounded-lg bg-slate-900/50";

function ImageWithPlaceholder({
  src,
  alt,
  imageRef,
  unoptimized,
}: {
  src: string;
  alt: string;
  imageRef?: React.RefObject<HTMLImageElement | null>;
  unoptimized?: boolean;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={IMAGE_CONTAINER_CLASS}>
      {!isLoaded && (
        <div
          className="absolute inset-0 animate-pulse bg-slate-700/50"
          aria-hidden
        />
      )}
      <Image
        ref={imageRef}
        crossOrigin="anonymous"
        unoptimized={unoptimized}
        src={src}
        alt={alt}
        width={330}
        height={330}
        className={`w-full h-full object-contain transition-opacity duration-200 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}

export default function FileInput() {
  const inputRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);
  const imageRef = useRef<any>(null);
  const rangeRef = useRef<any>(null);

  const [file, setFile] = useState<any>(null);
  const [compressedFile, setCompressedFile] = useState<any>(null);
  const [compressedFileSize, setCompressedFileSize] = useState<any>(null);
  const [fileSize, setFileSize] = useState<any>(null);
  const [compression, setCompression] = useState<any>(0.5);
  const [uploading, setUploading] = useState<any>(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const convertImage = useCallback(() => {
    if (canvasRef.current == null || imageRef.current == null) return;
    setIsConverting(true);

    const img = imageRef.current;
    const ctx = canvasRef.current.getContext("2d");
    const quality = parseFloat(compression);

    const runConversion = () => {
      canvasRef.current.height = img.naturalHeight;
      canvasRef.current.width = img.naturalWidth;
      ctx.drawImage(img, 0, 0);
      canvasRef.current.toBlob(
        (blob: any) => {
          const fr = new FileReader();
          fr.readAsDataURL(blob);
          fr.onloadend = () => {
            setCompressedFile(fr.result);
            setCompressedFileSize(blob.size);
            setIsConverting(false);
          };
        },
        "image/webp",
        quality
      );
    };

    if (img.complete && img.naturalWidth > 0) {
      runConversion();
    } else {
      setIsConverting(true);
      img.onload = runConversion;
    }
  }, [compression]);

  useEffect(() => {
    convertImage();
  }, [file, convertImage]);

  const uploadFile = (fileObj: File | null) => {
    if (!fileObj) return;
    if (compressedFile) {
      setCompressedFile(null);
    }
    setUploading(true);
    const url = URL.createObjectURL(fileObj);
    setFile(url);
    setFileSize(fileObj.size);
  };

  function triggerReconvert() {
    setCompressedFile(null);
    setCompressedFileSize(null);
  }

  function adjustCompression(value?: string) {
    const raw = value ?? rangeRef.current?.value ?? compression;
    const num = parseFloat(raw);
    const clamped = isNaN(num)
      ? 0.5
      : Math.min(0.9, Math.max(0.1, num > 1 ? num / 100 : num));
    setCompression(clamped.toString());
    setManualInputValue(null);
    if (compressedFile) triggerReconvert();
  }

  const [manualInputValue, setManualInputValue] = useState<string | null>(null);

  function handleManualQualityChange(e: React.ChangeEvent<HTMLInputElement>) {
    setManualInputValue(e.target.value);
  }

  function applyManualQuality() {
    const raw = manualInputValue ?? "";
    setManualInputValue(null);
    if (raw === "" || raw === "-") {
      setCompression("0.5");
      if (compressedFile) triggerReconvert();
    } else {
      const num = parseFloat(raw);
      const clamped = isNaN(num)
        ? 0.5
        : Math.min(90, Math.max(10, num)) / 100;
      setCompression(clamped.toString());
      if (compressedFile) triggerReconvert();
    }
  }

  const applyButtonRef = useRef<HTMLButtonElement>(null);

  function handleManualQualityBlur(e: React.FocusEvent<HTMLInputElement>) {
    if (e.relatedTarget === applyButtonRef.current) return;
    applyManualQuality();
  }

  function handleManualQualityKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  }

  function DropFiles(event: any) {
    event.preventDefault();
    setIsDragging(false);
    if (compressedFile) {
      setCompressedFile(null);
      setCompressedFileSize(null);
    }
    uploadFile(event.dataTransfer.files[0]);
  }

  const qualityPercent = Math.round(parseFloat(compression) * 100);

  return (
    <section
      className="w-full flex flex-col items-center justify-center"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={DropFiles}
    >
      <div
        className={`relative w-full flex flex-col items-center gap-6 sm:gap-8 p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all duration-200 ${
          isDragging
            ? "border-sky-400 bg-sky-500/10"
            : "border-slate-600/50 bg-slate-800/30 hover:border-slate-500/70"
        }`}
      >
        {/* Empty state */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center p-6 pointer-events-none transition-opacity duration-200 ${
            file ? "opacity-0" : "opacity-100"
          }`}
        >
          <p className="text-slate-400 text-center text-base sm:text-lg md:text-xl font-medium max-w-md">
            Drag and drop an image here, or{" "}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-sky-400 hover:text-sky-300 underline underline-offset-4 pointer-events-auto transition-colors"
            >
              browse files
            </button>
          </p>
        </div>

        {/* Image preview area - fixed dimensions prevent layout shift */}
        <div className="w-full min-h-[200px] sm:min-h-[280px] flex flex-col items-center">
          {file && uploading ? (
            <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 w-full justify-center items-stretch">
              {/* Original image */}
              <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 min-w-[280px] sm:min-w-[320px] lg:min-w-[280px]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-slate-300 font-medium text-sm">
                    Original
                  </span>
                  <span className="text-slate-400 text-sm">
                    {Math.round(fileSize / 1024)} KB
                  </span>
                </div>
                <ImageWithPlaceholder
                  src={file}
                  alt="Original image"
                  imageRef={imageRef}
                  unoptimized
                />
              </div>

              {/* Compressed image - always show when file exists to prevent layout shift */}
              <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 min-w-[280px] sm:min-w-[320px] lg:min-w-[280px]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-slate-300 font-medium text-sm">
                    Compressed
                  </span>
                  {compressedFile ? (
                    <div className="flex gap-4 text-sm">
                      <span className="text-emerald-400">
                        {Math.round(compressedFileSize / 1024)} KB
                      </span>
                      <span className="text-sky-400">
                        Quality: {qualityPercent}%
                      </span>
                    </div>
                  ) : null}
                </div>
                {compressedFile ? (
                  <ImageWithPlaceholder
                    src={compressedFile}
                    alt="Compressed WebP"
                    unoptimized
                  />
                ) : (
                  <div className={`${IMAGE_CONTAINER_CLASS} flex items-center justify-center`}>
                    <div className="flex flex-col items-center gap-3">
                      <svg
                        className="animate-spin h-8 w-8 text-sky-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span className="text-slate-400 text-sm">
                        Converting...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Controls */}
        <div className="w-full flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch sm:items-center justify-between">
          <input
            ref={inputRef}
            onChange={() =>
              uploadFile(
                inputRef.current != null ? inputRef.current.files[0] : ""
              )
            }
            className="hidden"
            type="file"
            accept="image/*"
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="px-5 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-sm transition-colors border border-slate-600 hover:border-slate-500"
          >
            Choose image
          </button>

          {compressedFile ? (
            <a
              download="converted.webp"
              href={compressedFile}
              className="px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-medium text-sm text-center transition-colors"
            >
              Download WebP
            </a>
          ) : null}

          <div className="flex flex-col gap-2 min-w-0 flex-1 sm:flex-initial sm:max-w-xs">
            <div className="flex items-center justify-between gap-3">
              <label className="text-slate-400 text-sm font-medium">
                Quality
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={10}
                  max={90}
                  value={manualInputValue !== null ? manualInputValue : qualityPercent}
                  onChange={handleManualQualityChange}
                  onBlur={handleManualQualityBlur}
                  onKeyDown={handleManualQualityKeyDown}
                  disabled={isConverting}
                  className="w-14 px-2 py-1 rounded-md bg-slate-800 border border-slate-600 text-slate-200 text-sm text-right disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-slate-400 text-sm">%</span>
                <button
                  ref={applyButtonRef}
                  type="button"
                  onClick={applyManualQuality}
                  disabled={isConverting}
                  className="px-3 py-1 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
            </div>
            <input
              ref={rangeRef}
              value={compression}
              onChange={(e) => adjustCompression(e.target.value)}
              type="range"
              max="0.9"
              min="0.1"
              step="0.1"
              className="w-full h-2 disabled:opacity-50"
              disabled={isConverting}
            />
          </div>
        </div>

        <canvas
          className="hidden"
          ref={canvasRef}
          width={file ? file.naturalWidth : 330}
          height={file ? file.naturalHeight : 330}
        />
      </div>
    </section>
  );
}
