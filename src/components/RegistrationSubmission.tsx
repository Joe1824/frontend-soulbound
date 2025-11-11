import React, { useState, useEffect } from "react";
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
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useNFTRegistrationStore } from "@/store/nft-registration-store";
import { useToast } from "@/hooks/use-toast";

interface SubmissionResponse {
  success: boolean;
  tokenId?: string;
  transactionHash?: string;
  error?: string;
}

export const RegistrationSubmission: React.FC = () => {
  const { toast } = useToast();
  const {
    registrationData,
    setCurrentStep,
    updateRegistrationData,
    setStatus,
    setProgress,
    addToHistory,
  } = useNFTRegistrationStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState("");
  const [submissionResult, setSubmissionResult] =
    useState<SubmissionResponse | null>(null);

  // API call to backend
  const submitRegistrationData = async (): Promise<SubmissionResponse> => {
    // Simulate API submission with detailed progress
    const tasks = [
      { name: "Validating wallet signature", duration: 1000 },
      { name: "Processing biometric embeddings", duration: 2000 },
      { name: "Verifying document authenticity", duration: 1500 },
      { name: "Creating blockchain transaction", duration: 2000 },
      { name: "Minting NFT token", duration: 2500 },
      { name: "Finalizing registration", duration: 1000 },
    ];

    let progress = 0;
    const progressIncrement = 100 / tasks.length;

    for (const task of tasks) {
      setCurrentTask(task.name);
      await new Promise((resolve) => setTimeout(resolve, task.duration));
      progress += progressIncrement;
      setSubmissionProgress(Math.min(progress, 100));
      setProgress(Math.min(progress, 100));
    }


    const payload = {
      walletAddress: registrationData.walletAddress,
      signature: registrationData.signature,
      message: registrationData.message,
      embedding: registrationData.biometricData?.embeddings || [],
      profile: registrationData.profile,
      AadharNumber: registrationData.AadharNumber,
    };

    console.log("Submitting to backend:", payload);

    // TODO: Replace with actual API call
    const response = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    return {
      success: result.message,
      tokenId: result.tokenId,
      transactionHash: result.transactionHash,
      error: result.error,
    };
  };

  const handleSubmitRegistration = async () => {
    setIsSubmitting(true);
    setStatus("submitting");
    setSubmissionProgress(0);

    try {
      // Validate required data
      const { walletAddress, signature, message, biometricData,profile,AadharNumber } =
        registrationData;

      if (
        !walletAddress ||
        !signature ||
        !message ||
        !biometricData ||
        !profile||
        !AadharNumber
      ) {
        throw new Error("Missing required registration data");
      }

      toast({
        title: "Submitting Registration",
        description: "Processing your NFT registration request...",
      });

      const result = await submitRegistrationData();

      if (result.success && result.tokenId) {
        updateRegistrationData({ tokenId: result.tokenId });
        setSubmissionResult(result);
        setStatus("completed");

        // Add to registration history
        addToHistory({
          walletAddress: registrationData.walletAddress,
          tokenId: result.tokenId,
          timestamp: Date.now(),
          status: "completed",
        });

        setCurrentStep("success");

        toast({
          title: "Registration Successful",
          description: `NFT Token created with ID: ${result.tokenId}`,
        });
      } else {
        throw new Error(result.error || "Registration failed");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorMessage = error.message || "Registration submission failed";
      setSubmissionResult({
        success: false,
        error: errorMessage,
      });
      setStatus("error");

      // Add failed attempt to history
      addToHistory({
        walletAddress: registrationData.walletAddress,
        tokenId: "",
        timestamp: Date.now(),
        status: "failed",
        error: errorMessage,
      });

      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setSubmissionResult(null);
    setSubmissionProgress(0);
    setCurrentTask("");
    setStatus("idle");
  };

  const handleBack = () => {
    setCurrentStep("signing");
  };

  // Auto-validate data on component mount
  useEffect(() => {
    const {  walletAddress, signature, message, biometricData,profile,AadharNumber } =
      registrationData;

    if (
      !walletAddress ||
      !signature ||
      !message ||
      !biometricData ||
      !profile || 
      !AadharNumber
    ) {
      toast({
        title: "Incomplete Data",
        description: "Please complete all previous steps before submission",
        variant: "destructive",
      });
    }
  }, [registrationData, toast]);

  const isDataComplete = () => {
    const { walletAddress, signature, message, biometricData, profile, AadharNumber } =
      registrationData;
    return walletAddress && signature && message && biometricData && profile && AadharNumber;
  };

  return (
    <Card className="glass-morphism nft-glow">
      <CardHeader className="text-center">
        <div
          className={`mx-auto w-16 h-16 gradient-bg rounded-full flex items-center justify-center mb-4 ${
            isSubmitting ? "animate-pulse" : "animate-pulse-slow"
          }`}
        >
          <Send className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl">Submit Registration</CardTitle>
        <CardDescription>
          Review and submit your complete NFT registration to the blockchain.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Registration Summary */}
        <div className="space-y-4">
          <h3 className="font-medium">Registration Summary</h3>
          <div className="grid gap-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">Wallet Connected</span>
              <Badge
                variant={
                  registrationData.walletAddress ? "default" : "secondary"
                }
              >
                {registrationData.walletAddress ? "✓ Complete" : "✗ Missing"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">Biometric Data</span>
              <Badge
                variant={
                  registrationData.biometricData ? "default" : "secondary"
                }
              >
                {registrationData.biometricData ? "✓ Captured" : "✗ Missing"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">Document Upload</span>
              <Badge
                variant={registrationData.profile ? "default" : "secondary"}
              >
                {registrationData.profile ? "✓ Uploaded" : "✗ Missing"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">Message Signed</span>
              <Badge
                variant={registrationData.signature ? "default" : "secondary"}
              >
                {registrationData.signature ? "✓ Signed" : "✗ Missing"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Submission Progress */}
        {isSubmitting && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="font-medium">Processing Registration...</p>
              <p className="text-sm text-muted-foreground">{currentTask}</p>
            </div>
            <Progress value={submissionProgress} className="w-full" />
            <div className="text-center text-sm text-muted-foreground">
              {Math.round(submissionProgress)}% complete
            </div>
          </div>
        )}

        {/* Error State */}
        {submissionResult && !submissionResult.success && (
          <div className="flex items-center space-x-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <div className="flex-1">
              <p className="font-medium text-destructive">Submission Failed</p>
              <p className="text-sm text-muted-foreground">
                {submissionResult.error}
              </p>
            </div>
          </div>
        )}

        {/* Success State */}
        {submissionResult && submissionResult.success && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-success/10 border border-success/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <div className="flex-1">
                <p className="font-medium text-green-500">
                  Registration Successful
                </p>
                <p className="text-sm text-muted-foreground">
                  Your NFT has been minted successfully
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      NFT Token ID
                    </span>
                    <span className="font-mono text-sm">
                      {submissionResult.tokenId}
                    </span>
                  </div>
                  {submissionResult.transactionHash && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Transaction Hash
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          window.open(
                            `https://etherscan.io/tx/${submissionResult.transactionHash}`,
                            "_blank"
                          )
                        }
                        className="h-auto p-0 text-xs hover:text-primary"
                      >
                        <span className="font-mono mr-1">
                          {submissionResult.transactionHash?.slice(0, 6)}...
                          {submissionResult.transactionHash?.slice(-4)}
                        </span>
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Validation Warning */}
        {!isDataComplete() && (
          <div className="flex items-center space-x-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <div className="flex-1">
              <p className="font-medium text-orange-500">
                Incomplete Registration
              </p>
              <p className="text-sm text-muted-foreground">
                Please complete all previous steps before submitting
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            onClick={handleBack}
            variant="outline"
            className="flex-1"
            disabled={isSubmitting}
          >
            Back
          </Button>

          {submissionResult && !submissionResult.success ? (
            <Button
              onClick={handleRetry}
              className="flex-1 gradient-bg hover:opacity-90 transition-opacity"
            >
              Retry Submission
            </Button>
          ) : (
            <Button
              onClick={handleSubmitRegistration}
              disabled={!isDataComplete() || isSubmitting}
              className="flex-1 gradient-bg hover:opacity-90 transition-opacity"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Registration
                </>
              )}
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>🔒 Your data is transmitted securely via encrypted connection</p>
          <p>Transaction will be recorded permanently on the blockchain</p>
        </div>
      </CardContent>
    </Card>
  );
};
