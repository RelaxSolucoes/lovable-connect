import { CheckCircle2, MessageCircle } from "lucide-react";

const SuccessScreen = () => {
  return (
    <div className="text-center animate-bounce-in py-8">
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
      
      <p className="text-muted-foreground max-w-sm mx-auto">
        Sua instância WhatsApp está pronta para uso. 
        Você já pode começar a enviar e receber mensagens.
      </p>

      <div className="mt-8 bg-success-bg border border-success/30 rounded-lg p-4 inline-block">
        <p className="text-success text-sm font-medium">
          ✓ Instância ativa e funcionando
        </p>
      </div>
    </div>
  );
};

export default SuccessScreen;
