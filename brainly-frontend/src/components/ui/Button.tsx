import type { ReactElement } from "react";

interface ButtonProps {
  variant: "primary" | "secondary";
  text: string;
  startIcon?: ReactElement;
  onClick?: () => void;
  fullWidth?: boolean;
  loading?: boolean;
}

const variantClasses = {
  primary: "bg-white text-black hover:bg-zinc-100 shadow-lg hover:shadow-xl",
  secondary: "bg-zinc-800 text-white border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 shadow-lg hover:shadow-xl",
};

const defaultStyles = "px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base";

export function Button({
  variant,
  text,
  startIcon,
  onClick,
  fullWidth,
  loading,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`${variantClasses[variant]} ${defaultStyles} ${
        fullWidth ? "w-full" : ""
      } ${loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
      disabled={loading}
    >
      {startIcon && <div className="mr-2 text-lg">{startIcon}</div>}
      <div className="font-semibold tracking-wide">{text}</div>
    </button>
  );
}
