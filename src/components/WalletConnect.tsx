import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WalletSkeleton } from '@/components/ui/skeleton';
import { Wallet, ExternalLink, CheckCircle2, AlertCircle, RefreshCw, Clock, Zap } from 'lucide-react';
import { useMetaMask } from '@/hooks/use-metamask';
import { useNFTRegistrationStore } from '@/store/nft-registration-store';
import { useToast } from '@/hooks/use-toast';
import { microInteractions, triggerSuccessAnimation, triggerErrorAnimation } from '@/lib/animations';

export const WalletConnect: React.FC = () => {
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const { 
    isConnected, 
    account, 
    chainId, 
    isInstalled, 
    isLoading, 
    connectWallet, 
    disconnectWallet 
  } = useMetaMask();
  
  const { 
    updateRegistrationData, 
    setWalletConnected, 
    setCurrentStep, 
    shouldAutoReconnect,
    updateLastConnection,
    retryConfig,
    incrementRetryAttempt,
    resetRetryConfig 
  } = useNFTRegistrationStore();

  const [isAttemptingReconnect, setIsAttemptingReconnect] = useState(false);
  const [connectionHistory, setConnectionHistory] = useState<string[]>([]);
  const [showConnectionAnimation, setShowConnectionAnimation] = useState(false);

  // Auto-reconnection logic
  useEffect(() => {
    const attemptAutoReconnect = async () => {
      if (shouldAutoReconnect() && !isConnected && !isAttemptingReconnect) {
        setIsAttemptingReconnect(true);
        try {
          const walletAddress = await connectWallet();
          if (walletAddress) {
            updateRegistrationData({ walletAddress });
            setWalletConnected(true);
            updateLastConnection();
            resetRetryConfig();
            toast({
              title: "Auto-Reconnected",
              description: "Successfully reconnected to your wallet",
            });
          }
        } catch (error) {
          console.log('Auto-reconnection failed:', error);
        } finally {
          setIsAttemptingReconnect(false);
        }
      }
    };

    attemptAutoReconnect();
  }, []);

  const handleConnect = async () => {
    try {
      setShowConnectionAnimation(true);
      const walletAddress = await connectWallet();
      if (walletAddress) {
        updateRegistrationData({ walletAddress });
        setWalletConnected(true);
        updateLastConnection();
        resetRetryConfig();
        
        // Add to connection history
        const timestamp = new Date().toLocaleTimeString();
        setConnectionHistory(prev => [`Connected at ${timestamp}`, ...prev.slice(0, 4)]);
        
        // Trigger success animation
        setTimeout(() => {
          triggerSuccessAnimation(cardRef.current);
          setShowConnectionAnimation(false);
        }, 500);
        
        toast({
          title: "Wallet Connected",
          description: "Successfully connected to MetaMask",
        });
      }
    } catch (error) {
      setShowConnectionAnimation(false);
      incrementRetryAttempt(error instanceof Error ? error.message : 'Connection failed');
      triggerErrorAnimation(buttonRef.current);
      toast({
        title: "Connection Failed", 
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleRetryConnect = async () => {
    if (retryConfig.canRetry) {
      await handleConnect();
    }
  };

  const handleProceed = () => {
    if (isConnected && account) {
      setCurrentStep('biometric');
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    updateRegistrationData({ walletAddress: '' });
    setWalletConnected(false);
    
    // Add to connection history
    const timestamp = new Date().toLocaleTimeString();
    setConnectionHistory(prev => [`Disconnected at ${timestamp}`, ...prev.slice(0, 4)]);
    
    toast({
      title: "Wallet Disconnected",
      description: "Successfully disconnected from MetaMask",
    });
  };

  const getChainName = (chainId: string | null) => {
    switch (chainId) {
      case '0x1': return 'Ethereum Mainnet';
      case '0x5': return 'Goerli Testnet';
      case '0xaa36a7': return 'Sepolia Testnet';
      case '0x89': return 'Polygon Mainnet';
      case '0x13881': return 'Mumbai Testnet';
      default: return 'Unknown Network';
    }
  };

  if (!isInstalled) {
    return (
      <Card className="glass-morphism nft-glow">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">MetaMask Required</CardTitle>
          <CardDescription>
            Please install MetaMask browser extension to connect your wallet and proceed with NFT registration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => window.open('https://metamask.io/', '_blank')}
            className="w-full gradient-bg hover:opacity-90 transition-opacity"
            size="lg"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Install MetaMask
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            After installation, please refresh this page to continue.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Show loading skeleton during initial connection attempts
  if (isLoading || isAttemptingReconnect || showConnectionAnimation) {
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
          <CardTitle className="text-2xl">
            {isAttemptingReconnect ? 'Reconnecting...' : 'Connecting Wallet...'}
          </CardTitle>
          <CardDescription>
            Please confirm the connection in your MetaMask extension
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WalletSkeleton />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card ref={cardRef} className={`glass-morphism nft-glow ${microInteractions.card} animate-in slide-in-from-bottom-4 duration-700`}>
      <CardHeader className="text-center">
        <div className={`mx-auto w-16 h-16 gradient-bg rounded-full flex items-center justify-center mb-4 ${isConnected ? 'animate-glow' : 'animate-float'}`}>
          {isConnected ? (
            <CheckCircle2 className="w-8 h-8 text-white animate-in zoom-in-50 duration-300" />
          ) : (
            <Wallet className="w-8 h-8 text-white" />
          )}
        </div>
        <CardTitle className="text-2xl animate-in fade-in-0 duration-500 delay-200">
          {isConnected ? 'Wallet Connected' : 'Connect Your Wallet'}
        </CardTitle>
        <CardDescription className="animate-in fade-in-0 duration-500 delay-300">
          {isConnected 
            ? 'Your MetaMask wallet is successfully connected and ready for NFT registration.'
            : 'Connect your MetaMask wallet to start the NFT registration process.'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!isConnected ? (
          <div className="animate-in slide-in-from-bottom-4 duration-500 delay-400">
            <div className="space-y-4">
              <div className={`flex items-center justify-between p-4 bg-muted/50 rounded-lg ${microInteractions.cardInteractive} group`}>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Wallet className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">MetaMask</p>
                    <p className="text-sm text-muted-foreground">Browser Extension</p>
                  </div>
                </div>
                <Badge variant="secondary" className="group-hover:scale-105 transition-transform duration-200">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse-slow"></div>
                  Available
                </Badge>
              </div>
            </div>
            
            <Button 
              ref={buttonRef}
              onClick={handleConnect}
              disabled={isLoading}
              className={`w-full gradient-bg ${microInteractions.buttonPrimary} group`}
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  <span className="animate-pulse">Connecting...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                  <span className="group-hover:animate-pulse">Connect MetaMask</span>
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
            <div className="space-y-4">
              <div className={`flex items-center space-x-3 p-4 bg-success/10 border border-success/20 rounded-lg ${microInteractions.card} animate-in fade-in-0 duration-300`}>
                <CheckCircle2 className="w-5 h-5 text-green-500 animate-in zoom-in-50 duration-300" />
                <div className="flex-1">
                  <p className="font-medium text-green-500 animate-in slide-in-from-left-2 duration-300 delay-100">
                    Wallet Connected
                  </p>
                  <p className="text-sm text-muted-foreground font-mono animate-in slide-in-from-left-2 duration-300 delay-200">
                    {account?.slice(0, 6)}...{account?.slice(-4)}
                  </p>
                </div>
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse-slow"></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm animate-in fade-in-0 duration-400 delay-300">
                <div className={`space-y-1 p-3 rounded-lg bg-muted/30 ${microInteractions.card}`}>
                  <p className="text-muted-foreground">Network</p>
                  <p className="font-medium">{getChainName(chainId)}</p>
                </div>
                <div className={`space-y-1 p-3 rounded-lg bg-muted/30 ${microInteractions.card}`}>
                  <p className="text-muted-foreground">Chain ID</p>
                  <p className="font-mono">{chainId}</p>
                </div>
              </div>
              
              {connectionHistory.length > 0 && (
                <div className="animate-in fade-in-0 duration-500 delay-400">
                  <p className="text-sm font-medium mb-2">Recent Activity</p>
                  <div className="space-y-1 max-h-20 overflow-y-auto">
                    {connectionHistory.slice(0, 3).map((event, index) => (
                      <div key={index} className={`text-xs text-muted-foreground p-2 bg-muted/20 rounded animate-in slide-in-from-right-2 duration-300`} style={{ animationDelay: `${index * 50}ms` }}>
                        <Clock className="w-3 h-3 inline mr-1" />
                        {event}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3 animate-in slide-in-from-bottom-2 duration-400 delay-500">
              <Button 
                onClick={handleDisconnect}
                variant="outline"
                className={`flex-1 ${microInteractions.buttonSecondary}`}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
              <Button 
                onClick={handleProceed}
                className={`flex-1 gradient-bg ${microInteractions.buttonPrimary} group`}
              >
                <span className="group-hover:animate-pulse">Continue</span>
                <CheckCircle2 className="w-4 h-4 ml-2 group-hover:animate-bounce" />
              </Button>
            </div>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground text-center space-y-1 animate-in fade-in-0 duration-500 delay-700">
          <p className="animate-float">🔒 Your wallet connection is secure and encrypted</p>
          <p>We never store your private keys or sensitive data</p>
        </div>
      </CardContent>
    </Card>
  );
};