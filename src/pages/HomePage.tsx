import React, { useState } from 'react';
import { ProgressTracker } from '@/components/ProgressTracker';
import { WalletConnect } from '@/components/WalletConnect';
import { BiometricCapture } from '@/components/BiometricCapture';
import { DocumentUpload } from '@/components/DocumentUpload';
import { MessageSigning } from '@/components/MessageSigning';
import { RegistrationSubmission } from '@/components/RegistrationSubmission';
import { RegistrationSuccess } from '@/components/RegistrationSuccess';
import ErrorHandler from '@/components/ErrorHandler';
import RegistrationHistory from '@/components/RegistrationHistory';
import { Button } from '@/components/ui/button';
import { History, X } from 'lucide-react';
import { useNFTRegistrationStore } from '@/store/nft-registration-store';

export const HomePage: React.FC = () => {
  const { currentStep, error, setError, registrationHistory } = useNFTRegistrationStore();
  const [showHistory, setShowHistory] = useState(false);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'wallet':
        return <WalletConnect />;
      case 'biometric':
        return <BiometricCapture />;
      case 'document':
        return <DocumentUpload />;
      case 'signing':
        return <MessageSigning />;
      case 'submission':
        return <RegistrationSubmission />;
      case 'success':
        return <RegistrationSuccess />;
      default:
        return <WalletConnect />;
    }
  };

  return (
    <div className="min-h-screen bg-nft-pattern">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-background/95" />
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">N</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              NFT Registration
            </h1>
          </div>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Secure your digital identity on the blockchain with biometric verification and cryptographic proof.
          </p>
          
          <div className="flex items-center justify-center space-x-6 mt-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Blockchain Secured</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span>Biometric Verified</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <span>Cryptographically Signed</span>
            </div>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="mb-12">
          <ProgressTracker />
        </div>

        {/* Error Handler */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <ErrorHandler 
              onRetry={() => window.location.reload()}
              onDismiss={() => setError(null)}
            />
          </div>
        )}

        {/* History Button - Show when there's history and not in success step */}
        {registrationHistory.length > 0 && currentStep !== 'success' && !showHistory && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(true)}
                className="bg-white/80 backdrop-blur-sm"
              >
                <History className="h-4 w-4 mr-2" />
                View History ({registrationHistory.length})
              </Button>
            </div>
          </div>
        )}

        {/* Registration History Panel */}
        {showHistory && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <RegistrationHistory />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          {renderCurrentStep()}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <div className="space-y-2">
            <p>Powered by blockchain technology and secure cryptography</p>
            <div className="flex items-center justify-center space-x-4">
              <span>🔒 End-to-end encrypted</span>
              <span>•</span>
              <span>⚡ Lightning fast</span>
              <span>•</span>
              <span>🌍 Globally accessible</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};