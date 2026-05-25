import React, { useState, FormEvent } from "react";
import { ChatbotConfig, SupabaseConfig } from "../types";
import { 
  Settings as SettingsIcon, 
  User, 
  Phone, 
  Copy, 
  Check, 
  Zap, 
  BookOpen, 
  Network,
  Database
} from "lucide-react";

interface SettingsProps {
  config: ChatbotConfig;
  onSaveConfig: (newConfig: ChatbotConfig) => void;
  supabaseConfig: SupabaseConfig;
  activeInstanceId: string;
  userEmail: string;
}

export default function Settings({ 
  config, 
  onSaveConfig, 
  supabaseConfig,
  activeInstanceId,
  userEmail
}: SettingsProps) {
  const [whatsapp, setWhatsapp] = useState(config.whatsapp || "");
  const [hasSaved, setHasSaved] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Clean phone number (keep only digits)
    const cleanedNumber = whatsapp.replace(/\D/g, "");

    onSaveConfig({
      ...config,
      whatsapp: cleanedNumber
    });

    setHasSaved(true);
    setTimeout(() => setHasSaved(false), 2000);
  };

  const handleCopyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Generate example SQL code for n8n
  const sqlExample = `-- 1. Buscar o user_id do proprietário pelo número do WhatsApp do chatbot
SELECT user_id 
FROM chatbot_config 
WHERE whatsapp = '${whatsapp || "62984940318"}' 
LIMIT 1;

-- 2. Buscar os produtos pertencentes a esse proprietário (user_id)
SELECT * 
FROM produtos 
WHERE user_id = 'SUA_UUID_ENCONTRADA_NO_PASSO_1';`;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-zinc-150 pb-4">
        <h2 className="text-xl font-display font-semibold text-zinc-950 flex items-center gap-2">
          <SettingsIcon className="w-5.5 h-5.5 text-emerald-600" />
          Configurações da Instância
        </h2>
        <p className="text-xs text-zinc-500 mt-0.5">Vincule seu número de WhatsApp e obtenha dados para a integração com o n8n</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-zinc-150 rounded-2xl p-6 shadow-3xs space-y-5">
            <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600" />
              Vínculo de WhatsApp do Chatbot
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Número do WhatsApp do Bot *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-zinc-55 border border-zinc-200 rounded-lg pl-9 pr-3 py-2.5 text-xs focus:outline-hidden focus:border-zinc-400 focus:bg-white text-zinc-800 font-mono"
                    placeholder="Ex: 62984940318"
                  />
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">
                  Insira o número completo com DDI e DDD (somente números). O n8n usará este número para associar o bot ao seu catálogo.
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-100 pt-4 bg-white">
                <span className="text-[10px] text-zinc-400">💡 Salvo de forma segura na tabela `chatbot_config` do Supabase.</span>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {hasSaved ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-200 font-bold" />
                      Salvo com Sucesso!
                    </>
                  ) : (
                    "Salvar Configurações"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Integration instructions card */}
          <div className="bg-white border border-zinc-150 rounded-2xl p-6 shadow-3xs space-y-4">
            <h3 className="font-semibold text-sm text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-3">
              <Zap className="w-4.5 h-4.5 text-amber-500 fill-amber-400" />
              Como configurar o seu n8n
            </h3>
            
            <p className="text-xs text-zinc-650 leading-relaxed">
              No seu fluxo do **n8n**, quando a **Evolution API** disparar o webhook de mensagem recebida, ela informará o número de WhatsApp do bot destinatário.
            </p>
            <p className="text-xs text-zinc-650 leading-relaxed">
              Para buscar os produtos do catálogo desse bot específico de forma dinâmica, faça uma requisição HTTP ou use o nó do Supabase com o seguinte comando SQL:
            </p>

            <div className="bg-zinc-900 text-white rounded-xl p-4 relative font-mono text-[10px] leading-relaxed select-all">
              <pre className="whitespace-pre-wrap">{sqlExample}</pre>
              <button
                type="button"
                onClick={() => handleCopyToClipboard(sqlExample, "sql-code")}
                className="absolute top-2 right-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white p-1.5 rounded-md transition-colors"
                title="Copiar SQL"
              >
                {copiedId === "sql-code" ? <Check className="w-3.5 h-3.5 text-emerald-450" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar credentials info */}
        <div className="space-y-4">
          <div className="bg-zinc-950 text-white rounded-2xl p-5 border border-zinc-850 shadow-md space-y-4">
            <h4 className="font-display font-semibold text-xs text-white flex items-center gap-1.5 border-b border-zinc-850 pb-2.5">
              <User className="w-4 h-4 text-emerald-400" />
              Dados da Conta de Integração
            </h4>
            
            <div className="space-y-3 text-[11px]">
              <div>
                <span className="text-zinc-500 block font-bold uppercase tracking-wider text-[9px]">E-mail</span>
                <span className="text-zinc-200 font-medium break-all">{userEmail}</span>
              </div>

              <div>
                <span className="text-zinc-500 block font-bold uppercase tracking-wider text-[9px]">ID do Usuário (user_id / tenant)</span>
                <div className="flex items-center justify-between gap-2 mt-0.5 bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800">
                  <span className="text-zinc-350 font-mono text-[10px] truncate select-all">{activeInstanceId}</span>
                  <button
                    onClick={() => handleCopyToClipboard(activeInstanceId, "user-id")}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors shrink-0"
                    title="Copiar ID"
                  >
                    {copiedId === "user-id" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 space-y-2">
            <h4 className="text-[11px] font-bold text-emerald-850 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-700" />
              Estrutura de Tabelas
            </h4>
            <p className="text-[10px] text-emerald-800 leading-normal font-semibold">
              O número de WhatsApp cadastrado ao lado é gravado na tabela `chatbot_config`, vinculando seu bot de WhatsApp ao seu `user_id` único no Supabase.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
