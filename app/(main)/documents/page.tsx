"use client";

import { useEffect, useState } from "react";
import { FileText, Upload } from "lucide-react";
import UploadModal from "@/components/UploadModal";
import type { DocMeta } from "@/lib/docRegistry";

interface Toast {
  message: string;
  type: "success" | "error";
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocMeta[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const fetchDocs = async () => {
    const res = await fetch("/api/docs");
    if (res.ok) setDocs(await res.json());
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleSuccess = (filename: string, chunkCount: number) => {
    setShowModal(false);
    setToast({
      message: `Indexed '${filename}' — ${chunkCount} chunks`,
      type: "success",
    });
    fetchDocs();
  };

  const handleError = (message: string) => {
    setShowModal(false);
    setToast({ message, type: "error" });
  };

  return (
    <section className="flex flex-col flex-1 h-full overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
        <h1 className="font-semibold text-base">Documents</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {docs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-neutral-400 text-sm gap-2">
            <FileText className="w-10 h-10 opacity-30" />
            <p>No documents uploaded yet</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-400 border-b border-neutral-200 dark:border-neutral-700">
                <th className="pb-2 font-medium">Filename</th>
                <th className="pb-2 font-medium">Uploaded</th>
                <th className="pb-2 font-medium text-right">Chunks</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => (
                <tr
                  key={doc.id}
                  className="border-b border-neutral-100 dark:border-neutral-800"
                >
                  <td className="py-3 font-mono text-xs">{doc.filename}</td>
                  <td className="py-3 text-neutral-500">
                    {new Date(doc.uploadedAt).toLocaleString()}
                  </td>
                  <td className="py-3 text-right text-neutral-500">{doc.chunkCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {toast && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-3 rounded-xl text-white text-sm shadow-lg ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      {showModal && (
        <UploadModal
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      )}
    </section>
  );
}
