import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, ExternalLink, Download, Share2, RotateCcw, Copy } from 'lucide-react';
import { useNFTRegistrationStore } from '@/store/nft-registration-store';
import { useToast } from '@/hooks/use-toast';

export const RegistrationSuccess: React.FC = () => {
  const { toast } = useToast();
  const { registrationData, resetRegistration } = useNFTRegistrationStore();

  const handleCopyTokenId = async () => {
    if (registrationData.tokenId) {
      try {
        await navigator.clipboard.writeText(registrationData.tokenId);
        toast({
          title: "Copied",
          description: "Token ID copied to clipboard",
        });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast({
          title: "Copy Failed",
          description: "Failed to copy token ID",
          variant: "destructive",
        });
      }
    }
  };

  const handleViewOnExplorer = () => {
    // This would typically open the NFT on a blockchain explorer
    // For now, we'll simulate opening a generic explorer
    window.open('https://etherscan.io/', '_blank');
  };

  const handleDownloadCertificate = () => {
    // Simulate certificate download
    toast({
      title: "Download Started",
      description: "Your NFT certificate is being generated...",
    });
    
    // In a real implementation, this would generate and download a PDF certificate
    setTimeout(() => {
      toast({
        title: "Certificate Ready",
        description: "Your NFT registration certificate has been downloaded",
      });
    }, 2000);
  };

  const handleShareSuccess = async () => {
    const shareData = {
      title: 'NFT Registration Successful',
      text: `I've successfully registered my NFT with token ID: ${registrationData.tokenId}`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(
          `🎉 NFT Registration Successful!\n\nToken ID: ${registrationData.tokenId}\n\nRegistered on blockchain with secure biometric verification.`
        );
        toast({
          title: "Copied to Clipboard",
          description: "Share text copied to clipboard",
        });
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Failed to share registration details",
        variant: "destructive",
      });
    }
  };

  const handleNewRegistration = () => {
    resetRegistration();
    toast({
      title: "Registration Reset",
      description: "Ready for a new NFT registration",
    });
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card className="glass-morphism nft-glow">
      <CardHeader className="text-center">
        <div className="mx-auto w-20 h-20 gradient-bg rounded-full flex items-center justify-center mb-6 animate-pulse-slow">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <CardTitle className="text-3xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Registration Successful!
        </CardTitle>
        <CardDescription className="text-lg">
          Your NFT identity token has been created and registered on the blockchain.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-8">
        {/* Success Confirmation */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-success/10 border border-success/20 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-500 font-medium">Blockchain Confirmed</span>
          </div>
          
          <p className="text-muted-foreground">
            Your unique digital identity NFT is now secured on the blockchain with biometric verification.
          </p>
        </div>

        {/* NFT Details */}
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Your NFT Details</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">NFT Token ID</p>
                  <p className="font-mono text-lg font-semibold">{registrationData.tokenId}</p>
                </div>
                <Button
                  onClick={handleCopyTokenId}
                  variant="ghost"
                  size="sm"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Wallet Address</p>
                <p className="font-mono text-sm">
                  {registrationData.walletAddress?.slice(0, 6)}...{registrationData.walletAddress?.slice(-4)}
                </p>
              </div>
              
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Registration Time</p>
                <p className="text-sm">
                  {registrationData.biometricData ? formatTimestamp(registrationData.biometricData.timestamp) : 'N/A'}
                </p>
              </div>
            </div>

            {registrationData.biometricData && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Biometric Confidence</p>
                    <p className="text-sm font-medium">
                      {Math.round(registrationData.biometricData.confidence * 100)}% Match
                    </p>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={
                      registrationData.biometricData.confidence >= 0.9 
                        ? 'text-green-500' 
                        : registrationData.biometricData.confidence >= 0.7 
                        ? 'text-yellow-500' 
                        : 'text-red-500'
                    }
                  >
                    {registrationData.biometricData.confidence >= 0.9 
                      ? 'Excellent' 
                      : registrationData.biometricData.confidence >= 0.7 
                      ? 'Good' 
                      : 'Fair'}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={handleViewOnExplorer}
              variant="outline"
              className="w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View on Explorer
            </Button>
            
            <Button 
              onClick={handleDownloadCertificate}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Certificate
            </Button>
          </div>

          <Button 
            onClick={handleShareSuccess}
            variant="outline"
            className="w-full"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Success
          </Button>
          
          <Button 
            onClick={handleNewRegistration}
            className="w-full gradient-bg hover:opacity-90 transition-opacity"
            size="lg"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Register Another NFT
          </Button>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="space-y-2">
            <h4 className="font-medium text-blue-900 dark:text-blue-100">🔒 Security Notice</h4>
            <div className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
              <p>• Your NFT is secured with biometric verification</p>
              <p>• Token ownership is cryptographically proven</p>
              <p>• Registration data is immutably stored on blockchain</p>
              <p>• Keep your wallet secure to maintain NFT ownership</p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-lg p-4">
          <div className="space-y-2">
            <h4 className="font-medium">🚀 What's Next?</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Your NFT can be viewed in compatible wallets</p>
              <p>• Use your Token ID for verification purposes</p>
              <p>• Monitor your NFT status on blockchain explorers</p>
              <p>• Keep your registration certificate safe</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};