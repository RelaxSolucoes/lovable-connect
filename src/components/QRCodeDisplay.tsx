import { useState } from "react";
import { Smartphone, Link2, Phone, Loader2 } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

interface QRCodeDisplayProps {
  qrCode: string;
  countdown: number;
  isRenewing: boolean;
  apiToken: string;
}

const API_BASE = "https://webhook.relaxsolucoes.online/webhook";

const formatPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters
  const digits = phone.replace(/\D/g, "");
  
  // If starts with 55, keep it
  if (digits.startsWith("55") && digits.length >= 12) {
    return `+${digits}`;
  }
  
  // If starts with local area code (2 digits like 19, 11, etc.), add +55
  if (digits.length >= 10 && digits.length <= 11) {
    return `+55${digits}`;
  }
  
  // If already has country code without +, add +
  if (digits.length >= 12) {
    return `+${digits}`;
  }
  
  return `+55${digits}`;
};

const QRCodeDisplay = ({ qrCode, countdown, isRenewing, apiToken }: QRCodeDisplayProps) => {
  const [showPairingForm, setShowPairingForm] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [pairingCode, setPairingCode] = useState("");

  const handleRequestPairingCode = async () => {
    // Validate phone number
    const digits = phoneNumber.replace(/\D/g, "");
    if (digits.length < 10) {
      setPhoneError("Número inválido. Use o formato: +5519999999999");
      return;
    }

    setPhoneError("");
    setIsRequestingCode(true);

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      console.log("Requesting pairing code for:", formattedPhone);

      const response = await fetch(`${API_BASE}/pair`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apikey: apiToken,
          number: formattedPhone,
        }),
      });

      const data = await response.json();
      console.log("Pairing response:", data);

      let pairingCodeData;
      if (Array.isArray(data) && data.length > 0 && data[0].data) {
        pairingCodeData = data[0].data.PairingCode;
      } else if (data.data && data.data.PairingCode) {
        pairingCodeData = data.data.PairingCode;
      }

      if (pairingCodeData) {
        setPairingCode(pairingCodeData);
      } else {
        setPhoneError("Erro ao obter código de pareamento. Tente novamente.");
      }
    } catch (error) {
      console.error("Error requesting pairing code:", error);
      setPhoneError("Erro ao solicitar código. Tente novamente.");
    } finally {
      setIsRequestingCode(false);
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {pairingCode ? "Código de Pareamento" : "Escaneie o QR Code"}
        </h2>
        <p className="text-muted-foreground">
          {pairingCode 
            ? "Digite o código abaixo no seu WhatsApp" 
            : "Abra o WhatsApp no seu celular e escaneie o código abaixo"}
        </p>
      </div>

      {/* Pairing Code Display */}
      {pairingCode ? (
        <div className="flex justify-center mb-6">
          <div className="bg-card p-8 rounded-lg qr-shadow text-center">
            <p className="text-sm text-muted-foreground mb-3">Seu código de pareamento:</p>
            <div className="text-4xl font-bold text-primary tracking-widest">
              {pairingCode}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Vá em WhatsApp &gt; Dispositivos conectados &gt; Conectar com número de telefone
            </p>
          </div>
        </div>
      ) : (
        /* QR Code Container */
        <div className="flex justify-center mb-6">
          <div className="bg-card p-5 rounded-lg qr-shadow animate-pulse-glow">
            <img
              src={qrCode}
              alt="QR Code WhatsApp"
              className="w-64 h-64 object-contain"
            />
          </div>
        </div>
      )}

      {/* Pairing Code Button/Form */}
      {!pairingCode && (
        <div className="mb-6">
          {!showPairingForm ? (
            <button
              onClick={() => setShowPairingForm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-all duration-200"
            >
              <Link2 className="w-5 h-5" />
              Conectar com código de pareamento
            </button>
          ) : (
            <div className="bg-muted rounded-lg p-4 animate-fade-in">
              <label className="block text-sm font-medium text-foreground mb-2">
                Número do WhatsApp
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      setPhoneError("");
                    }}
                    placeholder="+5519999999999"
                    className="w-full pl-10 pr-4 py-2.5 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-input-focus"
                    disabled={isRequestingCode}
                  />
                </div>
                <button
                  onClick={handleRequestPairingCode}
                  disabled={isRequestingCode || !phoneNumber.trim()}
                  className="bg-primary hover:bg-primary-hover active:bg-primary-active text-primary-foreground font-medium py-2.5 px-4 rounded-lg transition-all duration-200 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isRequestingCode ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Solicitar"
                  )}
                </button>
              </div>
              {phoneError && (
                <p className="text-error text-sm mt-2">{phoneError}</p>
              )}
              <button
                onClick={() => {
                  setShowPairingForm(false);
                  setPhoneNumber("");
                  setPhoneError("");
                }}
                className="text-sm text-muted-foreground hover:text-foreground mt-3 transition-colors"
              >
                ← Voltar ao QR Code
              </button>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!pairingCode && !showPairingForm && (
        <div className="bg-muted rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p className="font-semibold text-foreground mb-2">Como escanear:</p>
              <ol className="space-y-1 list-decimal list-inside">
                <li>Abra o WhatsApp no seu celular</li>
                <li>Toque em Mais opções (⋮) → Dispositivos conectados</li>
                <li>Toque em Conectar um dispositivo</li>
                <li>Aponte seu celular para esta tela</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Status */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {isRenewing ? (
          <>
            <LoadingSpinner size="sm" />
            <span className="text-primary text-sm font-medium">
              Renovando QR Code...
            </span>
          </>
        ) : (
          <>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-muted-foreground text-sm">
              {pairingCode ? "Aguardando pareamento..." : "Aguardando leitura do QR Code..."}
            </span>
          </>
        )}
      </div>

      {/* Countdown Timer */}
      {!pairingCode && (
        <div className="bg-error-bg rounded-lg p-3 text-center">
          <span className="text-sm text-muted-foreground">QR Code expira em: </span>
          <span className="text-primary font-bold text-lg">{countdown}s</span>
        </div>
      )}
    </div>
  );
};

export default QRCodeDisplay;
