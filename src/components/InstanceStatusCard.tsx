import { useState, useEffect, useCallback, useRef } from "react";
import { CheckCircle2, XCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";

interface InstanceStatusCardProps {
  apiToken: string;
  instanceName?: string;
  onReconnect?: () => void;
}

interface InstanceData {
  Connected: boolean;
  LoggedIn: boolean;
  Name?: string;
  PhoneNumber?: string;
}

const API_BASE = "https://webhook.relaxsolucoes.online/webhook";

const InstanceStatusCard = ({ apiToken, instanceName, onReconnect }: InstanceStatusCardProps) => {
  const [status, setStatus] = useState<InstanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const checkStatus = useCallback(async (showLoading = false) => {
    if (showLoading) setIsChecking(true);

    try {
      const response = await fetch(`${API_BASE}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apikey: apiToken }),
      });

      const data = await response.json();
      console.log("Status response:", data);

      let instanceData: InstanceData | null = null;
      if (Array.isArray(data) && data.length > 0) {
        instanceData = data[0].data;
      } else if (data.data) {
        instanceData = data.data;
      }

      if (instanceData) {
        setStatus(instanceData);
      }
    } catch (error) {
      console.error("Error checking status:", error);
    } finally {
      setIsLoading(false);
      if (showLoading) setIsChecking(false);
    }
  }, [apiToken]);

  const handleReconnect = async () => {
    setIsReconnecting(true);
    try {
      const response = await fetch(`${API_BASE}/conectar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apikey: apiToken }),
      });

      const data = await response.json();
      console.log("Reconnect response:", data);

      if (data.data?.Qrcode) {
        // Call parent callback if provided
        if (onReconnect) {
          onReconnect();
        }
      }
    } catch (error) {
      console.error("Error reconnecting:", error);
    } finally {
      setIsReconnecting(false);
      // Check status after reconnect attempt
      checkStatus(false);
    }
  };

  const handleManualCheck = () => {
    checkStatus(true);
  };

  // Initial check
  useEffect(() => {
    checkStatus(false);
  }, [checkStatus]);

  // Start polling every 10 seconds
  useEffect(() => {
    pollingRef.current = setInterval(() => {
      checkStatus(false);
    }, 10000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [checkStatus]);

  const isConnected = status?.Connected && status?.LoggedIn;

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <div className={`border-2 rounded-lg p-6 transition-all ${
        isConnected
          ? 'border-success bg-success/5'
          : 'border-destructive bg-destructive/5'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isConnected ? 'bg-success/10' : 'bg-destructive/10'
            }`}>
              {isConnected ? (
                <Wifi className="w-6 h-6 text-success" />
              ) : (
                <WifiOff className="w-6 h-6 text-destructive" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {instanceName || "Instância WhatsApp"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {status?.Name || "Carregando..."}
              </p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isConnected
              ? 'bg-success text-success-foreground'
              : 'bg-destructive text-destructive-foreground'
          }`}>
            {isLoading ? "Verificando..." : isConnected ? "Conectado" : "Desconectado"}
          </div>
        </div>

        {/* Instance Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            {status?.LoggedIn ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-success">Login efetuado</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-destructive" />
                <span className="text-destructive">Aguardando login</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            {status?.Connected ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-success">Conexão ativa</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-destructive" />
                <span className="text-destructive">Sem conexão</span>
              </>
            )}
          </div>
          {status?.PhoneNumber && (
            <div className="text-sm text-muted-foreground">
              Número: {status.PhoneNumber}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleManualCheck}
            disabled={isChecking}
            className="flex-1 px-4 py-2 rounded-lg border border-border bg-background hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? "Verificando..." : "Verificar Status"}
          </button>

          {!isConnected && (
            <button
              onClick={handleReconnect}
              disabled={isReconnecting}
              className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Wifi className={`w-4 h-4 ${isReconnecting ? 'animate-pulse' : ''}`} />
              {isReconnecting ? "Reconectando..." : "Reconectar"}
            </button>
          )}
        </div>
      </div>

      {/* API Token Info */}
      <div className="bg-muted rounded-lg p-4">
        <p className="text-xs text-muted-foreground mb-1">Token da API</p>
        <code className="text-xs font-mono break-all bg-background px-2 py-1 rounded">
          {apiToken}
        </code>
      </div>
    </div>
  );
};

export default InstanceStatusCard;
