import { Smartphone } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

interface QRCodeDisplayProps {
  qrCode: string;
  countdown: number;
  isRenewing: boolean;
}

const QRCodeDisplay = ({ qrCode, countdown, isRenewing }: QRCodeDisplayProps) => {
  return (
    <div className="animate-slide-up">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Escaneie o QR Code
        </h2>
        <p className="text-muted-foreground">
          Abra o WhatsApp no seu celular e escaneie o código abaixo
        </p>
      </div>

      {/* QR Code Container */}
      <div className="flex justify-center mb-6">
        <div className="bg-card p-5 rounded-lg qr-shadow animate-pulse-glow">
          <img
            src={qrCode}
            alt="QR Code WhatsApp"
            className="w-64 h-64 object-contain"
          />
        </div>
      </div>

      {/* Instructions */}
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
              Aguardando leitura do QR Code...
            </span>
          </>
        )}
      </div>

      {/* Countdown Timer */}
      <div className="bg-error-bg rounded-lg p-3 text-center">
        <span className="text-sm text-muted-foreground">QR Code expira em: </span>
        <span className="text-primary font-bold text-lg">{countdown}s</span>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
