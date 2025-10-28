import React, { useState } from "react";
import { Upload, Link, CheckCircle, Trash2 } from "lucide-react";
import Alert, { AlertModal } from "../../general/alert";

type Step = "upload" | "pair" | "metadata";

interface StepNavigationProps {
  currentStep: Step;
  onStepClick?: (step: Step) => void;
  completedSteps?: Step[];
  constructionKitId?: string;
}

const steps = [
  {
    id: "upload" as Step,
    title: "Upload Files",
    description: "Add and organize your audio files",
    icon: Upload,
  },
  {
    id: "pair" as Step,
    title: "Create Pairs",
    description: "Group related files together",
    icon: Link,
  },
  {
    id: "metadata" as Step,
    title: "Metadata",
    description: "Add metadata to your files",
    icon: CheckCircle,
  },
];

export default function StepNavigation({
  currentStep,
  onStepClick,
  completedSteps = [],
  constructionKitId,
}: StepNavigationProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const getStepStatus = (stepId: Step) => {
    if (completedSteps.includes(stepId)) return "completed";
    if (stepId === currentStep) return "current";
    return "upcoming";
  };

  const canNavigateToStep = (stepId: Step) => {
    const stepIndex = steps.findIndex((s) => s.id === stepId);
    const currentIndex = steps.findIndex((s) => s.id === currentStep);
    return completedSteps.includes(stepId) || stepIndex <= currentIndex;
  };

  const handleDelete = async () => {
    if (!constructionKitId) return;

    setIsDeleting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/import/constructionKit/${constructionKitId}`,
        {
          method: "DELETE",
        }
      );
      if (response.status === 404) {
        window.location.reload();
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to discard changes");
      }

      window.location.reload();
    } catch (error) {
      console.error("Error discarding changes:", error);
      alert("Failed to discard changes. Please try again.");
      setIsDeleting(false);
      setShowDeleteAlert(false);
    }
  };

  return (
    <>
      <div className="bg-black/90 border rounded-4xl border-white/20 px-6 py-4 w-fit mb-4">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              {steps.map((step, index) => {
                const status = getStepStatus(step.id);
                const Icon = step.icon;
                const isClickable = canNavigateToStep(step.id) && onStepClick;

                return (
                  <React.Fragment key={step.id}>
                    <div
                      className={`flex items-center gap-4 ${isClickable
                        ? "cursor-pointer hover:opacity-80 transition-opacity"
                        : ""
                        }`}
                      onClick={() => {
                        if (isClickable && !isDeleting) {
                          onStepClick(step.id);
                        }
                      }}
                    >
                      <div
                        className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${status === "completed"
                          ? "bg-green-500/20 border-green-500 text-green-400"
                          : status === "current"
                            ? "bg-primary/20 border-primary text-primary"
                            : "bg-white/5 border-white/20 text-white/40"
                          }`}
                      >
                        {status === "completed" ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}

                        {status === "current" && (
                          <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-20" />
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="hidden sm:block">
                        <h3
                          className={`font-medium text-sm transition-colors ${status === "completed"
                            ? "text-green-400"
                            : status === "current"
                              ? "text-primary"
                              : "text-white/60"
                            }`}
                        >
                          {step.title}
                        </h3>
                        <p
                          className={`text-xs mt-0.5 transition-colors ${status === "completed"
                            ? "text-green-300/70"
                            : status === "current"
                              ? "text-primary/70"
                              : "text-white/40"
                            }`}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {/* Connector Line */}
                    {index < steps.length - 1 && (
                      <div className="flex-1 mx-4 hidden md:block">
                        <div
                          className={`h-0.5 rounded-full transition-all duration-500 ${completedSteps.includes(step.id) ||
                            (status === "current" &&
                              completedSteps.length > index)
                            ? "bg-gradient-to-r from-green-500 to-primary"
                            : status === "current"
                              ? "bg-gradient-to-r from-primary to-white/20"
                              : "bg-white/10"
                            }`}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Delete Button */}
            {constructionKitId && (
              <div className="ml-6 pl-6 border-l border-white/20">
                <button
                  onClick={() => setShowDeleteAlert(true)}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Discard all changes"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {isDeleting ? "Discarding..." : "Discard"}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Alert */}
      <AlertModal isOpen={showDeleteAlert} onClose={() => !isDeleting && setShowDeleteAlert(false)}>
        <Alert
          variant="delete"
          title="Discard Changes?"
          description="Are you sure you want to discard all changes? This action cannot be undone."
          showCloseButton={false}
          actions={[
            {
              label: "Cancel",
              onClick: () => setShowDeleteAlert(false),
              variant: "secondary",
            },
            {
              label: "Discard",
              onClick: handleDelete,
              variant: "danger",
              loading: isDeleting,
            },
          ]}
        />
      </AlertModal>
    </>
  );
}
