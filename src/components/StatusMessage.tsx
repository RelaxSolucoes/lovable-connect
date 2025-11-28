import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface StatusMessageProps {
  type: "success" | "error" | "info";
  title: string;
  description?: string;
  className?: string;
}

const StatusMessage = ({ type, title, description, className = "" }: StatusMessageProps) => {
  const config = {
    success: {
      icon: CheckCircle2,
      bgColor: "bg-success-bg",
      borderColor: "border-success",
      iconColor: "text-success",
      textColor: "text-success",
    },
    error: {
      icon: XCircle,
      bgColor: "bg-error-bg",
      borderColor: "border-error",
      iconColor: "text-error",
      textColor: "text-error",
    },
    info: {
      icon: AlertCircle,
      bgColor: "bg-warning-bg",
      borderColor: "border-primary",
      iconColor: "text-primary",
      textColor: "text-primary",
    },
  };

  const { icon: Icon, bgColor, borderColor, iconColor, textColor } = config[type];

  return (
    <div
      className={`${bgColor} border ${borderColor} rounded-lg p-4 flex items-center gap-3 animate-scale-in ${className}`}
    >
      <Icon className={`w-6 h-6 ${iconColor} flex-shrink-0`} />
      <div>
        <p className={`font-semibold ${textColor}`}>{title}</p>
        {description && (
          <p className="text-muted-foreground text-sm mt-1">{description}</p>
        )}
      </div>
    </div>
  );
};

export default StatusMessage;
