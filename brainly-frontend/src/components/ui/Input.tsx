interface InputProps { 
  placeholder: string; 
  reference?: React.Ref<HTMLInputElement>;
  className?: string;
}

export function Input({ placeholder, reference, className }: InputProps) {
  return (
    <input
      ref={reference}
      placeholder={placeholder}
      type="text"
      className={`w-full px-4 py-3 border border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${className || ""}`}
    />
  );
}
