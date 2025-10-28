import FileDrop from "./FileDrop";
import { useState } from "react";
import MakePair from "./MakePair";
import { InfoIcon, ArrowDown } from "lucide-react";
import StepNavigation from "./StepNavigation";

type Step = "upload" | "pair" | "metadata";

export default function ConstructionKit({ id, onBPMDetected }: { id: string; onBPMDetected: (bpm: string) => void; }) {
  const [currentStep, setCurrentStep] = useState<Step>("upload");
  const [fileCount, setFileCount] = useState(0);

  const handleFileUploaded = () => {
    setCurrentStep("pair");
  };

  const handlePairDone = () => {
    setCurrentStep("metadata");
  };

  const handleBackToUpload = () => {
    setCurrentStep("upload");
  };

  return (
    <div className="p-6">
      <div
        className={` ${fileCount > 0 && (currentStep === "pair" || currentStep === "upload")
          ? "justify-center items-center px-6 border-b border-white/10 fixed top-0 left-0 h-screen w-screen bg-black/80 backdrop-blur-sm z-50 flex flex-col"
          : "justify-center items-center flex flex-col"
          }`}
      >
        {(fileCount > 0 || currentStep === "pair") && (
          <StepNavigation currentStep={currentStep} constructionKitId={id} />
        )}
        {currentStep === "upload" && (
          <FileDrop
            id={id}
            onFileUploaded={handleFileUploaded}
            onFileCountChange={(count) => {
              setFileCount(count);
            }}
            onBPMDetected={onBPMDetected}
          />
        )}

        {currentStep === "pair" && (
          <MakePair
            id={id}
            handlePairDone={handlePairDone}
            onBack={handleBackToUpload}
          />
        )}

        {currentStep === "metadata" && (
          <div className="flex justify-center items-center">
            <div
              role="alert"
              aria-live="assertive"
              className="bg-black/90 border border-white/30 rounded-2xl max-w-4xl w-full overflow-hidden backdrop-blur-sm"
            >
              <div className="p-8">
                <div className="flex items-start gap-6 mb-6">
                  <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                    <InfoIcon size={24} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-medium font-main uppercase tracking-wider text-white mb-2">
                      Metadata Required
                    </h3>
                    <p className="text-white/60 text-base leading-relaxed">
                      Please complete all required fields to finish your
                      construction kit creation. This information helps organize
                      and categorize your content properly.
                    </p>
                  </div>
                </div>

                <button className="w-full px-6 py-3 text-sm font-medium tracking-wide transition-all duration-200 border border-primary/20 bg-primary text-black hover:bg-primary/90 rounded-lg flex items-center justify-center gap-2">
                  Complete Setup
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
