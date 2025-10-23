import { useState, useEffect } from "react";
import {
  CheckCircle,
  FileAudio,
  X,
  Music,
  FileCode,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UploadedContent {
  name?: string;
  contentType: string;
  metadata?: {
    bpm?: number;
    key?: string;
  };
}

interface UploadProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: number;
  uploadedContent: UploadedContent | null;
  loading: boolean;
}

export default function UploadProgressModal({
  isOpen,
  onClose,
  progress,
  uploadedContent,
  loading,
}: UploadProgressModalProps) {
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  useEffect(() => {
    if (progress === 100 && !loading) {
      const timer = setTimeout(() => {
        setShowSuccessAnimation(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [progress, loading]);

  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case "MIDI":
        return <Music className="w-5 h-5 text-purple-400" />;
      case "Preset":
        return <FileCode className="w-5 h-5 text-amber-400" />;
      case "Construction Kit":
        return <Package className="w-5 h-5 text-yellow-400" />;
      default:
        return <FileAudio className="w-5 h-5 text-green-400" />;
    }
  };

  const handleClose = () => {
    setShowSuccessAnimation(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-black border border-gray-700 rounded-xl shadow-xl max-w-md w-full overflow-hidden"
          >
            <div className="relative p-6">
              {loading && (
                <>
                  <div className="mb-4 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">
                      Uploading Content
                    </h3>
                    <span className="text-primary font-medium text-sm">
                      {progress}%
                    </span>
                  </div>

                  <div className="w-full bg-white/5 border border-gray-700 rounded-xl h-3 mb-6 relative overflow-hidden">
                    <div
                      className="bg-primary h-3 rounded-xl transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                    {progress > 20 && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer rounded-xl" />
                    )}
                  </div>

                  <p className="text-sm text-white/60 text-center">
                    Please don&apos;t close this window while your content is being
                    uploaded
                  </p>
                </>
              )}

              {!loading && uploadedContent && (
                <>
                  <div className="mb-4 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">
                      Upload Complete
                    </h3>
                    <button
                      onClick={handleClose}
                      className="rounded-full p-1 hover:bg-white/10 transition-colors"
                    >
                      <X className="w-5 h-5 text-white/60" />
                    </button>
                  </div>

                  <div className="flex justify-center mb-6">
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={
                        showSuccessAnimation ? { scale: 1, opacity: 1 } : {}
                      }
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                      className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center"
                    >
                      <CheckCircle className="w-10 h-10 text-primary" />
                    </motion.div>
                  </div>

                  <div className="mb-6">
                    <div className="bg-white/5 border border-gray-700 rounded-xl p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-black rounded-md">
                          {getContentIcon(uploadedContent.contentType)}
                        </div>
                        <div>
                          <h4 className="font-medium text-white">
                            {uploadedContent.name || "Untitled"}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-white/40 uppercase">
                              {uploadedContent.contentType}
                            </span>
                            {uploadedContent.metadata?.bpm && (
                              <span className="text-xs text-primary/70">
                                {uploadedContent.metadata.bpm} BPM
                              </span>
                            )}
                            {uploadedContent.metadata?.key && (
                              <span className="text-xs text-primary/70">
                                Key: {uploadedContent.metadata.key}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleClose}
                    className="w-full py-3 bg-primary hover:bg-primary/90 text-black font-medium rounded-xl transition-colors duration-200"
                  >
                    Done
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
