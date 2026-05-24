import React, { useState, FormEvent } from "react";
import { Bot, Store, Lock, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface LoginProps {
  onLogin: (instanceId: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [instanceId, setInstanceId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!instanceId.trim()) {
      setError("Por favor, insira o número ou identificador do chatbot.");
      return;
    }
    if (password.length < 4) {
      setError("A senha deve ter no mínimo 4 caracteres para segurança.");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate authentication delay for high premium feel
    setTimeout(() => {
      setIsLoading(false);
      // Clean and sanitize the instanceId (ex: remove spacing, parentheses)
      const sanitized = instanceId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
      if (!sanitized) {
        setError("Identificador inválido. Use letras, números ou símbolos básicos.");
        return;
      }
      onLogin(sanitized);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col justify-between relative overflow-hidden">
      
      {/* Decorative gradient glowing spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-radial from-emerald-650/20 via-transparent to-transparent rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-radial from-emerald-950/30 via-transparent to-transparent rounded-full pointer-events-none"></div>

      {/* Header bar */}
      <header className="px-6 py-5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-450 shadow-xs">
            <Store className="w-4.5 h-4.5" />
          </div>
          <span className="font-display font-bold text-xs tracking-tight uppercase text-zinc-300">Stella Hub Multi-Tenant</span>
        </div>
        <span className="text-[10px] text-zinc-500 font-mono">v1.3.0</span>
      </header>

      {/* Main Form Box Content */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl relative"
        >
          
          {/* Internal gradient lighting inside the box */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500/50 via-teal-500/30 to-transparent"></div>

          {/* Logo center */}
          <div className="text-center space-y-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-450 mx-auto shadow-md">
              <Bot className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg tracking-tight text-white">Acessar Painel do Chatbot</h2>
              <p className="text-xs text-zinc-400 mt-1">Conecte sua instância para gerenciar vitrine e IA isoladamente</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Instance input */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Número do Chatbot ou ID da Loja
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                  <Bot className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Ex: 5511999999999 ou minha-loja"
                  value={instanceId}
                  onChange={(e) => setInstanceId(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-emerald-500 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-550 focus:outline-hidden transition-colors font-semibold"
                />
              </div>
              <p className="text-[9px] text-zinc-500">Cada número ou ID diferente criará um ambiente 100% isolado.</p>
            </div>

            {/* Access Code Password */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Senha de Acesso da Instância
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="Digite sua senha..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-emerald-500 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-550 focus:outline-hidden transition-colors"
                />
              </div>
            </div>

            {/* Feedback alert error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-500/10 border border-rose-500/20 text-rose-350 p-3 rounded-xl text-[10px] font-semibold text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Login button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl py-2.5 text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Entrar no Painel
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick guide tips */}
          <div className="border-t border-zinc-800/80 mt-6 pt-5 space-y-2 text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-450 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              Dica Multi-Tenant
            </span>
            <p className="text-[10px] text-zinc-450 leading-relaxed">
              Você pode abrir abas anônimas ou navegadores diferentes e fazer login com outros números para rodar múltiplos chatbots de vendas em paralelo com dados do Supabase independentes!
            </p>
          </div>

        </motion.div>
      </main>

      {/* Footer craft */}
      <footer className="py-4 text-center text-[10px] text-zinc-650 relative z-10 border-t border-zinc-900/50">
        © 2026 Stella Hub. Desenvolvido para operações de escala multi-agente.
      </footer>

    </div>
  );
}
