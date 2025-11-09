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
import { Badge } from "@/components/ui/badge";
import { BiometricSkeleton } from "@/components/ui/skeleton";
import {
  Scan,
  CheckCircle2,
  AlertCircle,
  Camera,
  RefreshCw,
  Eye,
  Target,
} from "lucide-react";
import { useBiometricCapture } from "@/hooks/use-biometric-capture";
import { useNFTRegistrationStore } from "@/store/nft-registration-store";
import { microInteractions, triggerSuccessAnimation } from "@/lib/animations";

export const BiometricCapture: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const {
    isSupported,
    isInitialized,
    isCapturing,
    error,
    initializeSDK,
    startCapture,
    stopCapture,
  } = useBiometricCapture();

  const { updateRegistrationData, setCurrentStep, registrationData } =
    useNFTRegistrationStore();
  const [captureAttempts, setCaptureAttempts] = useState(0);
  const [lastCaptureData, setLastCaptureData] = useState(
    registrationData.biometricData
  );
  const [showCaptureAnimation, setShowCaptureAnimation] = useState(false);
  const [confidenceScore, setConfidenceScore] = useState(0);

  useEffect(() => {
    // Auto-initialize when component mounts
    if (isSupported() && !isInitialized) {
      initializeSDK();
    }
  }, [isSupported, isInitialized, initializeSDK]);

  const handleStartCapture = async () => {
    setShowCaptureAnimation(true);
    setConfidenceScore(0);

    // Simulate confidence scoring animation
    const scoreInterval = setInterval(() => {
      setConfidenceScore((prev) => {
        const newScore = Math.min(prev + Math.random() * 15, 100);
        return newScore;
      });
    }, 100);

    const biometricData = await startCapture();
    clearInterval(scoreInterval);

    if (biometricData) {
      setConfidenceScore(100);
      updateRegistrationData({ biometricData });
      setLastCaptureData(biometricData);
      setCaptureAttempts((prev) => prev + 1);

      // Trigger success animation
      setTimeout(() => {
        triggerSuccessAnimation(cardRef.current);
        setShowCaptureAnimation(false);
      }, 500);
    } else {
      setShowCaptureAnimation(false);
      setConfidenceScore(0);
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

  const handleBack = () => {
    setCurrentStep("wallet");
  };

  if (!isSupported()) {
    return (
      <Card className="glass-morphism nft-glow">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Device Not Supported</CardTitle>
          <CardDescription>
            Your device doesn't support biometric capture. Please use a device
            with camera access.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleBack} variant="outline" className="w-full">
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "text-green-500";
    if (confidence >= 0.7) return "text-yellow-500";
    return "text-red-500";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return "Excellent";
    if (confidence >= 0.7) return "Good";
    return "Poor";
  };

  // Show loading skeleton during initialization
  if (!isInitialized && !error) {
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
        <CardTitle className="text-2xl animate-in fade-in-0 duration-500 delay-200">
          {lastCaptureData ? "Biometric Captured" : "Biometric Verification"}
        </CardTitle>
        <CardDescription className="animate-in fade-in-0 duration-500 delay-300">
          {lastCaptureData
            ? "Your biometric data has been successfully captured and processed."
            : "Capture your biometric data for secure NFT registration verification."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <div
            className={`flex items-center space-x-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg animate-in slide-in-from-left-2 duration-300 ${microInteractions.card}`}
          >
            <AlertCircle className="w-5 h-5 text-destructive animate-bounce" />
            <div className="flex-1">
              <p className="font-medium text-destructive">Capture Failed</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        )}

        {!lastCaptureData && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 delay-400">
            {/* Camera preview area */}
            <div
              className={`relative bg-muted/50 rounded-xl p-6 text-center space-y-4 ${microInteractions.cardInteractive} group overflow-hidden`}
            >
              <video
                ref={videoRef}
                className="w-full aspect-video bg-black rounded-lg hidden"
                autoPlay
                playsInline
                muted
              />
              <div className="relative z-10">
                <Camera
                  className={`w-16 h-16 mx-auto text-muted-foreground group-hover:scale-110 transition-transform duration-300 ${
                    isCapturing ? "animate-pulse" : ""
                  }`}
                />
                <div className="space-y-2 mt-4">
                  <h3 className="font-medium">
                    {isCapturing
                      ? "Scanning in Progress..."
                      : "Ready for Capture"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isCapturing
                      ? "Please remain still and look at the camera"
                      : "Position yourself in front of the camera and click start when ready."}
                  </p>
                </div>
              </div>

              {/* Animated scanning overlay when capturing */}
              {(isCapturing || showCaptureAnimation) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute inset-4 border-2 border-primary/50 rounded-lg">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-shimmer"></div>
                  </div>
                  <div className="absolute w-32 h-32 border-4 border-primary rounded-full animate-ping opacity-20"></div>
                  <div className="absolute w-24 h-24 border-4 border-primary/60 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>

            {/* Confidence score during capture */}
            {(isCapturing || showCaptureAnimation) && (
              <div className="space-y-4 animate-in fade-in-0 duration-300">
                <div className="text-center">
                  <p className="font-medium animate-pulse">
                    Analyzing biometric data...
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Please remain still
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Confidence Score
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        confidenceScore >= 80
                          ? "text-green-500"
                          : confidenceScore >= 60
                          ? "text-yellow-500"
                          : "text-red-500"
                      }`}
                    >
                      {Math.round(confidenceScore)}%
                    </span>
                  </div>
                  <Progress
                    value={confidenceScore}
                    className={`w-full ${microInteractions.progressBar}`}
                  />
                  <div className="text-center">
                    <Badge
                      variant={confidenceScore >= 80 ? "default" : "secondary"}
                      className="animate-pulse"
                    >
                      {confidenceScore >= 80
                        ? "Excellent"
                        : confidenceScore >= 60
                        ? "Good"
                        : "Detecting..."}
                    </Badge>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button
                    onClick={stopCapture}
                    variant="outline"
                    size="sm"
                    className={microInteractions.buttonSecondary}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Stop Capture
                  </Button>
                </div>
              </div>
            )}

            {!isCapturing && (
              <Button
                onClick={handleStartCapture}
                disabled={!isInitialized}
                className="w-full gradient-bg hover:opacity-90 transition-opacity"
                size="lg"
              >
                <Scan className="w-4 h-4 mr-2" />
                Start Biometric Capture
              </Button>
            )}
          </div>
        )}

        {lastCaptureData && (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 p-4 bg-success/10 border border-success/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <div className="flex-1">
                <p className="font-medium text-green-500">
                  Biometric Data Captured
                </p>
                <p className="text-sm text-muted-foreground">
                  Ready to proceed to document upload
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Confidence Score</p>
                <div className="flex items-center space-x-2">
                  <p
                    className={`font-medium ${getConfidenceColor(
                      lastCaptureData.confidence
                    )}`}
                  >
                    {Math.round(lastCaptureData.confidence * 100)}%
                  </p>
                  <Badge
                    variant="secondary"
                    className={getConfidenceColor(lastCaptureData.confidence)}
                  >
                    {getConfidenceLabel(lastCaptureData.confidence)}
                  </Badge>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Embeddings</p>
                <p className="font-mono">
                  {lastCaptureData.embeddings.length}D Vector
                </p>
              </div>
            </div>

            {lastCaptureData.confidence < 0.7 && (
              <div className="flex items-center space-x-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <div className="flex-1">
                  <p className="font-medium text-orange-500">
                    Low Confidence Score
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Consider recapturing for better results
                  </p>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                onClick={handleRetryCapture}
                variant="outline"
                className="flex-1"
                disabled={isCapturing}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Recapture
              </Button>
              <Button
                onClick={handleProceed}
                className="flex-1 gradient-bg hover:opacity-90 transition-opacity"
                disabled={isCapturing}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {captureAttempts > 0 && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Capture attempts: {captureAttempts}
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>🔒 Biometric data is processed locally and securely</p>
          <p>Only encrypted embeddings are transmitted</p>
        </div>
      </CardContent>
    </Card>
  );
};
