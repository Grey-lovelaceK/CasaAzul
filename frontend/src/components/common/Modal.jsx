// frontend/src/components/common/Modal.jsx

import { X } from "lucide-react";
import { useEffect } from "react";

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
}) => {
  const sizes = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-full mx-4",
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div
          className={`relative bg-white rounded-xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-hidden flex flex-col`}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              {title && (
                <h3 className="text-xl font-bold text-gray-800">{title}</h3>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
};
