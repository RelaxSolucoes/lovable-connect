import { useState, useEffect, useCallback, useRef } from "react";
import InstanceForm from "@/components/InstanceForm";
import LoadingSpinner from "@/components/LoadingSpinner";
import StatusMessage from "@/components/StatusMessage";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import SuccessScreen from "@/components/SuccessScreen";

type AppState = 
  | "form" 
  | "creating" 
  | "created" 
  | "connecting" 
  | "qrcode" 
  | "success" 
  | "error";

const API_BASE = "https://webhook.relaxsolucoes.online/webhook";

const Index = () => {
  const [state, setState] = useState<AppState>("form");
  const [apiToken, setApiToken] = useState<string>("");
  const [instanceName, setInstanceName] = useState<string>("");
  const [qrCode, setQrCode] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(30);
  const [isRenewing, setIsRenewing] = useState<boolean>(false);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("whatsapp_api_token");
    const savedName = localStorage.getItem("whatsapp_instance_name");

    if (savedToken) {
      setApiToken(savedToken);
      if (savedName) setInstanceName(savedName);
      setState("success");
    }
  }, []);

  const clearAllTimers = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  const checkStatus = useCallback(async (token: string) => {
    try {
      const response = await fetch(`${API_BASE}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apikey: token }),
      });

      const data = await response.json();
      console.log("Status response:", data);

      let instanceData;
      if (Array.isArray(data) && data.length > 0) {
        instanceData = data[0].data;
      } else if (data.data) {
        instanceData = data.data;
      }

      if (instanceData) {
        console.log("Connected:", instanceData.Connected, "LoggedIn:", instanceData.LoggedIn, "Name:", instanceData.Name);

        if (instanceData.LoggedIn === true) {
          clearAllTimers();
          // Save to localStorage
          localStorage.setItem("whatsapp_api_token", token);
          const currentInstanceName = instanceName || localStorage.getItem("whatsapp_instance_name") || "";
          if (currentInstanceName) {
            localStorage.setItem("whatsapp_instance_name", currentInstanceName);
          }
          setState("success");
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error checking status:", error);
      return false;
    }
  }, [clearAllTimers]);

  const fetchQRCode = useCallback(async (token: string) => {
    try {
      setIsRenewing(true);
      const response = await fetch(`${API_BASE}/conectar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apikey: token }),
      });

      const data = await response.json();
      console.log("QR Code response:", data);

      let qrcodeData;
      if (Array.isArray(data) && data.length > 0 && data[0].data) {
        qrcodeData = data[0].data.Qrcode;
      } else if (data.data && data.data.Qrcode) {
        qrcodeData = data.data.Qrcode;
      }

      if (qrcodeData) {
        setQrCode(qrcodeData);
        setCountdown(30);
        setState("qrcode");
        return true;
      } else {
        throw new Error("QR Code não encontrado na resposta");
      }
    } catch (error) {
      console.error("Error fetching QR code:", error);
      setErrorMessage("Erro ao obter QR Code. Tente novamente.");
      setState("error");
      return false;
    } finally {
      setIsRenewing(false);
    }
  }, []);

  // Start polling when QR code is displayed
  useEffect(() => {
    if (state === "qrcode" && apiToken) {
      // Start polling every 3 seconds
      pollingRef.current = setInterval(() => {
        checkStatus(apiToken);
      }, 3000);

      // Start countdown
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Renew QR code
            fetchQRCode(apiToken);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearAllTimers();
    }
  }, [state, apiToken, checkStatus, fetchQRCode, clearAllTimers]);

  const handleReconnect = useCallback(async () => {
    if (!apiToken) return;
    setState("connecting");
    await fetchQRCode(apiToken);
  }, [apiToken, fetchQRCode]);

  const handleCreateInstance = async (name: string, token: string) => {
    setState("creating");
    setErrorMessage("");

    try {
      const response = await fetch(`${API_BASE}/criar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, token }),
      });

      const data = await response.json();
      console.log("Create response:", data);

      if (data.message === "success" && data.data?.token) {
        setApiToken(data.data.token);
        setInstanceName(name);
        setState("created");

        // After 2 seconds, move to connecting
        setTimeout(async () => {
          setState("connecting");

          // Wait a bit then fetch QR code
          setTimeout(async () => {
            await fetchQRCode(data.data.token);
          }, 1000);
        }, 2000);
      } else {
        throw new Error(data.message || "Erro ao criar instância");
      }
    } catch (error) {
      console.error("Error creating instance:", error);
      setErrorMessage(error instanceof Error ? error.message : "Erro ao criar instância");
      setState("error");

      // Return to form after 5 seconds
      setTimeout(() => {
        setState("form");
        setErrorMessage("");
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg card-shadow-lg p-6 md:p-8">
          {state === "form" && (
            <InstanceForm onSubmit={handleCreateInstance} isLoading={false} />
          )}

          {state === "creating" && (
            <div className="py-12 text-center animate-fade-in">
              <LoadingSpinner size="lg" text="Processando..." />
            </div>
          )}

          {state === "created" && (
            <div className="py-12 text-center animate-scale-in">
              <StatusMessage
                type="success"
                title="Instância Criada com Sucesso!"
                description="Preparando conexão..."
              />
            </div>
          )}

          {state === "connecting" && (
            <div className="py-12 text-center animate-fade-in">
              <LoadingSpinner size="lg" text="Conectando instância..." />
            </div>
          )}

          {state === "qrcode" && (
            <QRCodeDisplay
              qrCode={qrCode}
              countdown={countdown}
              isRenewing={isRenewing}
              apiToken={apiToken}
            />
          )}

          {state === "success" && (
            <SuccessScreen
              apiToken={apiToken}
              instanceName={instanceName}
              onReconnect={handleReconnect}
            />
          )}

          {state === "error" && (
            <div className="py-12 text-center animate-scale-in">
              <StatusMessage
                type="error"
                title="Erro ao criar instância"
                description={errorMessage}
              />
              <p className="text-muted-foreground text-sm mt-4">
                Retornando ao formulário em 5 segundos...
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-muted-foreground text-xs mt-4">
          Powered by RelaxSoluções
        </p>
      </div>
    </div>
  );
};

export default Index;
