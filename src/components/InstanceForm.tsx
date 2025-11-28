import { useState } from "react";
import { MessageSquare, Lock, Loader2 } from "lucide-react";

interface InstanceFormProps {
  onSubmit: (name: string, token: string) => void;
  isLoading: boolean;
}

const InstanceForm = ({ onSubmit, isLoading }: InstanceFormProps) => {
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [errors, setErrors] = useState<{ name?: string; token?: string }>({});

  const validate = () => {
    const newErrors: { name?: string; token?: string } = {};
    
    if (name.trim().length < 3) {
      newErrors.name = "Nome deve ter no mínimo 3 caracteres";
    }
    
    if (token.length < 6) {
      newErrors.token = "Senha deve ter no mínimo 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(name.trim(), token);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Criar Nova Instância
        </h1>
        <p className="text-muted-foreground">
          Preencha os dados abaixo para configurar sua conexão WhatsApp
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
            Nome da Instância
          </label>
          <div className="relative">
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              placeholder="Digite o nome da sua instância"
              className={`w-full px-4 py-3 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-input-focus ${
                errors.name ? "border-error" : "border-input"
              }`}
              disabled={isLoading}
            />
          </div>
          {errors.name && (
            <p className="text-error text-sm mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="token" className="block text-sm font-medium text-foreground mb-2">
            Token/Senha
          </label>
          <div className="relative">
            <input
              id="token"
              type="password"
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                if (errors.token) setErrors({ ...errors, token: undefined });
              }}
              placeholder="Escolha uma senha..."
              className={`w-full px-4 py-3 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-input-focus ${
                errors.token ? "border-error" : "border-input"
              }`}
              disabled={isLoading}
            />
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          </div>
          {errors.token && (
            <p className="text-error text-sm mt-1">{errors.token}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary-hover active:bg-primary-active text-primary-foreground font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processando...
          </>
        ) : (
          "Criar Instância"
        )}
      </button>
    </form>
  );
};

export default InstanceForm;
