import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  QrCode,
  Copy,
  ExternalLink,
  Check,
  Smartphone,
  Laptop,
  Share2,
  X,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SharePortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SharePortalModal: React.FC<SharePortalModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { setView, showToast } = useApp();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const portalUrl = `${window.location.origin}/#kumpul-tugas`;

  const handleCopy = () => {
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    showToast('Tautan portal kumpul-tugas berhasil disalin ke clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenPortal = () => {
    onClose();
    window.open(`${window.location.origin}/#kumpul-tugas`, '_blank');
  };

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-5 sm:p-6 space-y-4 shadow-2xl relative max-h-[calc(100vh-2rem)] overflow-y-auto my-auto"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors"
          title="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pr-8">
          <div className="p-2.5 rounded-2xl bg-indigo-950 text-indigo-400 border border-indigo-800 shrink-0">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Bagikan Portal Mahasiswa
            </h3>
            <p className="text-xs text-slate-400">
              Akses pengumpulan mandiri file PDF Layout & Plot
            </p>
          </div>
        </div>

        {/* QR Code Card */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center space-y-2.5">
          <div className="p-3 bg-white rounded-2xl shadow-xl flex items-center justify-center">
            {/* SVG Simulated QR Code */}
            <svg
              className="w-28 h-28 sm:w-32 sm:h-32 text-slate-900"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              <rect x="0" y="0" width="30" height="30" />
              <rect x="5" y="5" width="20" height="20" fill="white" />
              <rect x="10" y="10" width="10" height="10" />

              <rect x="70" y="0" width="30" height="30" />
              <rect x="75" y="5" width="20" height="20" fill="white" />
              <rect x="80" y="10" width="10" height="10" />

              <rect x="0" y="70" width="30" height="30" />
              <rect x="5" y="75" width="20" height="20" fill="white" />
              <rect x="10" y="80" width="10" height="10" />

              <rect x="40" y="10" width="20" height="10" />
              <rect x="40" y="40" width="20" height="20" />
              <rect x="10" y="40" width="15" height="15" />
              <rect x="70" y="40" width="20" height="10" />
              <rect x="40" y="70" width="15" height="20" />
              <rect x="65" y="65" width="25" height="25" />
            </svg>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
              <span>Scan via HP</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5 text-indigo-400" />
              <span>Buka di Laptop</span>
            </div>
          </div>
        </div>

        {/* Link sharing box */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-400">
            Tautan Pengumpulan Mandiri:
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={portalUrl}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-indigo-300 font-mono focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-semibold text-white flex items-center gap-1.5 shrink-0 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800 gap-2">
          <span className="text-[10px] text-slate-400">
            Mahasiswa tidak memerlukan login akun.
          </span>
          <button
            onClick={handleOpenPortal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-950/60 transition-all shrink-0"
          >
            <span>Buka Portal (Tab Baru)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
