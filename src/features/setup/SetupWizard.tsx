import { useState } from "react";
import { openSystemSettings } from "../../lib/tauri";

interface SetupWizardProps {
  onComplete: () => void;
}

const SETUP_STEPS = [
  {
    id: "full-disk-access",
    title: "Full Disk Access",
    description:
      "Required to analyze storage by category (Apps, Documents, Photos, etc.)",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    panel: "full-disk-access" as const,
  },
  {
    id: "accessibility",
    title: "Accessibility",
    description: "Required to force quit unresponsive applications",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    panel: "accessibility" as const,
  },
];

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleOpenSettings = async () => {
    const step = SETUP_STEPS[currentStep];
    try {
      await openSystemSettings(step.panel);
    } catch (error) {
      console.error("Failed to open settings:", error);
    }
  };

  const handleNext = () => {
    if (currentStep < SETUP_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = SETUP_STEPS[currentStep];
  const isLastStep = currentStep === SETUP_STEPS.length - 1;

  return (
    <div className="flex flex-col h-full bg-surface p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-xl font-semibold mb-2">Welcome to Mac Health</h1>
        <p className="text-sm text-white/60">
          Grant permissions for full functionality
        </p>
      </div>

      {/* Progress */}
      <div className="flex justify-center gap-2 mb-8">
        {SETUP_STEPS.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index <= currentStep ? "bg-blue-500" : "bg-white/20"
            }`}
          />
        ))}
      </div>

      {/* Current Step */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4 text-blue-400">
          {step.icon}
        </div>
        <h2 className="text-lg font-medium mb-2">{step.title}</h2>
        <p className="text-sm text-white/60 text-center max-w-xs mb-6">
          {step.description}
        </p>
        <button
          onClick={handleOpenSettings}
          className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
        >
          Open System Settings
        </button>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-white/10">
        <button
          onClick={handleSkip}
          className="text-sm text-white/40 hover:text-white/60 transition-colors"
        >
          Skip setup
        </button>
        <button
          onClick={handleNext}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors"
        >
          {isLastStep ? "Done" : "Next"}
        </button>
      </div>
    </div>
  );
}
