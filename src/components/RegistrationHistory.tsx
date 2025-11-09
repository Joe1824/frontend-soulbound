import React from "react";
import { Clock, CheckCircle, XCircle, Trash2, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNFTRegistrationStore } from "@/store/nft-registration-store";

interface RegistrationHistoryProps {
  className?: string;
}

const RegistrationHistory: React.FC<RegistrationHistoryProps> = ({
  className = "",
}) => {
  const { registrationHistory, clearHistory, getRecentRegistrations } =
    useNFTRegistrationStore();

  const recentRegistrations = getRecentRegistrations();

  const formatTimestamp = (timestamp: number) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));
  };

  const formatWalletAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (registrationHistory.length === 0) {
    return (
      <Card
        className={`bg-white/80 backdrop-blur-sm border-gray-200 ${className}`}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Clock className="h-5 w-5" />
            Registration History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">No registration history yet</p>
            <p className="text-gray-400 text-xs mt-1">
              Complete your first NFT registration to see it here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`bg-white/80 backdrop-blur-sm border-gray-200 ${className}`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Clock className="h-5 w-5" />
            Registration History
            <Badge variant="secondary" className="ml-2">
              {registrationHistory.length}
            </Badge>
          </CardTitle>

          {registrationHistory.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {recentRegistrations.map((entry, index) => (
          <div key={entry.id}>
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {entry.status === "completed" ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-gray-900">
                      {formatWalletAddress(entry.walletAddress)}
                    </span>
                    <Badge
                      variant={
                        entry.status === "completed" ? "default" : "destructive"
                      }
                      className="text-xs"
                    >
                      {entry.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-gray-500">
                    {formatTimestamp(entry.timestamp)}
                  </p>

                  {entry.tokenId && (
                    <p className="text-xs text-blue-600 mt-1 font-mono">
                      Token ID: {entry.tokenId}
                    </p>
                  )}

                  {entry.error && (
                    <p className="text-xs text-red-600 mt-1">
                      Error: {entry.error}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {entry.tokenId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(entry.tokenId!)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {index < recentRegistrations.length - 1 && (
              <Separator className="my-2" />
            )}
          </div>
        ))}

        {registrationHistory.length > 5 && (
          <div className="text-center pt-2">
            <p className="text-xs text-gray-500">
              Showing recent 5 of {registrationHistory.length} registrations
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RegistrationHistory;
