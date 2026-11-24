import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Notification = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  const bgStyles = {
    success: 'bg-[#FAF5EE] border-[#C5934C] text-[#2A241F]',
    error: 'bg-[#FFF5F5] border-[#E07A5F] text-[#67221A]',
    info: 'bg-[#F5F2EB] border-[#D4AF79] text-[#2A241F]',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#C5934C] shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-[#E07A5F] shrink-0" />,
    info: <Info className="w-5 h-5 text-[#D4AF79] shrink-0" />,
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-lg border shadow-luxury-lg max-w-md animate-fade-in transition-all ${
        bgStyles[type] || bgStyles.info
      }`}
    >
      {icons[type]}
      <p className="text-sm font-medium leading-relaxed pr-2">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="text-taupe-500 hover:text-espresso-900 transition-colors ml-auto"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
