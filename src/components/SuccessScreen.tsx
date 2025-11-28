import { useState } from "react";
import { CheckCircle2, MessageCircle, Activity, Send } from "lucide-react";
import InstanceStatusCard from "./InstanceStatusCard";
import SendMessageForm from "./SendMessageForm";

interface SuccessScreenProps {
  apiToken: string;
  instanceName?: string;
  onReconnect?: () => void;
}

type TabType = "status" | "send";

const SuccessScreen = ({ apiToken, instanceName, onReconnect }: SuccessScreenProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("status");

  return (
    <div className="animate-bounce-in py-8">
      <div className="text-center mb-8">
        <div className="relative inline-block mb-6">
          <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-16 h-16 text-success" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-success rounded-full flex items-center justify-center shadow-lg">
            <MessageCircle className="w-5 h-5 text-success-foreground" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-foreground mb-3">
          Conectado com Sucesso!
        </h2>

        <p className="text-muted-foreground max-w-sm mx-auto mb-6">
          Sua instância WhatsApp está pronta para uso.
          Você já pode começar a enviar e receber mensagens.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab("status")}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-all relative ${
            activeTab === "status"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Activity className="w-4 h-4" />
          Status
          {activeTab === "status" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("send")}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-all relative ${
            activeTab === "send"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Send className="w-4 h-4" />
          Enviar Mensagem
          {activeTab === "send" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "status" && (
          <div className="animate-fade-in">
            <InstanceStatusCard
              apiToken={apiToken}
              instanceName={instanceName}
              onReconnect={onReconnect}
            />
          </div>
        )}

        {activeTab === "send" && (
          <div className="animate-fade-in">
            <SendMessageForm apiToken={apiToken} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SuccessScreen;
