import React from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNFTRegistrationStore } from '@/store/nft-registration-store';

interface ErrorHandlerProps {
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const ErrorHandler: React.FC<ErrorHandlerProps> = ({
  onRetry,
  onDismiss,
  className = "",
}) => {
  const { error, retryConfig, resetRetryConfig } = useNFTRegistrationStore();

  if (!error) return null;

  const getErrorDetails = (errorMessage: string) => {
    if (errorMessage.includes('User rejected')) {
      return {
        title: 'Transaction Rejected',
        description: 'You rejected the transaction. Please try again and approve the transaction.',
        type: 'user' as const,
        canRetry: true,
      };
    }
    
    if (errorMessage.includes('MetaMask')) {
      return {
        title: 'MetaMask Connection Error',
        description: 'Unable to connect to MetaMask. Please ensure it\'s installed and unlocked.',
        type: 'wallet' as const,
        canRetry: true,
      };
    }
    
    if (errorMessage.includes('network')) {
      return {
        title: 'Network Error',
        description: 'Connection failed. Please check your internet connection.',
        type: 'network' as const,
        canRetry: true,
      };
    }
    
    if (errorMessage.includes('biometric')) {
      return {
        title: 'Biometric Capture Failed',
        description: 'Unable to capture biometric data. Please ensure camera permissions are granted.',
        type: 'biometric' as const,
        canRetry: true,
      };
    }
    
    return {
      title: 'Registration Error',
      description: errorMessage,
      type: 'general' as const,
      canRetry: true,
    };
  };

  const errorDetails = getErrorDetails(error);
  const canRetry = retryConfig.canRetry && errorDetails.canRetry && onRetry;

  const handleRetry = () => {
    if (onRetry && canRetry) {
      resetRetryConfig();
      onRetry();
    }
  };

  const handleDismiss = () => {
    resetRetryConfig();
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <Card className={`border-red-200 bg-red-50/50 backdrop-blur-sm ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-semibold text-red-800">
                {errorDetails.title}
              </h3>
              <Badge 
                variant="secondary" 
                className="text-xs bg-red-100 text-red-700 border-red-200"
              >
                {errorDetails.type}
              </Badge>
            </div>
            
            <p className="text-sm text-red-700 mb-4">
              {errorDetails.description}
            </p>
            
            {retryConfig.attempts > 0 && (
              <p className="text-xs text-red-600 mb-4">
                Attempt {retryConfig.attempts} of {retryConfig.maxAttempts}
              </p>
            )}
            
            <div className="flex gap-2">
              {canRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-red-700 hover:bg-red-100"
              >
                <X className="h-4 w-4 mr-2" />
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorHandler;