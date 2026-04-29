"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";

interface UploadModalProps {
  onClose: () => void;
  onSuccess: (filename: string, chunkCount: number) => void;
  onError: (message: string) => void;
}

export default function UploadModal({ onClose, onSuccess, onError }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload-doc", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error ?? "Upload failed");
      } else {
        onSuccess(data.filename, data.chunkCount);
      }
    } catch {
      onError("Network error — please try again");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-base">Upload Document</h2>
          <button
            onClick={onClose}
            disabled={uploading}
            className="text-neutral-400 hover:text-neutral-600 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div
          className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".md"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">
              {file.name}
            </p>
          ) : (
            <p className="text-sm text-neutral-400">
              Click to select a <span className="font-mono">.md</span> file
            </p>
          )}
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 rounded-full text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
