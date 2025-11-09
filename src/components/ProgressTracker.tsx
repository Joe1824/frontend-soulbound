import React from "react";
import {
  CheckCircle2,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Circle,
  Loader2,
  Wallet,
  Scan,
  FileText,
  PenTool,
  Upload,
  Trophy,
} from "lucide-react";
import { useNFTRegistrationStore } from "@/store/nft-registration-store";
import { microInteractions } from "@/lib/animations";
import type { RegistrationStep } from "@/store/nft-registration-store";

interface StepInfo {
  key: RegistrationStep;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const steps: StepInfo[] = [
  {
    key: "wallet",
    title: "Connect Wallet",
    description: "Connect MetaMask wallet",
    icon: Wallet,
  },
  {
    key: "biometric",
    title: "Biometric Scan",
    description: "Capture biometric data",
    icon: Scan,
  },
  {
    key: "document",
    title: "Upload Document",
    description: "Upload e-Aadhar PDF",
    icon: FileText,
  },
  {
    key: "signing",
    title: "Sign Message",
    description: "Sign verification message",
    icon: PenTool,
  },
  {
    key: "submission",
    title: "Submit",
    description: "Submit to blockchain",
    icon: Upload,
  },
  {
    key: "success",
    title: "Complete",
    description: "Registration successful",
    icon: Trophy,
  },
];

export const ProgressTracker: React.FC = () => {
  const { currentStep, status, isStepCompleted } = useNFTRegistrationStore();

  const getStepStatus = (step: RegistrationStep) => {
    if (step === currentStep) {
      if (status === "error") return "error";
      if (
        status === "connecting" ||
        status === "capturing" ||
        status === "uploading" ||
        status === "signing" ||
        status === "submitting"
      )
        return "loading";
      return "current";
    }

    if (isStepCompleted(step)) return "completed";

    const currentIndex = steps.findIndex((s) => s.key === currentStep);
    const stepIndex = steps.findIndex((s) => s.key === step);

    return stepIndex < currentIndex ? "completed" : "pending";
  };

  const getStepIcon = (step: RegistrationStep, stepInfo: StepInfo) => {
    const stepStatus = getStepStatus(step);
    const Icon = stepInfo.icon;

    switch (stepStatus) {
      case "completed":
        return (
          <CheckCircle2 className="w-5 h-5 text-green-500 animate-in zoom-in-50 duration-300" />
        );
      case "loading":
        return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
      case "current":
        return (
          <div className="relative">
            <div className="w-5 h-5 border-2 border-primary rounded-full bg-primary/20 animate-pulse"></div>
            <div className="absolute inset-0 w-5 h-5 border border-primary/50 rounded-full animate-ping"></div>
          </div>
        );
      case "error":
        return (
          <div className="w-5 h-5 border-2 border-destructive rounded-full bg-destructive/20 animate-pulse" />
        );
      default:
        return <Icon className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStepLineColor = (
    fromStep: RegistrationStep,
    toStep: RegistrationStep
  ) => {
    const fromStatus = getStepStatus(fromStep);
    const toStatus = getStepStatus(toStep);

    if (
      fromStatus === "completed" &&
      (toStatus === "completed" ||
        toStatus === "current" ||
        toStatus === "loading")
    ) {
      return "bg-primary";
    }

    return "bg-muted";
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in-0 duration-700">
      {/* Desktop Progress Tracker */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between relative">
          {steps.map((step, index) => (
            <React.Fragment key={step.key}>
              <div
                className={`flex flex-col items-center relative z-10 ${microInteractions.progressStep} group`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full bg-background border-2 mb-3 ${
                    microInteractions.card
                  } ${
                    getStepStatus(step.key) === "completed"
                      ? "border-green-500 bg-green-500/10"
                      : getStepStatus(step.key) === "current"
                      ? "border-primary bg-primary/10 animate-glow"
                      : getStepStatus(step.key) === "error"
                      ? "border-destructive bg-destructive/10"
                      : "border-border"
                  }`}
                >
                  {getStepIcon(step.key, step)}
                </div>
                <div className="text-center max-w-28">
                  <p
                    className={`text-sm font-medium transition-colors duration-200 ${
                      getStepStatus(step.key) === "current"
                        ? "text-primary"
                        : getStepStatus(step.key) === "completed"
                        ? "text-green-500"
                        : getStepStatus(step.key) === "error"
                        ? "text-destructive"
                        : "text-muted-foreground"
                    } group-hover:scale-105 transition-transform duration-200`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 opacity-70 group-hover:opacity-100 transition-opacity duration-200">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connection Line with Animation */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4 h-0.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ease-out ${
                      getStepLineColor(step.key, steps[index + 1].key) ===
                      "bg-primary"
                        ? "w-full bg-gradient-to-r from-primary to-primary/60"
                        : "w-0 bg-muted"
                    }`}
                    style={{
                      animationDelay: `${index * 200}ms`,
                      ...(getStepLineColor(step.key, steps[index + 1].key) ===
                        "bg-primary" && {
                        backgroundImage:
                          "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                        backgroundSize: "200% 100%",
                        animation: "shimmer 2s infinite",
                      }),
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Mobile Progress Tracker */}
      <div className="md:hidden">
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.key}
              className={`flex items-center space-x-4 animate-in slide-in-from-left-2 duration-300`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    microInteractions.card
                  } ${
                    getStepStatus(step.key) === "completed"
                      ? "border-green-500 bg-green-500/10"
                      : getStepStatus(step.key) === "current"
                      ? "border-primary bg-primary/10 animate-glow"
                      : getStepStatus(step.key) === "error"
                      ? "border-destructive bg-destructive/10"
                      : "border-border bg-background"
                  }`}
                >
                  {getStepIcon(step.key, step)}
                </div>
                {index < steps.length - 1 && (
                  <div className="w-0.5 h-8 mt-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`w-full h-full transition-all duration-500 ${
                        getStepLineColor(step.key, steps[index + 1].key) ===
                        "bg-primary"
                          ? "bg-primary"
                          : "bg-muted"
                      }`}
                    />
                  </div>
                )}
              </div>

              <div className="flex-1 pb-8">
                <p
                  className={`font-medium transition-colors duration-200 ${
                    getStepStatus(step.key) === "current"
                      ? "text-primary"
                      : getStepStatus(step.key) === "completed"
                      ? "text-green-500"
                      : getStepStatus(step.key) === "error"
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
