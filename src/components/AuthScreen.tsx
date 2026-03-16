import { useState } from "react";
import { LogIn, ShieldCheck, UserPlus } from "lucide-react";
import { fetchJson } from "../lib/api";
import { setAuthToken, type AuthUser } from "../lib/session";
import { getDefaultApiHint, getStoredApiBaseUrl, setStoredApiBaseUrl } from "../lib/runtimeConfig";
import { AstraLogo } from "./Sidebar";

interface AuthResponse {
  token: string;
  user: AuthUser;
}

interface AuthScreenProps {
  onAuthenticated: (user: AuthUser) => void;
}

export default function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [apiUrl, setApiUrl] = useState(getStoredApiBaseUrl());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedApiNotice, setSavedApiNotice] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSavedApiNotice(null);

    try {
      setStoredApiBaseUrl(apiUrl);
      const response = await fetchJson<AuthResponse>(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(
          mode === "register"
            ? { name: name.trim(), email: email.trim(), password }
            : { email: email.trim(), password }
        ),
      });

      setAuthToken(response.token);
      onAuthenticated(response.user);
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "Nao foi possivel autenticar.");
    } finally {
      setLoading(false);
    }
  }

  function handleSaveApiUrl() {
    setStoredApiBaseUrl(apiUrl);
    setSavedApiNotice(apiUrl.trim() ? "URL da API salva no app." : "Voltando para a configuracao padrao desta plataforma.");
    setError(null);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_32%),linear-gradient(160deg,_#082f49,_#0f172a_60%,_#111827)] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/10 bg-white/95 shadow-2xl shadow-slate-950/40 lg:grid lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <AstraLogo size={54} />
              <div>
                <h1 className="text-2xl font-black tracking-tight">Astra Tech</h1>
                <p className="text-sm text-slate-400">Sistema de ordem de servico</p>
              </div>
            </div>
            <div className="mt-12 space-y-5">
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-5">
                <p className="text-sm font-semibold text-cyan-300">Login centralizado</p>
                <p className="mt-2 text-sm text-slate-300">Seu acesso passa a funcionar no web, no APK e no aplicativo desktop.</p>
              </div>
              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex items-center gap-3"><ShieldCheck size={18} className="text-emerald-400" /> Cada usuario acessa os proprios dados.</div>
                <div className="flex items-center gap-3"><ShieldCheck size={18} className="text-emerald-400" /> O MongoDB fica protegido atras da API.</div>
                <div className="flex items-center gap-3"><ShieldCheck size={18} className="text-emerald-400" /> O token fica salvo para reabrir o sistema mais rapido.</div>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500">Entre para continuar a gerenciar seu negocio.</p>
        </section>

        <section className="p-6 sm:p-8 lg:p-10">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <AstraLogo size={42} />
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">Astra Tech</h1>
              <p className="text-sm text-slate-500">Sistema de ordem de servico</p>
            </div>
          </div>

          <div className="mb-8 inline-flex rounded-2xl bg-slate-100 p-1">
            <button
              onClick={() => setMode("login")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${mode === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
            >
              Entrar
            </button>
            <button
              onClick={() => setMode("register")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${mode === "register" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
            >
              Criar conta
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-900">
              {mode === "login" ? "Entrar na conta" : "Criar seu usuario"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {mode === "login" ? "Use email e senha para abrir o sistema." : "Cadastre o primeiro usuario que vai administrar o app."}
            </p>
          </div>

          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label className="mb-1 block text-sm font-semibold text-slate-700">URL da API</label>
            <input
              value={apiUrl}
              onChange={event => setApiUrl(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
              placeholder={getDefaultApiHint()}
            />
            <p className="mt-2 text-xs text-slate-500">
              No Android, use a URL publica da sua Netlify, por exemplo `https://seu-site.netlify.app/api`.
            </p>
            <button
              type="button"
              onClick={handleSaveApiUrl}
              className="mt-3 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Salvar URL da API
            </button>
            {savedApiNotice && (
              <p className="mt-2 text-xs font-medium text-emerald-700">{savedApiNotice}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Nome</label>
                <input
                  value={name}
                  onChange={event => setName(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                  placeholder="Seu nome"
                  required
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                placeholder="voce@empresa.com"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Senha</label>
              <input
                type="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
                placeholder="Sua senha"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition hover:from-cyan-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {mode === "login" ? <LogIn size={18} /> : <UserPlus size={18} />}
              {loading ? "Processando..." : mode === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
