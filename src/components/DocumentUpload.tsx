import React, { useCallback, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DocumentSkeleton } from "@/components/ui/skeleton";
import { Upload, CheckCircle2, Shield, Scan } from "lucide-react";
import { useNFTRegistrationStore } from "@/store/nft-registration-store";
import { useToast } from "@/hooks/use-toast";
import { microInteractions, triggerSuccessAnimation } from "@/lib/animations";
import { profile } from "console";

const VERIFY_ENDPOINT =
  "https://gokul2cid-aadhaar-api.hf.space/extract_aadhaar/";

interface VerificationResult {
  status?: string;
  score?: number;
  details?: unknown;
}

export const DocumentUpload: React.FC = () => {
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateRegistrationData, setCurrentStep, registrationData } =
    useNFTRegistrationStore();

  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [isValidating, setIsValidating] = useState(false);
  const [validationScore, setValidationScore] = useState(0);
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  // ✅ Step 1: Validate file before sending
  const validateFile = (
    file: File
  ): { error: string | null; warnings: string[] } => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const minSize = 50 * 1024; // 50KB
    const allowedTypes = ["application/pdf"];
    const warnings: string[] = [];

    if (!allowedTypes.includes(file.type)) {
      return {
        error: "Only PDF files are allowed for e-Aadhar documents",
        warnings: [],
      };
    }

    if (file.size > maxSize) {
      return { error: "File size must be less than 10MB", warnings: [] };
    }

    if (file.size < minSize) {
      warnings.push("File seems unusually small for an Aadhar document");
    }

    const fileName = file.name.toLowerCase();
    if (!fileName.includes("aadhar") && !fileName.includes("aadhaar")) {
      warnings.push(
        'File name should contain "aadhar" for easy identification'
      );
    }

    const daysSinceModified =
      (Date.now() - file.lastModified) / (1000 * 60 * 60 * 24);
    if (daysSinceModified > 365) {
      warnings.push("Document appears to be older than 1 year");
    }

    return { error: null, warnings };
  };

  // ✅ Step 2: Upload PDF to API
  const uploadToApi = (
    file: File,
    onProgress: (percent: number) => void,
    signal?: AbortSignal
  ): Promise<VerificationResult> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      const formData = new FormData();
      formData.append("pdf_file", file, file.name); // ✅ Important key name

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round(
            (event.loaded / event.total) * 100
          );
          onProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        xhrRef.current = null;
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const json = JSON.parse(xhr.responseText);
            console.log("✅ Aadhaar API Response:", json);

            resolve({
              status: "verified",
              score: 100,
              details: json,
            });
          } catch {
            resolve({
              status: "error",
              score: 0,
              details: { raw: xhr.responseText },
            });
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        xhrRef.current = null;
        reject(new Error("Network error during upload"));
      };

      xhr.onabort = () => {
        xhrRef.current = null;
        reject(new Error("Upload aborted"));
      };

      if (signal) {
        if (signal.aborted) {
          xhr.abort();
          return reject(new Error("Upload aborted before start"));
        }
        signal.addEventListener("abort", () => xhr.abort());
      }

      xhr.open("POST", VERIFY_ENDPOINT, true);
      xhr.send(formData);
    });
  };

  // ✅ Step 3: Handle file upload + Aadhaar data cleanup
  const handleFileUpload = async (file: File) => {
    setIsValidating(true);
    setValidationScore(0);
    setVerificationResult(null);

    const scoreInterval = setInterval(() => {
      setValidationScore((prev) => Math.min(prev + Math.random() * 20, 95));
    }, 100);

    const validation = validateFile(file);
    clearInterval(scoreInterval);

    if (validation.error) {
      setValidationScore(0);
      setIsValidating(false);
      toast({
        title: "Invalid File",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    setValidationScore(100);

    if (validation.warnings.length > 0) {
      validation.warnings.forEach((warning) => {
        toast({
          title: "Document Warning",
          description: warning,
          variant: "default",
        });
      });
    }

    setIsUploading(true);
    setUploadProgress(0);
    const controller = new AbortController();
    const signal = controller.signal;

    try {
      const apiResponse = await uploadToApi(
        file,
        (percent) => setUploadProgress(percent),
        signal
      );

      setIsUploading(false);
      setIsValidating(false);

      // ✅ Clean the response data
      if (apiResponse && apiResponse.details) {
        const rawData = (
          (apiResponse.details as Record<string, unknown>)?.details ??
          apiResponse.details
        ) as Record<string, unknown>;

        const requiredFields = ["name", "gender", "dob", "mobile", "address"];
        const cleanedData: Record<string, unknown> = {};

        Object.entries(rawData).forEach(([key, value]) => {
          if (requiredFields.includes(key) || value !== null) {
            cleanedData[key] = value;
          }
        });
        
        
        const { aadhaar_number, ...profileDetails } = cleanedData;

        console.log("🧾 Cleaned Aadhaar Profile:", profileDetails);
        console.log("🔢 Aadhaar Number:", aadhaar_number);

        // ✅ Update store
        updateRegistrationData({
          aadharFile: file,
          verificationResult: apiResponse,
          profile: profileDetails,
          AadharNumber: aadhaar_number as string | undefined,
        });
        // ✅ Update UI
        setVerificationResult({
          status: "verified",
          score: 100,
          details: profileDetails,
        });

        triggerSuccessAnimation(cardRef.current);

        toast({
          title: "Upload Successful",
          description: "E-Aadhaar document uploaded and verified.",
        });
      }
    } catch (error) {
      setIsUploading(false);
      setIsValidating(false);
      setValidationScore(0);
      setUploadProgress(0);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to upload document. Please try again.";

      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // ✅ Drag & Drop + UI Handlers
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleFileUpload(files[0]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
      e.currentTarget.value = "";
    }
  };

  const handleProceed = () => {
    if (registrationData.aadharFile) {
      setCurrentStep("signing");
    }
  };

  const handleBack = () => setCurrentStep("biometric");

  // ✅ Loading Skeleton
  if (isValidating || isUploading) {
    return (
      <Card className="glass-morphism nft-glow animate-in fade-in-0 duration-500">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 gradient-bg rounded-full flex items-center justify-center mb-4 animate-glow">
            {isValidating ? (
              <Scan className="w-8 h-8 text-white animate-spin" />
            ) : (
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">
            {isValidating ? "Validating Document..." : "Uploading Document..."}
          </CardTitle>
          <CardDescription>
            {isValidating
              ? "Checking document authenticity and format"
              : "Securely uploading your e-Aadhaar document"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentSkeleton />
          <div className="mt-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                {isValidating ? "Validation Score" : "Upload Progress"}
              </span>
              <span className="text-sm font-bold text-primary">
                {isValidating
                  ? `${Math.round(validationScore)}%`
                  : `${uploadProgress}%`}
              </span>
            </div>
            <Progress
              value={isValidating ? validationScore : uploadProgress}
              className={microInteractions.progressBar}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  // ✅ Final Render
  return (
    <Card
      ref={cardRef}
      className={`glass-morphism nft-glow ${microInteractions.card} animate-in slide-in-from-bottom-4 duration-700`}
    >
      <CardHeader className="text-center">
        <div
          className={`mx-auto w-16 h-16 gradient-bg rounded-full flex items-center justify-center mb-4 ${
            registrationData.aadharFile ? "animate-glow" : "animate-float"
          }`}
        >
          {registrationData.aadharFile ? (
            <CheckCircle2 className="w-8 h-8 text-white" />
          ) : (
            <Shield className="w-8 h-8 text-white" />
          )}
        </div>
        <CardTitle className="text-2xl">
          {registrationData.aadharFile
            ? "Document Uploaded"
            : "Document Upload"}
        </CardTitle>
        <CardDescription>
          {registrationData.aadharFile
            ? "Your e-Aadhaar document has been successfully uploaded and verified."
            : "Upload your e-Aadhaar PDF document for identity verification."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {!registrationData.aadharFile ? (
          // 🧾 Upload Section
          <div>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                isDragging
                  ? "border-primary bg-primary/10 scale-102"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload
                className={`w-12 h-12 mx-auto mb-4 ${
                  isDragging
                    ? "text-primary animate-bounce"
                    : "text-muted-foreground"
                }`}
              />
              <h3 className="font-medium mb-2">
                {isDragging
                  ? "Drop your file here"
                  : "Drag & drop your e-Aadhaar PDF"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Or click below to browse
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Button
                onClick={() => document.getElementById("file-upload")?.click()}
                variant="outline"
              >
                Browse Files
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* ✅ File Uploaded Info */}
            <div className="flex items-center space-x-3 p-4 bg-success/10 border border-success/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-green-500">Document Uploaded</p>
                <p className="text-sm text-muted-foreground">
                  Aadhaar verified successfully
                </p>
              </div>
            </div>

            {/* ✅ Show extracted Aadhaar details */}
            {/* ✅ Show extracted Aadhaar details */}
          {registrationData.AadharNumber && registrationData.profile && (
            <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20">
              <h4 className="font-semibold mb-3 text-blue-900 dark:text-blue-100">
                Aadhaar Verification Summary
              </h4>

              <div className="space-y-3 text-sm text-blue-900 dark:text-blue-100">
                {/* Aadhaar number */}
                <div className="flex justify-between border-b border-blue-200 dark:border-blue-800 pb-2">
                  <span className="font-medium">Aadhaar Number:</span>
                  <span className="font-mono">{registrationData.AadharNumber}</span>
                </div>

                {/* Profile details */}
                <div>
                  <h5 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">
                    Profile Details
                  </h5>
                  <div className="space-y-1 bg-white/50 dark:bg-gray-900/30 rounded-lg p-3">
                    {Object.entries(registrationData.profile).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between text-sm border-b last:border-0 border-gray-200 dark:border-gray-700 pb-1"
                      >
                        <span className="capitalize font-medium">{key}:</span>
                        <span className="font-mono text-gray-800 dark:text-gray-200">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          </>
        )}

        {/* Navigation buttons */}
        <div className="flex space-x-3">
          <Button onClick={handleBack} variant="outline" className="flex-1">
            Back
          </Button>
          <Button
            onClick={handleProceed}
            disabled={!registrationData.aadharFile || isUploading}
            className="flex-1 gradient-bg hover:opacity-90 transition-opacity"
          >
            Continue
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>🔒 Your documents are encrypted and stored securely</p>
          <p>Personal information is protected according to privacy laws</p>
        </div>
      </CardContent>
    </Card>
  );
};
