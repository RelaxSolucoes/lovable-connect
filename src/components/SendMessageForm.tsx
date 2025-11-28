import { useState } from "react";
import { Send, Loader2 } from "lucide-react";

interface SendMessageFormProps {
  apiToken: string;
}

const API_BASE = "https://webhook.relaxsolucoes.online/webhook";

const SendMessageForm = ({ apiToken }: SendMessageFormProps) => {
  const [number, setNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | null;
    text: string;
  }>({ type: null, text: "" });

  const formatPhoneNumber = (value: string): string => {
    // Remove tudo que não é número
    const onlyNumbers = value.replace(/\D/g, "");

    // Limita a 13 dígitos (55 + 11 + 9 dígitos)
    const limited = onlyNumbers.slice(0, 13);

    // Formata: 55 (XX) XXXXX-XXXX ou 55 (XX) XXXX-XXXX
    if (limited.length <= 2) {
      return limited;
    } else if (limited.length <= 4) {
      return `${limited.slice(0, 2)} (${limited.slice(2)}`;
    } else if (limited.length <= 9) {
      return `${limited.slice(0, 2)} (${limited.slice(2, 4)}) ${limited.slice(4)}`;
    } else {
      const ddd = limited.slice(2, 4);
      const firstPart = limited.slice(4, limited.length - 4);
      const lastPart = limited.slice(limited.length - 4);
      return `${limited.slice(0, 2)} (${ddd}) ${firstPart}-${lastPart}`;
    }
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const onlyNumbers = phone.replace(/\D/g, "");

    // Deve ter DDI (55) + DDD (2 dígitos) + número (8 ou 9 dígitos)
    // Total: 12 ou 13 dígitos
    if (onlyNumbers.length < 12 || onlyNumbers.length > 13) {
      return false;
    }

    // Deve começar com 55 (Brasil)
    if (!onlyNumbers.startsWith("55")) {
      return false;
    }

    return true;
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setNumber(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage({ type: null, text: "" });

    // Validações
    if (!number.trim()) {
      setStatusMessage({ type: "error", text: "Por favor, informe o número." });
      return;
    }

    if (!message.trim()) {
      setStatusMessage({ type: "error", text: "Por favor, informe a mensagem." });
      return;
    }

    if (!validatePhoneNumber(number)) {
      setStatusMessage({
        type: "error",
        text: "Número inválido. Use o formato: 55 (DDD) XXXXX-XXXX",
      });
      return;
    }

    setIsSending(true);

    try {
      const cleanNumber = number.replace(/\D/g, "");

      const response = await fetch(`${API_BASE}/envio`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": apiToken,
        },
        body: JSON.stringify({
          number: cleanNumber,
          text: message,
        }),
      });

      const data = await response.json();
      console.log("Send message response:", data);

      if (response.ok) {
        setStatusMessage({
          type: "success",
          text: "Mensagem enviada com sucesso!",
        });
        // Limpa o formulário
        setMessage("");
        // Mantém o número para facilitar envios múltiplos
      } else {
        throw new Error(data.message || "Erro ao enviar mensagem");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setStatusMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Erro ao enviar mensagem",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Enviar Mensagem</h3>
        <p className="text-sm text-muted-foreground">
          Envie mensagens para qualquer número do WhatsApp
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo de Número */}
        <div>
          <label htmlFor="number" className="block text-sm font-medium mb-2">
            Número do WhatsApp
          </label>
          <input
            id="number"
            type="text"
            value={number}
            onChange={handleNumberChange}
            placeholder="55 (11) 99999-9999"
            disabled={isSending}
            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Formato: DDI (55) + DDD + Número
          </p>
        </div>

        {/* Campo de Mensagem */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-2">
            Mensagem
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua mensagem aqui..."
            disabled={isSending}
            rows={6}
            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {message.length} caracteres
          </p>
        </div>

        {/* Mensagem de Status */}
        {statusMessage.type && (
          <div
            className={`p-4 rounded-lg border ${
              statusMessage.type === "success"
                ? "bg-success/10 border-success text-success"
                : "bg-destructive/10 border-destructive text-destructive"
            }`}
          >
            <p className="text-sm font-medium">{statusMessage.text}</p>
          </div>
        )}

        {/* Botão de Enviar */}
        <button
          type="submit"
          disabled={isSending}
          className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
        >
          {isSending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Enviar Mensagem
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SendMessageForm;
