export function Button({ children, onClick, variant = "default", className = "" }) {
    const baseStyle = "px-4 py-2 rounded font-semibold transition text-center";
  
    const variants = {
      default: "bg-blue-600 hover:bg-blue-700 text-white",
      outline: "border border-white text-white hover:bg-white hover:text-gray-900",
      ghost: "text-white hover:text-blue-400",
    };
  
    return (
      <button
        onClick={onClick}
        className={`${baseStyle} ${variants[variant]} ${className}`}
      >
        {children}
      </button>
    );
  }
  