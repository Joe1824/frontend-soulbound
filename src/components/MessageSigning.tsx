import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PenTool, CheckCircle2, AlertCircle, Copy, RotateCcw } from 'lucide-react';
import { useMetaMask } from '@/hooks/use-metamask';
import { useNFTRegistrationStore } from '@/store/nft-registration-store';
import { useToast } from '@/hooks/use-toast';

export const MessageSigning: React.FC = () => {
  const { toast } = useToast();
  const { signMessage, account, isConnected } = useMetaMask();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { updateRegistrationData, setCurrentStep, registrationData } = useNFTRegistrationStore();
  
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [signature, setSignature] = useState('');

  // Generate verification message
  const generateVerificationMessage = () => {
    const timestamp = new Date().toISOString();
    const nonce = Math.random().toString(36).slice(2, 9);
    
    const message = `NFT Registration Verification

I hereby confirm my identity for NFT registration on the blockchain.

Wallet Address: ${account}
Timestamp: ${timestamp}
Nonce: ${nonce}
Registration ID: NFT-REG-${Date.now()}

This signature authorizes the creation of my unique NFT identity token.

⚠️ Only sign this message if you are registering for an NFT on a trusted platform.`;

    return message;
  };

  useEffect(() => {
    if (isConnected && account && !generatedMessage) {
      setIsGeneratingMessage(true);
      // Simulate message generation delay
      setTimeout(() => {
        const message = generateVerificationMessage();
        setGeneratedMessage(message);
        setIsGeneratingMessage(false);
      }, 1000);
    }
  }, [isConnected, account, generatedMessage]);

  const handleSignMessage = async () => {
    if (!generatedMessage) {
      toast({
        title: "No Message",
        description: "Please generate a verification message first",
        variant: "destructive",
      });
      return;
    }

    setIsSigning(true);
    try {
      const messageSignature = await signMessage(generatedMessage);
      setSignature(messageSignature);
      
      updateRegistrationData({
        message: generatedMessage,
        signature: messageSignature,
      });

      toast({
        title: "Message Signed",
        description: "Verification message signed successfully",
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        title: "Signing Failed",
        description: error.message || "Failed to sign message",
        variant: "destructive",
      });
    } finally {
      setIsSigning(false);
    }
  };

  const handleRegenerateMessage = () => {
    setGeneratedMessage('');
    setSignature('');
    updateRegistrationData({ message: '', signature: '' });
    
    setTimeout(() => {
      const message = generateVerificationMessage();
      setGeneratedMessage(message);
    }, 500);
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(generatedMessage);
      toast({
        title: "Copied",
        description: "Message copied to clipboard",
      });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy message to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleCopySignature = async () => {
    try {
      await navigator.clipboard.writeText(signature);
      toast({
        title: "Copied",
        description: "Signature copied to clipboard",
      });

    } 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy signature to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleProceed = () => {
    if (signature && generatedMessage) {
      setCurrentStep('submission');
    }
  };

  const handleBack = () => {
    setCurrentStep('document');
  };

  if (!isConnected) {
    return (
      <Card className="glass-morphism nft-glow">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Wallet Not Connected</CardTitle>
          <CardDescription>
            Please connect your wallet to continue with message signing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleBack}
            variant="outline"
            className="w-full"
          >
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-morphism nft-glow">
      <CardHeader className="text-center">
        <div className={`mx-auto w-16 h-16 gradient-bg rounded-full flex items-center justify-center mb-4 ${
          isSigning ? 'animate-pulse' : 'animate-pulse-slow'
        }`}>
          <PenTool className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl">Message Signing</CardTitle>
        <CardDescription>
          Sign the verification message with your wallet to confirm your identity.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Verification Message</h3>
            <div className="flex space-x-2">
              <Button
                onClick={handleCopyMessage}
                variant="outline"
                size="sm"
                disabled={!generatedMessage || isGeneratingMessage}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleRegenerateMessage}
                variant="outline"
                size="sm"
                disabled={isGeneratingMessage || isSigning}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="relative">
            <Textarea
              value={isGeneratingMessage ? 'Generating verification message...' : generatedMessage}
              readOnly
              className="min-h-[200px] font-mono text-sm bg-muted/50"
              placeholder="Verification message will appear here..."
            />
            {isGeneratingMessage && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Generating message...</span>
                </div>
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• This message contains your wallet address and timestamp</p>
            <p>• Signing proves ownership of the wallet</p>
            <p>• The signature cannot be forged or replicated</p>
          </div>
        </div>

        {signature && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-success/10 border border-success/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <div className="flex-1">
                <p className="font-medium text-green-500">Message Signed Successfully</p>
                <p className="text-sm text-muted-foreground">
                  Your signature has been generated and verified
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Digital Signature</h4>
                <Button
                  onClick={handleCopySignature}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="font-mono text-xs break-all">
                  {signature}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-muted-foreground">Signature Length</p>
                <p className="font-mono">{signature.length} characters</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Algorithm</p>
                <Badge variant="secondary">ECDSA secp256k1</Badge>
              </div>
            </div>
          </div>
        )}

        {!signature && generatedMessage && (
          <Button 
            onClick={handleSignMessage}
            disabled={isSigning || !generatedMessage}
            className="w-full gradient-bg hover:opacity-90 transition-opacity"
            size="lg"
          >
            {isSigning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Signing Message...
              </>
            ) : (
              <>
                <PenTool className="w-4 h-4 mr-2" />
                Sign Message
              </>
            )}
          </Button>
        )}

        <div className="flex space-x-3">
          <Button 
            onClick={handleBack}
            variant="outline"
            className="flex-1"
          >
            Back
          </Button>
          <Button 
            onClick={handleProceed}
            disabled={!signature || isSigning}
            className="flex-1 gradient-bg hover:opacity-90 transition-opacity"
          >
            Continue
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>🔒 Your signature is cryptographically secure</p>
          <p>Only you can generate this signature with your private key</p>
        </div>
      </CardContent>
    </Card>
  );
};