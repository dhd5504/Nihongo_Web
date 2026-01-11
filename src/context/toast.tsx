import React, {
  createContext,
  useState,
  useCallback,
  ReactNode,
  useContext,
} from "react";

// Toast types
type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextProps {
  addToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

// Provider props
interface ToastProviderProps {
  children: ReactNode;
}

// ToastProvider component
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, type: ToastType = "info", duration = 3000) => {
      const id = Date.now(); // Unique ID for each toast
      setToasts((prev) => [...prev, { id, message, type }]);

      // Remove the toast after `duration` milliseconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, duration);
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed right-4 top-4 z-50 space-y-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex transform items-center rounded px-4 py-2 shadow-lg transition-all duration-300 ease-in-out ${
              toast.type === "success"
                ? "bg-green-500"
                : toast.type === "error"
                  ? "bg-red-500"
                  : "bg-blue-500"
            } text-white`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Custom Hook to use the Toast Context
export const useToast = (): ToastContextProps => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
