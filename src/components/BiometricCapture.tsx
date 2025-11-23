import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BiometricSkeleton } from "@/components/ui/skeleton";
import {
  Scan,
  CheckCircle2,
  Camera,
  RefreshCw,
  Eye,
  Target,
} from "lucide-react";
import {
  useNFTRegistrationStore,
  BiometricData,
} from "@/store/nft-registration-store";
import { microInteractions, triggerSuccessAnimation } from "@/lib/animations";

export const BiometricCapture: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { updateRegistrationData, setCurrentStep, registrationData } =
    useNFTRegistrationStore();

  const [isCapturing, setIsCapturing] = useState(false);
  const [showCaptureAnimation, setShowCaptureAnimation] = useState(false);
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [captureAttempts, setCaptureAttempts] = useState(0);
  const [lastCaptureData, setLastCaptureData] = useState(
    registrationData.biometricData
  );
  const [error, setError] = useState<string | null>(null);

  // 🔹 Simulate SDK initialization
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsInitialized(true), 1000); // simulate init delay
  }, []);

  // 🔹 Start biometric capture via API
  const handleStartCapture = async () => {
    try {
      setIsCapturing(true);
      setShowCaptureAnimation(true);
      setConfidenceScore(0);
      setError(null);

      // Simulate confidence score gradually increasing during capture
      const interval = setInterval(() => {
        setConfidenceScore((prev) => Math.min(prev + Math.random() * 20, 95));
      }, 100);

      // Call the API
      const response = await fetch("http://127.0.0.1:7700/start-liveness", {
        method: "POST", // Assuming POST, adjust if needed
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      clearInterval(interval);

      if (data.success) {
        if (data.result.verdict === "Live Verified (peak-pass)") {
          // Successful liveness
          const biometricData: BiometricData = {
            confidence: data.result.avg_live,
            embeddings: data.result.meta.embedding,
            timestamp: data.result.meta.timestamp,
          };

          // ✅ Update store
          updateRegistrationData({ biometricData });

          // ✅ Local UI updates
          setLastCaptureData(biometricData);
          setConfidenceScore(100);
          setCaptureAttempts((prev) => prev + 1);
          setShowCaptureAnimation(false);
          setIsCapturing(false);

          triggerSuccessAnimation(cardRef.current);
        } else if (data.result.verdict === "Spoof Detected") {
          // Spoof detected
          setError("Spoof detected. Please try again with a real face.");
          setIsCapturing(false);
          setShowCaptureAnimation(false);
        } else {
          throw new Error("Unexpected verdict from API");
        }
      } else {
        throw new Error("API returned success: false");
      }
    } catch (err) {
      console.error("Capture failed:", err);
      setError(
        err instanceof Error ? err.message : "An error occurred during capture."
      );
      setIsCapturing(false);
      setShowCaptureAnimation(false);
    }
  };

  const handleRetryCapture = async () => {
    setLastCaptureData(null);
    updateRegistrationData({ biometricData: null });
    await handleStartCapture();
  };

  const handleProceed = () => {
    if (registrationData.biometricData) {
      setCurrentStep("document");
    }
  };

  if (!isInitialized) {
    return (
      <Card className="glass-morphism nft-glow animate-in fade-in-0 duration-500">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 gradient-bg rounded-full flex items-center justify-center mb-4 animate-glow">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
            </div>
          </div>
          <CardTitle className="text-2xl">Initializing Scanner...</CardTitle>
          <CardDescription>Setting up biometric capture system</CardDescription>
        </CardHeader>
        <CardContent>
          <BiometricSkeleton />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      ref={cardRef}
      className={`glass-morphism nft-glow ${microInteractions.card} animate-in slide-in-from-bottom-4 duration-700`}
    >
      <CardHeader className="text-center">
        <div
          className={`mx-auto w-16 h-16 gradient-bg rounded-full flex items-center justify-center mb-4 ${
            isCapturing || showCaptureAnimation
              ? "animate-glow animate-bounce"
              : lastCaptureData
              ? "animate-glow"
              : "animate-float"
          }`}
        >
          {lastCaptureData ? (
            <CheckCircle2 className="w-8 h-8 text-white animate-in zoom-in-50 duration-300" />
          ) : isCapturing ? (
            <Target className="w-8 h-8 text-white animate-spin" />
          ) : (
            <Eye className="w-8 h-8 text-white" />
          )}
        </div>
        <CardTitle className="text-2xl">
          {lastCaptureData ? "Biometric Captured" : "Biometric Verification"}
        </CardTitle>
        <CardDescription>
          {lastCaptureData
            ? "Your biometric data has been successfully captured and processed."
            : "Capture your biometric data for secure NFT registration verification."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {!lastCaptureData && (
          <>
            <div className="relative bg-muted/50 rounded-xl p-6 text-center space-y-4 group overflow-hidden">
              <Camera className="w-16 h-16 mx-auto text-muted-foreground" />
              <h3 className="font-medium">
                {isCapturing ? "Scanning..." : "Ready for Capture"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Click start to generate your biometric embedding.
              </p>
            </div>

            {isCapturing && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="font-medium animate-pulse">Capturing Face...</p>
                  <p className="text-sm text-muted-foreground">
                    Please wait a moment
                  </p>
                </div>
                <Progress value={confidenceScore} className="w-full" />
                <div className="text-center text-sm text-muted-foreground">
                  {Math.round(confidenceScore)}% complete
                </div>
              </div>
            )}

            {!isCapturing && (
              <Button
                onClick={handleStartCapture}
                className="w-full gradient-bg hover:opacity-90 transition-opacity"
              >
                <Scan className="w-4 h-4 mr-2" />
                Start Capture
              </Button>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </>
        )}

        {lastCaptureData && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 p-4 bg-success/10 border border-success/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <div className="flex-1">
                <p className="font-medium text-green-500">
                  Biometric Data Generated
                </p>
                <p className="text-sm text-muted-foreground">
                  Ready to proceed to document upload
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Confidence Score</p>
                <p className="font-medium text-green-500">
                  {(lastCaptureData.confidence * 100).toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Embeddings</p>
                <p className="font-mono text-xs">
                  [{lastCaptureData.embeddings.slice(0, 5).join(", ")}...]
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleRetryCapture}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
              <Button
                onClick={handleProceed}
                className="flex-1 gradient-bg hover:opacity-90 transition-opacity"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {captureAttempts > 0 && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              capture attempts: {captureAttempts}
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>🧠 embeddings stored globally for backend submission</p>
          <p>🔒 Real biometric data from API</p>
        </div>
      </CardContent>
    </Card>
  );
};
