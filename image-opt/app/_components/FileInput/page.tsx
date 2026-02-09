"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import JSZip from "jszip";

type FileEntry = {
  id: string;
  file: File;
  url: string;
  originalSize: number;
  quality: number;
  compressedUrl?: string;
  compressedSize?: number;
  status: "pending" | "converting" | "done" | "failed";
};

type Toast = { id: number; message: string; type: "success" | "error" | "info" };

const IMAGE_CONTAINER_CLASS =
  "relative min-w-[72px] max-w-[72px] sm:min-w-[120px] sm:max-w-[120px] md:min-w-[160px] md:max-w-[160px] w-[72px] sm:w-[120px] md:w-[160px] aspect-square overflow-hidden rounded-lg bg-slate-900/80 shrink-0";

const VISIBLE_FILES_BEFORE_ACCORDION = 1;
const MAX_FILES = 50;
const MAX_FILE_SIZE_MB = 25;
const DEFAULT_QUALITY_STORAGE_KEY = "webp-default-quality";
const VIRTUAL_LIST_THRESHOLD = 20;
const ESTIMATED_ROW_HEIGHT = 220;

function getBaseName(filename: string): string {
  return filename.replace(/\.[^.]+$/, "");
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ToastList({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: number) => void }) {
  return (
    <div aria-live="polite" className="toast-list fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => dismiss(t.id)}
          className={`text-left px-4 py-3 rounded-lg border text-sm font-medium shadow-lg transition-opacity ${
            t.type === "error"
              ? "bg-red-950/90 border-red-800 text-red-200"
              : t.type === "success"
                ? "bg-emerald-950/90 border-emerald-800 text-emerald-200"
                : "bg-slate-800/95 border-slate-600 text-slate-200"
          }`}
        >
          {t.message}
        </button>
      ))}
    </div>
  );
}

export default function FileInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [files, setFiles] = useState<FileEntry[]>([]);
  const [compression, setCompression] = useState<string>("0.5");

  useEffect(() => {
    const stored = localStorage.getItem(DEFAULT_QUALITY_STORAGE_KEY);
    if (stored == null) return;
    const n = parseFloat(stored);
    if (!Number.isNaN(n) && n >= 0.1 && n <= 0.9) {
      setCompression(n <= 1 ? n.toString() : (n / 100).toString());
    }
  }, []);
  const [isDragging, setIsDragging] = useState(false);
  const [editingQuality, setEditingQuality] = useState<Record<string, string>>({});
  const [isListExpanded, setIsListExpanded] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [outputFilenameStyle, setOutputFilenameStyle] = useState<"original" | "suffix">("original");
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});
  const toastIdRef = useRef(0);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const [listScrollTop, setListScrollTop] = useState(0);
  const [listHeight, setListHeight] = useState(400);
  const filesLengthRef = useRef(0);
  filesLengthRef.current = files.length;

  const defaultQuality = parseFloat(compression);
  const defaultQualityPercent = Math.round(defaultQuality * 100);
  const hasFiles = files.length > 0;
  const useAccordion = files.length > VISIBLE_FILES_BEFORE_ACCORDION;
  const visibleFiles = useAccordion && !isListExpanded
    ? files.slice(0, VISIBLE_FILES_BEFORE_ACCORDION)
    : files;
  const hiddenCount = files.length - visibleFiles.length;

  const convertingIndex = files.findIndex((f) => f.status === "converting");
  const doneCount = files.filter((f) => f.status === "done").length;
  const totalOriginal = files.reduce((a, f) => a + f.originalSize, 0);
  const totalCompressed = files
    .filter((f) => f.compressedSize != null)
    .reduce((a, f) => a + (f.compressedSize ?? 0), 0);
  const savingsPercent =
    totalOriginal > 0 && totalCompressed > 0
      ? Math.round((1 - totalCompressed / totalOriginal) * 100)
      : 0;

  const showToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);

  const getOutputFilename = useCallback(
    (entry: FileEntry) => {
      const base = getBaseName(entry.file.name);
      return outputFilenameStyle === "suffix"
        ? `${base}_q${Math.round(entry.quality * 100)}.webp`
        : `${base}.webp`;
    },
    [outputFilenameStyle]
  );

  const processingRef = useRef(false);

  const processQueue = useCallback(() => {
    if (processingRef.current) return;
    if (!canvasRef.current) return;

    setFiles((prev) => {
      const pendingIndex = prev.findIndex((f) => f.status === "pending");
      if (pendingIndex === -1) return prev;

      const entry = prev[pendingIndex];
      processingRef.current = true;

      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const ctx = canvasRef.current!.getContext("2d")!;
        canvasRef.current!.width = img.naturalWidth;
        canvasRef.current!.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        const q = entry.quality;
        canvasRef.current!.toBlob(
          (blob) => {
            processingRef.current = false;
            if (!blob) return;
            const fr = new FileReader();
            fr.readAsDataURL(blob);
            fr.onloadend = () => {
              const compressedUrl = fr.result as string;
              const compressedSize = blob.size;
              setFiles((p) => {
                const next = p.map((f) =>
                  f.id === entry.id
                    ? {
                        ...f,
                        status: "done" as const,
                        compressedUrl,
                        compressedSize,
                      }
                    : f
                );
                setTimeout(() => processQueue(), 0);
                return next;
              });
            };
          },
          "image/webp",
          q
        );
      };
      img.onerror = () => {
        processingRef.current = false;
        setFiles((p) =>
          p.map((f) =>
            f.id === entry.id ? { ...f, status: "failed" as const } : f
          )
        );
        showToast("Conversion failed — tap Retry to try again", "error");
        setTimeout(() => processQueue(), 0);
      };
      img.src = entry.url;

      return prev.map((f) =>
        f.id === entry.id ? { ...f, status: "converting" as const } : f
      );
    });
  }, [showToast]);

  useEffect(() => {
    const hasPending = files.some((f) => f.status === "pending");
    const isConvertingNow = files.some((f) => f.status === "converting");
    if (hasPending && !isConvertingNow) {
      processQueue();
    }
  }, [files, processQueue]);

  useEffect(() => {
    if (files.length <= VISIBLE_FILES_BEFORE_ACCORDION) setIsListExpanded(false);
  }, [files.length]);

  const useVirtualList = useAccordion && isListExpanded && files.length >= VIRTUAL_LIST_THRESHOLD;

  useEffect(() => {
    if (!useVirtualList || !listScrollRef.current) return;
    const el = listScrollRef.current;
    const ro = new ResizeObserver(() => setListHeight(el.clientHeight));
    ro.observe(el);
    setListHeight(el.clientHeight);
    return () => ro.disconnect();
  }, [useVirtualList]);

  const virtualStart =
    useVirtualList ? Math.max(0, Math.floor(listScrollTop / ESTIMATED_ROW_HEIGHT) - 1) : 0;
  const virtualEnd = useVirtualList
    ? Math.min(
        files.length - 1,
        virtualStart + Math.ceil(listHeight / ESTIMATED_ROW_HEIGHT) + 2
      )
    : files.length - 1;
  const virtualSlice = useVirtualList ? files.slice(virtualStart, virtualEnd + 1) : [];

  const uploadFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList?.length) return;
      // Copy to array immediately so we don't depend on the input's FileList after this (important on mobile)
      const list = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
      if (!list.length) return;
      const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
      const rejected: string[] = [];
      const valid: File[] = [];
      for (const f of list) {
        if (f.size > maxBytes) rejected.push(`${f.name} (max ${MAX_FILE_SIZE_MB} MB)`);
        else valid.push(f);
      }
      if (rejected.length) showToast(rejected.join(", "), "error");
      if (!valid.length) {
        setTimeout(() => { if (inputRef.current) inputRef.current.value = ""; }, 0);
        return;
      }
      const currentCount = filesLengthRef.current;
      if (currentCount + valid.length > MAX_FILES) {
        const take = MAX_FILES - currentCount;
        if (take <= 0) {
          showToast(`Maximum ${MAX_FILES} images allowed`, "error");
          setTimeout(() => { if (inputRef.current) inputRef.current.value = ""; }, 0);
          return;
        }
        valid.splice(take);
        showToast(`Added ${take} (max ${MAX_FILES} images)`, "info");
      }
      setFiles((prev) => {
        const defaultQ = parseFloat(compression);
        const newFiles: FileEntry[] = valid.map((f) => ({
          id: `${f.name}-${Date.now()}-${Math.random()}`,
          file: f,
          url: URL.createObjectURL(f),
          originalSize: f.size,
          quality: defaultQ,
          status: "pending" as const,
        }));
        return [...prev, ...newFiles];
      });
      if (valid.length === list.length && rejected.length === 0)
        showToast(`${valid.length} image(s) added`, "success");
      // Defer clearing input so mobile browsers don't invalidate File refs / blob URLs
      setTimeout(() => { if (inputRef.current) inputRef.current.value = ""; }, 150);
    },
    [compression, showToast]
  );

  function setFileQuality(id: string, qualityValue: number) {
    const clamped = Math.min(0.9, Math.max(0.1, qualityValue));
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              quality: clamped,
              ...(f.status === "done"
                ? {
                    status: "pending" as const,
                    compressedUrl: undefined,
                    compressedSize: undefined,
                  }
                : {}),
            }
          : f
      )
    );
  }

  function applyFileQualityInput(id: string, raw: string) {
    setEditingQuality((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (raw === "" || raw === "-") {
      setFileQuality(id, 0.5);
      return;
    }
    const num = parseFloat(raw);
    const clamped = Math.min(90, Math.max(10, num)) / 100;
    setFileQuality(id, clamped);
  }

  function setDefaultQuality(value: string) {
    const num = parseFloat(value);
    const clamped = isNaN(num)
      ? 0.5
      : Math.min(0.9, Math.max(0.1, num > 1 ? num / 100 : num));
    const str = clamped.toString();
    setCompression(str);
    if (typeof window !== "undefined") {
      localStorage.setItem(DEFAULT_QUALITY_STORAGE_KEY, str);
    }
  }

  function DropFiles(event: React.DragEvent) {
    event.preventDefault();
    setIsDragging(false);
    uploadFiles(event.dataTransfer.files);
  }

  function removeFile(id: string) {
    setFiles((prev) => {
      const f = prev.find((x) => x.id === id);
      if (f?.url) URL.revokeObjectURL(f.url);
      return prev.filter((x) => x.id !== id);
    });
    setImageLoaded((p) => {
      const next = { ...p };
      delete next[id];
      return next;
    });
    showToast("Image removed", "info");
  }

  const applyQualityToAll = useCallback(() => {
    const q = defaultQuality;
    setFiles((prev) =>
      prev.map((f) => ({
        ...f,
        quality: q,
        ...(f.status === "done"
          ? { status: "pending" as const, compressedUrl: undefined, compressedSize: undefined }
          : {}),
      }))
    );
    setEditingQuality({});
    showToast(`Applied ${defaultQualityPercent}% to all images`, "success");
  }, [defaultQuality, defaultQualityPercent, showToast]);

  const reConvert = useCallback((id: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id && f.status === "done"
          ? { ...f, status: "pending" as const, compressedUrl: undefined, compressedSize: undefined }
          : f
      )
    );
    showToast("Re-queued for conversion", "info");
  }, [showToast]);

  const retryConversion = useCallback((id: string) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id !== id || f.status !== "failed") return f;
        if (f.url) URL.revokeObjectURL(f.url);
        const newUrl = URL.createObjectURL(f.file);
        return { ...f, url: newUrl, status: "pending" as const };
      })
    );
    showToast("Retrying conversion…", "info");
  }, [showToast]);

  const downloadAllAsZip = useCallback(async () => {
    const done = files.filter((f) => f.status === "done" && f.compressedUrl);
    if (!done.length) return;
    showToast("Preparing ZIP...", "info");
    try {
      const zip = new JSZip();
      for (const entry of done) {
        const res = await fetch(entry.compressedUrl!);
        const blob = await res.blob();
        zip.file(getOutputFilename(entry), blob);
      }
      const out = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(out);
      a.download = "webp-converted.zip";
      a.click();
      URL.revokeObjectURL(a.href);
      showToast("Download started", "success");
    } catch {
      showToast("Could not create ZIP", "error");
    }
  }, [files, getOutputFilename, showToast]);

  const copyToClipboard = useCallback(
    async (entry: FileEntry) => {
      if (!entry.compressedUrl || entry.status !== "done") return;
      try {
        const res = await fetch(entry.compressedUrl);
        const blob = await res.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob }),
        ]);
        showToast("Copied to clipboard", "success");
      } catch {
        showToast("Copy failed", "error");
      }
    },
    [showToast]
  );

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const f = items[i].getAsFile();
          if (f) files.push(f);
        }
      }
      if (files.length) {
        e.preventDefault();
        const list = new DataTransfer();
        files.forEach((f) => list.items.add(f));
        uploadFiles(list.files);
        showToast(`${files.length} image(s) pasted`, "success");
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [showToast, uploadFiles]);

  return (
    <section
      id="converter"
      className="w-full flex flex-col items-center justify-center"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={DropFiles}
    >
      <div
        className={`relative w-full flex flex-col gap-8 sm:gap-10 md:gap-12 p-8 sm:p-10 md:p-12 rounded-xl sm:rounded-2xl border-2 border-dashed transition-all duration-200 theme-border ${
          isDragging
            ? "border-slate-500 bg-slate-800/50"
            : "border-slate-600/60 bg-slate-900/90 hover:border-slate-500/70"
        }`}
        data-converter-card
      >
        {/* Empty state - stacked above controls when no files */}
        {!hasFiles && (
          <div className="flex flex-col items-center justify-center gap-6 sm:gap-8 w-full">
            <p className="text-slate-400 text-center text-sm sm:text-base md:text-lg font-medium leading-relaxed max-w-[320px] sm:max-w-md hidden sm:block">
              Drag and drop images here, or{" "}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-slate-300 underline underline-offset-4 hover:text-emerald-400 transition-colors font-semibold"
              >
                browse files
              </button>
            </p>
            <p className="text-slate-400 text-center text-sm sm:text-base font-medium leading-relaxed max-w-[320px] sm:hidden">
              Tap Choose images to add photos (max {MAX_FILES} images, {MAX_FILE_SIZE_MB} MB each)
            </p>
            <p className="text-slate-500 text-center text-xs sm:text-sm">
              You can also paste from clipboard (Ctrl+V / Cmd+V)
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-6 py-4 sm:px-8 sm:py-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-sm transition-colors border border-slate-600 hover:border-slate-500 touch-manipulation w-full sm:w-auto"
            >
              Choose images
            </button>
            <p className="text-slate-500 text-center text-xs font-medium">
              Your files never leave your device — conversion runs in your browser.
            </p>
          </div>
        )}

        {/* File list */}
        {hasFiles && (
          <div className="flex flex-col gap-6 sm:gap-8 w-full">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-slate-400 text-sm font-medium" aria-label={`${files.length} files`}>
                {files.length} file{files.length !== 1 ? "s" : ""}
              </span>
              <button
                type="button"
                onClick={() => {
                  setFiles((prev) => {
                    prev.forEach((f) => f.url && URL.revokeObjectURL(f.url));
                    return [];
                  });
                  setImageLoaded({});
                }}
                className="text-slate-500 hover:text-slate-300 text-sm font-medium py-2 px-3 rounded hover:bg-slate-800/50 transition-colors"
                aria-label="Clear all images"
              >
                Clear all
              </button>
            </div>

            {(doneCount > 0 || convertingIndex >= 0) && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 flex-wrap" role="status" aria-live="polite">
                {doneCount > 0 && totalOriginal > 0 && totalCompressed > 0 && (
                  <p className="text-slate-400 text-sm">
                    Total: {formatBytes(totalOriginal)} → {formatBytes(totalCompressed)}
                    {savingsPercent > 0 && (
                      <span className="text-emerald-400 ml-1">({savingsPercent}% smaller)</span>
                    )}
                  </p>
                )}
                {convertingIndex >= 0 && (
                  <p className="text-slate-400 text-sm">
                    Converting image {convertingIndex + 1} of {files.length}
                  </p>
                )}
              </div>
            )}

            {/* Actions bar: sticky when list is scrollable so it stays visible */}
            <div
              className={`flex flex-col sm:flex-row gap-3 sm:gap-4 flex-wrap items-stretch sm:items-center shrink-0 ${
                useAccordion && isListExpanded ? "sticky top-0 z-10 py-3 -mx-1 px-1 rounded-lg theme-card border theme-border" : ""
              }`}
            >
              <button
                type="button"
                onClick={applyQualityToAll}
                className="px-4 py-2.5 rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-200 text-sm font-medium border border-slate-600 transition-colors"
              >
                Apply {defaultQualityPercent}% to all
              </button>
              {doneCount > 0 && (
                <button
                  type="button"
                  onClick={downloadAllAsZip}
                  className="px-4 py-2.5 rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-200 text-sm font-medium border border-slate-600 transition-colors"
                >
                  Download all (ZIP)
                </button>
              )}
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-xs sm:text-sm">Output name:</span>
                <select
                  value={outputFilenameStyle}
                  onChange={(e) => setOutputFilenameStyle(e.target.value as "original" | "suffix")}
                  className="rounded-md bg-slate-800 border border-slate-600 text-slate-200 text-xs sm:text-sm px-2.5 py-2"
                  aria-label="Output filename style"
                >
                  <option value="original">Original.webp</option>
                  <option value="suffix">Name_q80.webp</option>
                </select>
              </div>
            </div>

            <div
              ref={useAccordion && isListExpanded ? listScrollRef : undefined}
              onScroll={useAccordion && isListExpanded ? (e) => setListScrollTop(e.currentTarget.scrollTop) : undefined}
              className={`flex flex-col gap-5 sm:gap-6 pr-3 sm:pr-4 ${
                useAccordion && isListExpanded
                  ? "max-h-[60vh] sm:max-h-[400px] overflow-y-auto"
                  : ""
              }`}
            >
              {useVirtualList && (
                <>
                  <div style={{ height: virtualStart * ESTIMATED_ROW_HEIGHT, minHeight: 0 }} aria-hidden />
                  {virtualSlice.map((entry, i) => {
                    const index = virtualStart + i + 1;
                    const loaded = imageLoaded[entry.id];
                    return (
                <div
                  key={entry.id}
                  style={{ minHeight: ESTIMATED_ROW_HEIGHT }}
                  className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6 p-5 sm:p-6 rounded-xl sm:rounded-2xl bg-slate-800/80 border border-slate-700/60"
                  role="article"
                  aria-label={`Image ${index}: ${entry.file.name}`}
                >
                  <div className="flex items-center justify-center shrink-0 w-8 h-8 rounded-lg bg-slate-700/80 border border-slate-600 text-slate-300 text-sm font-semibold">
                    {index}
                  </div>
                  <div className="flex items-start sm:items-center gap-5 min-w-0 flex-1">
                    <div className={`${IMAGE_CONTAINER_CLASS} flex items-center justify-center`}>
                      {!loaded && (
                        <div className="absolute inset-0 bg-slate-700/60 animate-pulse motion-reduce:animate-none rounded-lg" aria-hidden />
                      )}
                      <Image
                        src={entry.url}
                        alt={entry.file.name}
                        width={160}
                        height={160}
                        className="w-full h-full object-contain"
                        unoptimized
                        onLoad={() => setImageLoaded((p) => ({ ...p, [entry.id]: true }))}
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <p className="text-slate-200 font-medium text-sm sm:text-base truncate leading-snug" title={entry.file.name}>
                        {entry.file.name}
                      </p>
                      <p className="text-red-400/90 text-xs sm:text-sm leading-relaxed">
                        Original: {Math.round(entry.originalSize / 1024)} KB
                      </p>
                      {entry.status === "converting" && (
                        <p className="text-slate-400 text-xs sm:text-sm flex items-center gap-2 mt-1 leading-relaxed">
                          <span className="animate-spin motion-reduce:animate-none">⟳</span> Converting...
                        </p>
                      )}
                      {entry.status === "done" && entry.compressedSize != null && (
                        <p className="text-emerald-400 text-xs sm:text-sm leading-relaxed">
                          Compressed: {Math.round(entry.compressedSize / 1024)} KB
                        </p>
                      )}
                      {entry.status === "pending" && (
                        <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">Queued</p>
                      )}
                      {entry.status === "failed" && (
                        <p className="text-red-400/90 text-xs sm:text-sm leading-relaxed">Failed to convert</p>
                      )}
                      <div className="flex items-center gap-3 pt-2">
                        <label className="text-slate-400 text-xs sm:text-sm whitespace-nowrap shrink-0 font-medium">
                          Quality:
                        </label>
                        <input
                          type="number"
                          min={10}
                          max={90}
                          value={
                            entry.id in editingQuality
                              ? editingQuality[entry.id]
                              : Math.round(entry.quality * 100)
                          }
                          onChange={(e) =>
                            setEditingQuality((prev) => ({
                              ...prev,
                              [entry.id]: e.target.value,
                            }))
                          }
                          onBlur={(e) =>
                            applyFileQualityInput(entry.id, e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") e.currentTarget.blur();
                          }}
                          disabled={entry.status === "converting"}
                          className="w-14 sm:w-16 px-2.5 py-2 rounded-md bg-slate-900/80 border border-slate-600 text-slate-200 text-xs sm:text-sm text-right disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-slate-400 text-xs sm:text-sm shrink-0">
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 shrink-0 self-end sm:self-auto">
                    {entry.status === "failed" && (
                      <button
                        type="button"
                        onClick={() => retryConversion(entry.id)}
                        className="px-4 py-2.5 rounded-lg bg-amber-700/80 hover:bg-amber-600 text-amber-100 text-sm font-medium border border-amber-600 transition-colors"
                      >
                        Retry
                      </button>
                    )}
                    {entry.status === "done" && entry.compressedUrl && (
                      <>
                        <a
                          href={entry.compressedUrl}
                          download={getOutputFilename(entry)}
                          className="px-5 py-3 sm:px-6 sm:py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-100 font-medium text-sm transition-colors border border-slate-600"
                        >
                          Download
                        </a>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(entry)}
                          className="px-3 py-2.5 rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-200 text-sm font-medium border border-slate-600 transition-colors"
                          aria-label="Copy WebP to clipboard"
                        >
                          Copy
                        </button>
                        <button
                          type="button"
                          onClick={() => reConvert(entry.id)}
                          className="px-3 py-2.5 rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-200 text-sm font-medium border border-slate-600 transition-colors"
                          aria-label="Re-convert with current quality"
                        >
                          Re-convert
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(entry.id)}
                      className="p-3 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 transition-colors touch-manipulation"
                      aria-label={`Remove ${entry.file.name}`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                    );
                  })}
                  <div style={{ height: (files.length - virtualEnd - 1) * ESTIMATED_ROW_HEIGHT, minHeight: 0 }} aria-hidden />
                </>
              )}
              {!useVirtualList && visibleFiles.map((entry) => {
                const index = files.findIndex((f) => f.id === entry.id) + 1;
                const loaded = imageLoaded[entry.id];
                return (
                <div
                  key={entry.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6 p-5 sm:p-6 rounded-xl sm:rounded-2xl bg-slate-800/80 border border-slate-700/60"
                  role="article"
                  aria-label={`Image ${index}: ${entry.file.name}`}
                >
                  <div className="flex items-center justify-center shrink-0 w-8 h-8 rounded-lg bg-slate-700/80 border border-slate-600 text-slate-300 text-sm font-semibold">
                    {index}
                  </div>
                  <div className="flex items-start sm:items-center gap-5 min-w-0 flex-1">
                    <div className={`${IMAGE_CONTAINER_CLASS} flex items-center justify-center`}>
                      {!loaded && (
                        <div className="absolute inset-0 bg-slate-700/60 animate-pulse motion-reduce:animate-none rounded-lg" aria-hidden />
                      )}
                      <Image
                        src={entry.url}
                        alt={entry.file.name}
                        width={160}
                        height={160}
                        className="w-full h-full object-contain"
                        unoptimized
                        onLoad={() => setImageLoaded((p) => ({ ...p, [entry.id]: true }))}
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <p className="text-slate-200 font-medium text-sm sm:text-base truncate leading-snug" title={entry.file.name}>
                        {entry.file.name}
                      </p>
                      <p className="text-red-400/90 text-xs sm:text-sm leading-relaxed">
                        Original: {Math.round(entry.originalSize / 1024)} KB
                      </p>
                      {entry.status === "converting" && (
                        <p className="text-slate-400 text-xs sm:text-sm flex items-center gap-2 mt-1 leading-relaxed">
                          <span className="animate-spin motion-reduce:animate-none">⟳</span> Converting...
                        </p>
                      )}
                      {entry.status === "done" && entry.compressedSize != null && (
                        <p className="text-emerald-400 text-xs sm:text-sm leading-relaxed">
                          Compressed: {Math.round(entry.compressedSize / 1024)} KB
                        </p>
                      )}
                      {entry.status === "pending" && (
                        <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">Queued</p>
                      )}
                      {entry.status === "failed" && (
                        <p className="text-red-400/90 text-xs sm:text-sm leading-relaxed">Failed to convert</p>
                      )}
                      <div className="flex items-center gap-3 pt-2">
                        <label className="text-slate-400 text-xs sm:text-sm whitespace-nowrap shrink-0 font-medium">
                          Quality:
                        </label>
                        <input
                          type="number"
                          min={10}
                          max={90}
                          value={
                            entry.id in editingQuality
                              ? editingQuality[entry.id]
                              : Math.round(entry.quality * 100)
                          }
                          onChange={(e) =>
                            setEditingQuality((prev) => ({
                              ...prev,
                              [entry.id]: e.target.value,
                            }))
                          }
                          onBlur={(e) =>
                            applyFileQualityInput(entry.id, e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") e.currentTarget.blur();
                          }}
                          disabled={entry.status === "converting"}
                          className="w-14 sm:w-16 px-2.5 py-2 rounded-md bg-slate-900/80 border border-slate-600 text-slate-200 text-xs sm:text-sm text-right disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-slate-400 text-xs sm:text-sm shrink-0">
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 shrink-0 self-end sm:self-auto">
                    {entry.status === "failed" && (
                      <button
                        type="button"
                        onClick={() => retryConversion(entry.id)}
                        className="px-4 py-2.5 rounded-lg bg-amber-700/80 hover:bg-amber-600 text-amber-100 text-sm font-medium border border-amber-600 transition-colors"
                      >
                        Retry
                      </button>
                    )}
                    {entry.status === "done" && entry.compressedUrl && (
                      <>
                        <a
                          href={entry.compressedUrl}
                          download={getOutputFilename(entry)}
                          className="px-5 py-3 sm:px-6 sm:py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-100 font-medium text-sm transition-colors border border-slate-600"
                        >
                          Download
                        </a>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(entry)}
                          className="px-3 py-2.5 rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-200 text-sm font-medium border border-slate-600 transition-colors"
                          aria-label="Copy WebP to clipboard"
                        >
                          Copy
                        </button>
                        <button
                          type="button"
                          onClick={() => reConvert(entry.id)}
                          className="px-3 py-2.5 rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-200 text-sm font-medium border border-slate-600 transition-colors"
                          aria-label="Re-convert with current quality"
                        >
                          Re-convert
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(entry.id)}
                      className="p-3 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 transition-colors touch-manipulation"
                      aria-label={`Remove ${entry.file.name}`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              );
              })}
              {useAccordion && (
                <button
                  type="button"
                  onClick={() => setIsListExpanded((e) => !e)}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 text-sm font-medium transition-colors"
                  aria-expanded={isListExpanded}
                  aria-label={isListExpanded ? "Collapse list" : `Show ${hiddenCount} more images`}
                >
                  {isListExpanded ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      Collapse
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      Show {hiddenCount} more image{hiddenCount !== 1 ? "s" : ""}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className={`flex flex-col sm:flex-row gap-6 sm:gap-10 items-stretch sm:items-center justify-between ${hasFiles ? "pt-2" : "pt-0"}`}>
          <input
            ref={inputRef}
            onChange={(e) => uploadFiles(e.target.files)}
            className="hidden"
            type="file"
            accept="image/*"
            multiple
          />

          {hasFiles && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="px-6 py-4 sm:px-8 sm:py-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-sm transition-colors border border-slate-600 hover:border-slate-500 touch-manipulation"
          >
            Add more images
          </button>
          )}

          {hasFiles && (
            <div className="flex flex-col gap-3 min-w-0 flex-1 sm:flex-initial sm:max-w-xs">
              <label className="text-slate-400 text-sm font-medium" id="default-quality-label">
                Default for new: {defaultQualityPercent}%
              </label>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.1"
                value={compression}
                onChange={(e) => setDefaultQuality(e.target.value)}
                className="w-full h-2.5 touch-none"
                aria-labelledby="default-quality-label"
              />
            </div>
          )}
          {hasFiles && (
            <p className="text-slate-500 text-xs w-full sm:w-auto">
              Max {MAX_FILES} images, {MAX_FILE_SIZE_MB} MB each
            </p>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" width={1} height={1} />
      </div>

      <ToastList toasts={toasts} dismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
    </section>
  );
}
