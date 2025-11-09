import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BiometricData {
  embeddings: number[];
  confidence: number;
  timestamp: number;
}

export interface RegistrationHistory {
  id: string;
  walletAddress: string;
  tokenId: string;
  timestamp: number;
  status: "completed" | "failed";
  error?: string;
}

export interface RetryConfig {
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  canRetry: boolean;
}

export interface RegistrationData {
  walletAddress: string;
  signature: string;
  message: string;
  biometricData: BiometricData | null;
  aadharFile: File | null;
  verificationResult?: unknown;
  profile?: Record<string, unknown>;
  AadharNumber?: string;
  tokenId?: string;
}

export type RegistrationStep =
  | "wallet"
  | "biometric"
  | "document"
  | "signing"
  | "submission"
  | "success"
  | "error";

export type RegistrationStatus =
  | "idle"
  | "connecting"
  | "capturing"
  | "uploading"
  | "signing"
  | "submitting"
  | "completed"
  | "error";

interface NFTRegistrationStore {
  // State
  currentStep: RegistrationStep;
  status: RegistrationStatus;
  progress: number;
  error: string | null;
  registrationData: RegistrationData;
  isWalletConnected: boolean;
  registrationHistory: RegistrationHistory[];
  retryConfig: RetryConfig;
  lastConnectionTimestamp: number;

  // Actions
  setCurrentStep: (step: RegistrationStep) => void;
  setStatus: (status: RegistrationStatus) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  updateRegistrationData: (data: Partial<RegistrationData>) => void;
  setWalletConnected: (connected: boolean) => void;
  resetRegistration: () => void;
  addToHistory: (entry: Omit<RegistrationHistory, "id">) => void;
  clearHistory: () => void;
  incrementRetryAttempt: (error?: string) => void;
  resetRetryConfig: () => void;
  updateLastConnection: () => void;

  // Computed
  getStepIndex: () => number;
  getTotalSteps: () => number;
  isStepCompleted: (step: RegistrationStep) => boolean;
  getRecentRegistrations: () => RegistrationHistory[];
  shouldAutoReconnect: () => boolean;
}

const initialRegistrationData: RegistrationData = {
  walletAddress: "",
  signature: "",
  message: "",
  biometricData: null,
  aadharFile: null,
};

export const useNFTRegistrationStore = create<NFTRegistrationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStep: "wallet",
      status: "idle",
      progress: 0,
      error: null,
      registrationData: initialRegistrationData,
      isWalletConnected: false,
      registrationHistory: [],
      retryConfig: { attempts: 0, maxAttempts: 3, canRetry: true },
      lastConnectionTimestamp: 0,

      // Actions
      setCurrentStep: (step) => set({ currentStep: step }),
      setStatus: (status) => set({ status }),
      setProgress: (progress) => set({ progress }),
      setError: (error) => set({ error }),

      updateRegistrationData: (data) =>
        set((state) => ({
          registrationData: { ...state.registrationData, ...data },
        })),

      setWalletConnected: (connected) => set({ isWalletConnected: connected }),

      resetRegistration: () =>
        set({
          currentStep: "wallet",
          status: "idle",
          progress: 0,
          error: null,
          registrationData: initialRegistrationData,
          isWalletConnected: false,
          retryConfig: { attempts: 0, maxAttempts: 3, canRetry: true },
        }),

      addToHistory: (entry) =>
        set((state) => ({
          registrationHistory: [
            { ...entry, id: crypto.randomUUID() },
            ...state.registrationHistory.slice(0, 9), // Keep last 10
          ],
        })),

      clearHistory: () => set({ registrationHistory: [] }),

      incrementRetryAttempt: (error) =>
        set((state) => ({
          retryConfig: {
            attempts: state.retryConfig.attempts + 1,
            maxAttempts: state.retryConfig.maxAttempts,
            lastError: error,
            canRetry:
              state.retryConfig.attempts < state.retryConfig.maxAttempts - 1,
          },
        })),

      resetRetryConfig: () =>
        set({ retryConfig: { attempts: 0, maxAttempts: 3, canRetry: true } }),

      updateLastConnection: () => set({ lastConnectionTimestamp: Date.now() }),

      // Computed values
      getStepIndex: () => {
        const steps: RegistrationStep[] = [
          "wallet",
          "biometric",
          "document",
          "signing",
          "submission",
          "success",
        ];
        return steps.indexOf(get().currentStep);
      },

      getTotalSteps: () => 6,

      isStepCompleted: (step) => {
        const { registrationData, isWalletConnected } = get();
        switch (step) {
          case "wallet":
            return isWalletConnected && !!registrationData.walletAddress;
          case "biometric":
            return !!registrationData.biometricData;
          case "document":
            return !!registrationData.aadharFile;
          case "signing":
            return !!registrationData.signature && !!registrationData.message;
          case "submission":
            return !!registrationData.tokenId;
          default:
            return false;
        }
      },

      getRecentRegistrations: () => {
        return get().registrationHistory.slice(0, 5);
      },

      shouldAutoReconnect: () => {
        const { lastConnectionTimestamp, isWalletConnected } = get();
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        return (
          !isWalletConnected &&
          lastConnectionTimestamp > 0 &&
          now - lastConnectionTimestamp < fiveMinutes
        );
      },
    }),
    {
      name: "nft-registration-storage",
      // Only persist essential data, not temporary states
      partialize: (state) => ({
        registrationData: {
          walletAddress: state.registrationData.walletAddress,
        },
        isWalletConnected: state.isWalletConnected,
        registrationHistory: state.registrationHistory,
        lastConnectionTimestamp: state.lastConnectionTimestamp,
      }),
    }
  )
);
