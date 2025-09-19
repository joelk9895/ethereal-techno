import { Check } from "lucide-react";

interface RequiredFilesProps {
  title: string;
  requiredTypes: string[];
  uploadedFiles: { fileType: string }[];
}

export function RequiredFiles({
  title,
  requiredTypes,
  uploadedFiles,
}: RequiredFilesProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <h3 className="text-sm font-medium text-white/70 mb-2">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {requiredTypes?.map((fileType) => {
          const hasFileType = uploadedFiles.some(
            (file) => file.fileType === fileType
          );
          return (
            <div
              key={fileType}
              className={`px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 ${
                hasFileType
                  ? "bg-green-900/30 text-green-300 border border-green-600/40"
                  : "bg-white/5 text-white/70 border border-white/20"
              }`}
            >
              {hasFileType && <Check className="w-3 h-3" />}
              {fileType}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface StatusMessageProps {
  isComplete: boolean;
  missingTypes: string[];
}

export function StatusMessage({
  isComplete,
  missingTypes,
}: StatusMessageProps) {
  if (isComplete) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
        <p className="text-green-400 text-sm text-center">
          ✓ All required files uploaded successfully
        </p>
      </div>
    );
  }

  if (missingTypes.length > 0) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
        <p className="text-yellow-400 text-sm text-center">
          Required files are missing: {missingTypes.join(" & ")}
        </p>
      </div>
    );
  }

  return null;
}
