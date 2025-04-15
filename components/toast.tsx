"use client"
import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts, dismissToast } = useToast()

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-4 w-full max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-lg shadow-lg flex items-start gap-3 transform transition-all duration-300 ease-in-out ${
            toast.variant === "destructive"
              ? "bg-destructive text-destructive-foreground"
              : toast.variant === "success"
                ? "bg-green-600 text-white"
                : "bg-background text-foreground border"
          }`}
        >
          <div className="flex-1">
            <h3 className="font-medium">{toast.title}</h3>
            {toast.description && <p className="text-sm mt-1">{toast.description}</p>}
          </div>
          <button
            onClick={() => dismissToast(toast.id)}
            className="shrink-0 rounded-md p-1 transition-colors hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
