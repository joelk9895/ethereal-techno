import React from "react";
import {
    Info as InfoIcon,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Trash2,
    X,
} from "lucide-react";

export type AlertVariant = "info" | "success" | "warning" | "error" | "delete";

interface AlertAction {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "danger";
    loading?: boolean;
}

export interface AlertProps {
    variant?: AlertVariant;
    title: string;
    description?: string;
    children?: React.ReactNode;
    actions?: AlertAction[];
    onClose?: () => void;
    className?: string;
    icon?: React.ReactNode;
    showCloseButton?: boolean;
}

const variantConfig = {
    info: {
        icon: <InfoIcon className="text-blue-500" />,
        iconBg: "bg-blue-500/10",
        iconBorder: "border-blue-500/30",
        iconColor: "text-blue-400",
        titleColor: "text-blue-100",
    },
    success: {
        icon: <CheckCircle className="text-green-500" />,
        iconBg: "bg-green-500/10",
        iconBorder: "border-green-500/30",
        iconColor: "text-green-400",
        titleColor: "text-green-100",
    },
    warning: {
        icon: <AlertTriangle className="text-yellow-500" />,
        iconBg: "bg-yellow-500/10",
        iconBorder: "border-yellow-500/30",
        iconColor: "text-yellow-400",
        titleColor: "text-yellow-100",
    },
    error: {
        icon: <XCircle className="text-red-500" />,
        iconBg: "bg-red-500/10",
        iconBorder: "border-red-500/30",
        iconColor: "text-red-400",
        titleColor: "text-red-100",
    },
    delete: {
        icon: <Trash2 className="text-red-500" />,
        iconBg: "bg-red-500/10",
        iconBorder: "border-red-500/30",
        iconColor: "text-red-400",
        titleColor: "text-red-100",
    },
};

export default function Alert({
    variant = "info",
    title,
    description,
    children,
    actions,
    onClose,
    className = "",
    icon,
    showCloseButton = true,
}: AlertProps) {
    const config = variantConfig[variant];
    const IconComponent = icon || config.icon;

    return (
        <div
            className={`bg-black/60 backdrop-blur-sm border border-white/20 rounded-2xl p-6 ${className}`}
        >
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                    className={`flex-shrink-0 w-12 h-12 rounded-full border ${config.iconBg} ${config.iconBorder} flex items-center justify-center`}
                >
                    {IconComponent}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <h3 className={`font-medium text-lg mb-1 ${config.titleColor}`}>
                                {title}
                            </h3>
                            {description && (
                                <p className="text-sm text-white/70 leading-relaxed">
                                    {description}
                                </p>
                            )}
                        </div>

                        {/* Close Button */}
                        {showCloseButton && onClose && (
                            <button
                                onClick={onClose}
                                className="text-white/40 hover:text-white/80 transition-colors p-1 -m-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Custom Children */}
                    {children && <div className="mt-3">{children}</div>}

                    {/* Actions */}
                    {actions && actions.length > 0 && (
                        <div className="flex items-center gap-3 mt-4">
                            {actions.map((action, index) => {
                                const buttonVariants = {
                                    primary: "bg-primary text-black hover:bg-primary/90",
                                    secondary:
                                        "bg-white/10 text-white hover:bg-white/20 border border-white/20",
                                    danger: "bg-red-500/90 text-white hover:bg-red-500",
                                };

                                return (
                                    <button
                                        key={index}
                                        onClick={action.onClick}
                                        disabled={action.loading}
                                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${buttonVariants[action.variant || "secondary"]
                                            }`}
                                    >
                                        {action.loading ? "Processing..." : action.label}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export function AlertModal({
    isOpen,
    onClose,
    children,
}: {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-6 z-[1000]"
            onClick={onClose}
        >
            <div
                className="max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}

export function InlineAlert({
    variant = "info",
    title,
    description,
    onClose,
    className = "",
}: Omit<AlertProps, "actions" | "children" | "icon">) {
    const config = variantConfig[variant];
    const IconComponent = config.icon;

    return (
        <div
            className={`bg-black/50 border border-white/10 rounded-lg p-4 ${className}`}
        >
            <div className="flex items-start gap-3">
                {IconComponent}
                <div className="flex-1 min-w-0">
                    <h4 className={`font-medium text-sm ${config.titleColor}`}>{title}</h4>
                    {description && (
                        <p className="text-xs text-white/60 mt-1">{description}</p>
                    )}
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-white/40 hover:text-white/80 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}