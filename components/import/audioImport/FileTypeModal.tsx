import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { getFileTypeDescription } from "./utils";

interface FileTypeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tempFile: File | null;
  requiredFileTypes: string[];
  selectedFileType: string | null;
  setSelectedFileType: (type: string) => void;
  uploadedFileTypes: string[];
  onConfirm: () => void;
}

export default function FileTypeModal({
  isOpen,
  onOpenChange,
  tempFile,
  requiredFileTypes,
  selectedFileType,
  setSelectedFileType,
  uploadedFileTypes,
  onConfirm,
}: FileTypeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black border border-white/10 text-white sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Select File Type</DialogTitle>
          <DialogDescription className="text-white/60">
            {tempFile?.name && (
              <>
                Choose the file type for:{" "}
                <span className="text-white font-medium">{tempFile.name}</span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-4">
          {requiredFileTypes?.map((fileType) => {
            const isAlreadyUploaded = uploadedFileTypes.includes(fileType);
            return (
              <button
                key={fileType}
                className={`p-3 border text-left transition-all rounded-lg ${
                  selectedFileType === fileType
                    ? "bg-primary/10 border-primary text-primary"
                    : isAlreadyUploaded
                    ? "bg-gray-800/50 border-gray-600 text-gray-400"
                    : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                }`}
                onClick={() => setSelectedFileType(fileType)}
                disabled={isAlreadyUploaded}
              >
                <div className="font-medium">
                  {fileType} {isAlreadyUploaded && "(Already uploaded)"}
                </div>
                <div className="text-xs mt-1 opacity-70">
                  {getFileTypeDescription(fileType)}
                </div>
              </button>
            );
          })}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-transparent border-white/20 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-primary text-black hover:bg-primary/90"
            disabled={!selectedFileType || !tempFile}
          >
            Add File
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
