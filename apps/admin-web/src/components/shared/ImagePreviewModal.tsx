import { X, ZoomIn, ZoomOut, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { ServiceRequestAttachmentItem } from '../../types';

interface ImagePreviewModalProps {
  attachments: ServiceRequestAttachmentItem[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  getFullUrl: (url: string) => string;
}

export function ImagePreviewModal({ attachments, initialIndex = 0, isOpen, onClose, getFullUrl }: ImagePreviewModalProps) {
  const [current, setCurrent] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  const attachment = attachments[current];

  useEffect(() => {
    setCurrent(initialIndex);
    setZoom(1);
  }, [initialIndex, isOpen]);

  const prev = useCallback(() => {
    setCurrent(i => (i - 1 + attachments.length) % attachments.length);
    setZoom(1);
  }, [attachments.length]);

  const next = useCallback(() => {
    setCurrent(i => (i + 1) % attachments.length);
    setZoom(1);
  }, [attachments.length]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, prev, next, onClose]);

  if (!isOpen || !attachment) return null;

  const fullUrl = getFullUrl(attachment.fileUrl);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center"
          onClick={e => e.stopPropagation()}
        >
          {/* Toolbar */}
          <div className="absolute top-0 right-0 flex items-center gap-2 p-3 z-10">
            <button
              onClick={() => setZoom(z => Math.min(z + 0.25, 3))}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <a
              href={fullUrl}
              download={attachment.fileName}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"
              onClick={e => e.stopPropagation()}
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-400 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation: Prev */}
          {attachments.length > 1 && (
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Image */}
          <div className="w-full h-full overflow-auto flex items-center justify-center rounded-2xl bg-black/40 border border-white/10">
            <img
              src={fullUrl}
              alt={attachment.fileName}
              style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s ease' }}
              className="max-w-full max-h-[80vh] object-contain rounded-xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://placehold.co/800x600/0f172a/94a3b8?text=Image+Unavailable';
              }}
            />
          </div>

          {/* Navigation: Next */}
          {attachments.length > 1 && (
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Caption */}
          <div className="mt-4 text-center">
            <p className="text-sm font-medium text-white">{attachment.fileName}</p>
            <p className="text-xs text-slate-400 mt-0.5">{current + 1} / {attachments.length}</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
