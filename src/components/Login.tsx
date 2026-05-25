import React, { useState, FormEvent, useEffect } from "react";
import { Bot, Store, Lock, ArrowRight, Sparkles, Mail, Database, ChevronDown, ChevronUp, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SupabaseConfig } from "../types";

interface LoginProps {
  onLogin: (
    userId: string,
    email: string,
    accessToken: string,
    supabaseConfig: SupabaseConfig
  ) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Supabase connection configuration states
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("");
  const [supabaseBucket, setSupabaseBucket] = useState("produtos");
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load configuration from env or localStorage
  useEffect(() => {
    // 1. Try to load from environment variables (standard Vite setup)
    const envUrl = ((import.meta as any).env?.VITE_SUPABASE_URL || "").trim();
    const envKey = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "").trim();

    if (envUrl && envKey) {
      setSupabaseUrl(envUrl);
      setSupabaseAnonKey(envKey);
      return;
    }

    // 2. Fallback to localStorage global config
    try {
      const saved = localStorage.getItem("shop_master_global_supabase_config");
      if (saved) {
        const parsed = JSON.parse(saved);
        setSupabaseUrl(parsed.url || "");
        setSupabaseAnonKey(parsed.anonKey || "");
        setSupabaseBucket(parsed.bucket || "produtos");
      }
    } catch (e) {
      console.error("Erro ao carregar configurações do localStorage:", e);
    }
  }, []);

  const handleSaveConfig = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      setError("Por favor, preencha a URL e a Chave Anon do Supabase.");
      return;
    }

    const config: SupabaseConfig = {
      url: supabaseUrl.trim(),
      anonKey: supabaseAnonKey.trim(),
      bucket: supabaseBucket.trim()
    };

    localStorage.setItem("shop_master_global_supabase_config", JSON.stringify(config));
    setSaveSuccess(true);
    setError(null);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsConfigOpen(false);
    }, 1500);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError("Por favor, insira seu e-mail e senha.");
      return;
    }

    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      setError("Banco de dados não configurado. Por favor, insira as credenciais do Supabase no painel abaixo.");
      setIsConfigOpen(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    const cleanUrl = supabaseUrl.trim().replace(/\/$/, "");
    const cleanKey = supabaseAnonKey.trim();

    try {
      // Authenticate directly with GoTrue (Supabase Auth REST API)
      const response = await fetch(`${cleanUrl}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          "apikey": cleanKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password
        })
      });

      if (!response.ok) {
        const errJson = await response.json();
        const errMsg = errJson.error_description || errJson.message || "E-mail ou senha incorretos.";
        throw new Error(errMsg);
      }

      const data = await response.json();
      const accessToken = data.access_token;
      const userId = data.user.id;
      const userEmail = data.user.email;

      // Persist global Supabase config if successfully authenticated
      const config: SupabaseConfig = {
        url: cleanUrl,
        anonKey: cleanKey,
        bucket: supabaseBucket.trim()
      };
      localStorage.setItem("shop_master_global_supabase_config", JSON.stringify(config));

      // Callback triggers authenticated state in App.tsx
      onLogin(userId, userEmail, accessToken, config);

    } catch (err: any) {
      console.error("Auth error:", err);
      // Friendly Brazilian Portuguese translation of common Supabase Auth errors
      let friendlyError = err.message;
      if (friendlyError.includes("Invalid login credentials") || friendlyError.includes("invalid_credentials")) {
        friendlyError = "E-mail ou senha inválidos. Por favor, verifique suas credenciais.";
      } else if (friendlyError.includes("Email not confirmed")) {
        friendlyError = "O e-mail ainda não foi confirmado. Verifique sua caixa de entrada no Supabase.";
      }
      setError(`⚠️ Falha no Login: ${friendlyError}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col justify-between relative overflow-hidden">
      
      {/* Decorative premium gradient glowing spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] bg-radial from-emerald-650/15 via-transparent to-transparent rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] bg-radial from-emerald-950/25 via-transparent to-transparent rounded-full pointer-events-none"></div>

      {/* Header bar */}
      <header className="px-6 py-5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-450 shadow-xs">
            <Store className="w-4.5 h-4.5" />
          </div>
          <span className="font-display font-bold text-xs tracking-tight uppercase text-zinc-300">Stella Hub Multi-Tenant</span>
        </div>
        <span className="text-[10px] text-zinc-500 font-mono">Supabase Auth Active</span>
      </header>

      {/* Main Login Box */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl relative"
        >
          
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500/40 via-teal-500/20 to-transparent"></div>

          {/* Icon/Logo center */}
          <div className="text-center space-y-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-450 mx-auto shadow-md">
              <Bot className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg tracking-tight text-white font-semibold">Entrar no Stella Hub</h2>
              <p className="text-xs text-zinc-400 mt-1">Insira suas credenciais cadastradas no Supabase</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email field */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                E-mail do Usuário
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="seu-email@provedor.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-emerald-500 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-550 focus:outline-hidden transition-colors"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Senha
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-emerald-500 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-550 focus:outline-hidden transition-colors"
                />
              </div>
            </div>

            {/* Error alerts */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-3 rounded-xl text-[10px] font-semibold text-left leading-relaxed"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl py-2.5 text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Acessar Painel Isolado
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Database Connection Credentials Drawer */}
          <div className="border-t border-zinc-900 mt-6 pt-4">
            <button
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              className="w-full flex items-center justify-between text-[10px] font-bold text-zinc-500 hover:text-zinc-300 uppercase tracking-wider transition-colors py-1 cursor-pointer select-none"
            >
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                Configurar Banco de Dados
              </span>
              {isConfigOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <AnimatePresence>
              {isConfigOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden mt-3 space-y-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800"
                >
                  <p className="text-[9px] text-zinc-400 leading-normal">
                    Se você não configurou o arquivo `.env` do projeto, insira as credenciais do seu projeto Supabase abaixo:
                  </p>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[9px] text-zinc-400 font-bold uppercase mb-1">Supabase URL</label>
                      <input
                        type="text"
                        placeholder="https://xyz.supabase.co"
                        value={supabaseUrl}
                        onChange={(e) => setSupabaseUrl(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-[10px] text-white font-mono placeholder-zinc-700 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] text-zinc-400 font-bold uppercase mb-1">Supabase Anon Key</label>
                      <input
                        type="password"
                        placeholder="eyJhbGciOi..."
                        value={supabaseAnonKey}
                        onChange={(e) => setSupabaseAnonKey(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-[10px] text-white font-mono placeholder-zinc-700 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] text-zinc-400 font-bold uppercase mb-1">Bucket de Imagens (Storage)</label>
                      <input
                        type="text"
                        placeholder="produtos"
                        value={supabaseBucket}
                        onChange={(e) => setSupabaseBucket(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-[10px] text-white font-mono placeholder-zinc-700 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveConfig}
                    className="w-full bg-zinc-800 hover:bg-zinc-750 text-white rounded-lg py-1.5 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors border border-zinc-750"
                  >
                    {saveSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-450 font-bold" />
                        Salvo com Sucesso!
                      </>
                    ) : (
                      "Salvar Configurações Locais"
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-zinc-900/60 mt-5 pt-4 space-y-1.5 text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-450 flex items-center gap-1 font-semibold select-none">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              Segurança Multi-Tenant
            </span>
            <p className="text-[9px] text-zinc-500 leading-normal">
              Apenas usuários criados na aba **Authentication &gt; Users** do console do seu Supabase podem logar. Cada conta administra exclusivamente seus próprios produtos e categorias com isolamento absoluto.
            </p>
          </div>

        </motion.div>
      </main>

      {/* Footer craft */}
      <footer className="py-4 text-center text-[10px] text-zinc-600 relative z-10 border-t border-zinc-900/30">
        © 2026 Stella Hub. Desenvolvido para operações de escala multi-agente integradas ao Supabase.
      </footer>

    </div>
  );
}
