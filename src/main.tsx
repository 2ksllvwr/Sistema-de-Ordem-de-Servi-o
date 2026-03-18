import { Component, StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

interface CrashBoundaryState {
  error: string | null;
}

class CrashBoundary extends Component<{ children: ReactNode }, CrashBoundaryState> {
  state: CrashBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): CrashBoundaryState {
    return {
      error: error instanceof Error ? error.message : "Falha inesperada ao abrir o aplicativo.",
    };
  }

  componentDidCatch(error: unknown) {
    console.error("Falha fatal na interface Android/Web:", error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="w-full max-w-lg rounded-3xl border border-red-500/30 bg-slate-900 p-6 shadow-2xl">
            <h1 className="text-xl font-bold text-white">Astra | OS</h1>
            <p className="mt-3 text-sm text-slate-300">
              O aplicativo encontrou um erro ao iniciar.
            </p>
            <pre className="mt-4 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-red-300">
              {this.state.error}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

window.addEventListener("error", event => {
  console.error("Erro global capturado:", event.error ?? event.message);
});

window.addEventListener("unhandledrejection", event => {
  console.error("Promise rejeitada sem tratamento:", event.reason);
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CrashBoundary>
      <App />
    </CrashBoundary>
  </StrictMode>
);
