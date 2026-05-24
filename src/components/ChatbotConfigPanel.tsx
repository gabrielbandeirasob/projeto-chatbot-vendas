import React, { useState, FormEvent } from "react";
import { ChatbotConfig, SupabaseConfig } from "../types";
import { 
  Settings, 
  RefreshCw, 
  Check, 
  Sliders, 
  Zap, 
  Copy, 
  Database, 
  MessageSquare, 
  BookOpen, 
  ExternalLink,
  Network
} from "lucide-react";
import { motion } from "motion/react";

interface ChatbotConfigPanelProps {
  config: ChatbotConfig;
  onSaveConfig: (newConfig: ChatbotConfig) => void;
  supabaseConfig: SupabaseConfig;
  activeInstanceId: string;
}

export default function ChatbotConfigPanel({ 
  config, 
  onSaveConfig, 
  supabaseConfig,
  activeInstanceId
}: ChatbotConfigPanelProps) {
  // Config state
  const [identity, setIdentity] = useState(config.identity || `Stella [${activeInstanceId.toUpperCase()}]`);
  const [tone, setTone] = useState(config.tone || "Prestativo, elegante, engajador e levemente focado em conversão de vendas");
  const [rules, setRules] = useState(config.rules || "Sua missão é responder dúvidas sobre nosso estoque de produtos, dar recomendações baseadas no estilo dos clientes e ser muito prestativo.");
  const [showImage, setShowImage] = useState(config.showImage !== false);
  const [showPrice, setShowPrice] = useState(config.showPrice !== false);
  const [showActionButton, setShowActionButton] = useState(config.showActionButton !== false);
  const [actionButtonText, setActionButtonText] = useState(config.actionButtonText || "Quero Comprar");

  const [activeSubTab, setActiveSubTab] = useState<"prompt" | "n8n">("prompt");
  const [hasSaved, setHasSaved] = useState(false);
  const [copiedTextId, setCopiedTextId] = useState<string | null>(null);

  const handleSaveSettings = (e: FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      identity,
      tone,
      rules,
      showImage,
      showPrice,
      showActionButton,
      actionButtonText
    });
    setHasSaved(true);
    setTimeout(() => setHasSaved(false), 2500);
  };

  const handleCopyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTextId(id);
    setTimeout(() => setCopiedTextId(null), 2000);
  };

  // Generate URL for n8n API call
  const n8nProductsEndpoint = supabaseConfig.url 
    ? `${supabaseConfig.url.replace(/\/$/, "")}/rest/v1/products?select=*`
    : "https://SEU-PROJETO.supabase.co/rest/v1/products?select=*";

  const n8nConfigEndpoint = supabaseConfig.url 
    ? `${supabaseConfig.url.replace(/\/$/, "")}/rest/v1/chatbot_config?select=*`
    : "https://SEU-PROJETO.supabase.co/rest/v1/chatbot_config?select=*";

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-150 pb-4">
        <div>
          <h2 className="text-xl font-display font-semibold text-zinc-950 flex items-center gap-2">
            <Settings className="w-5.5 h-5.5 text-emerald-600" />
            Configuração da Inteligência Artificial
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">Defina as diretrizes do prompt da Stella e obtenha os dados de integração com n8n</p>
        </div>

        <div className="flex space-x-1.5 bg-zinc-100 p-1 rounded-xl border border-zinc-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab("prompt")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === "prompt"
                ? "bg-white text-zinc-950 shadow-3xs"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <Sliders className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />
            Prompt & Regras
          </button>
          <button
            onClick={() => setActiveSubTab("n8n")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === "n8n"
                ? "bg-white text-zinc-950 shadow-3xs"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <Zap className="w-3.5 h-3.5 inline mr-1 text-emerald-600 animate-pulse" />
            Integração n8n & Evolution
          </button>
        </div>
      </div>

      {activeSubTab === "prompt" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main prompt editing area */}
          <div className="lg:col-span-2 bg-white border border-zinc-150 rounded-2xl p-6 shadow-3xs space-y-6">
            <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              Parâmetros de Identidade e Prompt
            </h3>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Bot Name */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Identidade / Nome do Robô *</label>
                  <input
                    type="text"
                    required
                    value={identity}
                    onChange={(e) => setIdentity(e.target.value)}
                    className="w-full bg-zinc-55 border border-zinc-200 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-zinc-400 focus:bg-white text-zinc-800"
                    placeholder="Ex: Atendente Stella"
                  />
                </div>

                {/* Tone config */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Tom de Voz Principal *</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full bg-zinc-55 border border-zinc-200 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-zinc-400 focus:bg-white text-zinc-800"
                  >
                    <option value="Prestativo, elegante, engajador e levemente focado em conversão de vendas">Prestativo e Vendedor (Levemente Comercial)</option>
                    <option value="Altamente técnico, profissional, sério e focado em detalhes de especificação">Profissional & Técnico (Formal)</option>
                    <option value="Divertido, jovem, animado, usa emojis e focado em moda street style">Descontraído & Cool (Usa emojis)</option>
                    <option value="Calmo, empático, paciente e focado em bem-estar">Empático & Acolhedor (Soft)</option>
                  </select>
                </div>
              </div>

              {/* Rules / Instructions */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Diretrizes de Operação (System Prompts) *</label>
                <textarea
                  rows={6}
                  required
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  className="w-full bg-zinc-55 border border-zinc-200 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-zinc-400 focus:bg-white text-zinc-800 leading-relaxed font-mono"
                  placeholder="Escreva as regras que o chatbot de WhatsApp integrado deve seguir à risca..."
                />
                <p className="text-[10px] text-zinc-400 mt-1">
                  Insira diretrizes como políticas de devolução, frete, comportamento ou formas de pagamento para que a IA consulte.
                </p>
              </div>

              {/* visual preference display switches */}
              <div className="border-t border-zinc-100 pt-4 space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Preferências de Formatação do Chatbot
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 p-2.5 bg-zinc-55 border border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-100 transition-colors select-none font-semibold">
                    <input 
                      type="checkbox" 
                      checked={showImage}
                      onChange={(e) => setShowImage(e.target.checked)}
                      className="rounded-xs accent-emerald-600 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-[11px] text-zinc-700">Recomendar Imagens</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 bg-zinc-55 border border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-100 transition-colors select-none font-semibold">
                    <input 
                      type="checkbox" 
                      checked={showPrice}
                      onChange={(e) => setShowPrice(e.target.checked)}
                      className="rounded-xs accent-emerald-600 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-[11px] text-zinc-700">Enviar Preços</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 bg-zinc-55 border border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-100 transition-colors select-none font-semibold">
                    <input 
                      type="checkbox" 
                      checked={showActionButton}
                      onChange={(e) => setShowActionButton(e.target.checked)}
                      className="rounded-xs accent-emerald-600 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-[11px] text-zinc-700">Botão de Compra</span>
                  </label>
                </div>
              </div>

              {showActionButton && (
                <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-150">
                  <label className="block text-[10px] font-bold text-zinc-600 mb-1 uppercase tracking-wider">Texto do Botão de Compra/Link</label>
                  <input
                    type="text"
                    required
                    value={actionButtonText}
                    onChange={(e) => setActionButtonText(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-zinc-400 text-zinc-800"
                    placeholder="Quero Comprar"
                  />
                </div>
              )}

              {/* Form submit */}
              <div className="flex items-center justify-between border-t border-zinc-100 pt-4 bg-white">
                <span className="text-[10px] text-zinc-450">💡 Essas chaves são salvas no Supabase e lidas pelo seu n8n.</span>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {hasSaved ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-250 font-bold" />
                      Salvo com Sucesso!
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      Salvar Alterações
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Right sidebar info on what this prompt does */}
          <div className="space-y-4">
            <div className="bg-zinc-950 text-white rounded-2xl p-5 border border-zinc-850 shadow-md">
              <h4 className="font-display font-semibold text-xs text-white flex items-center gap-1.5 mb-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                Como a IA lê essas regras?
              </h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Quando um cliente envia uma mensagem no WhatsApp do chatbot, seu fluxo do **n8n** deve buscar essa linha de configuração no Supabase.
              </p>
              <p className="text-[11px] text-zinc-400 leading-relaxed mt-2">
                O prompt do modelo (como o Gemini ou GPT-4) deve ser alimentado com as **Diretrizes de Operação** inseridas ao lado, atuando como a <em>System Instruction</em> principal do assistente.
              </p>
            </div>

            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 text-left">
              <h4 className="text-[11px] font-bold text-emerald-850 flex items-center gap-1.5 mb-1.5">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                Guia de Melhores Práticas
              </h4>
              <ul className="text-[10px] text-emerald-700 space-y-1.5 list-disc pl-4 font-semibold leading-relaxed">
                <li>Seja específico nas regras do System Prompt.</li>
                <li>Defina preços claros e restrições de estoque.</li>
                <li>Diga para a IA sempre enviar a URL pública da foto quando o cliente pedir imagens de um produto.</li>
              </ul>
            </div>
          </div>

        </div>
      ) : (
        /* Aba 2: n8n Integration Guide */
        <div className="bg-white border border-zinc-150 rounded-2xl p-6 shadow-3xs space-y-6">
          <div className="border-b border-zinc-100 pb-4">
            <h3 className="font-semibold text-sm text-zinc-900 flex items-center gap-2">
              <Zap className="w-4.5 h-4.5 text-amber-500 fill-amber-400 animate-pulse" />
              Guia de Integração: n8n + Evolution API + Supabase
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">Veja como conectar seu bot de WhatsApp para ler os produtos deste painel</p>
          </div>

          {/* Integration Blueprint steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            {/* Step 1: Querying Supabase in n8n */}
            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-150 flex flex-col justify-between space-y-4">
              <div>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-extrabold mb-3">1</span>
                <h4 className="font-bold text-xs text-zinc-800">Buscar Catálogo de Produtos no n8n</h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed mt-1">
                  No seu fluxo do n8n, adicione um nó de **HTTP Request** ou o nó oficial do **Supabase** para listar todos os produtos disponíveis. A URL da requisição HTTP direta é:
                </p>
              </div>

              <div className="bg-zinc-900 text-white rounded-xl p-3 relative font-mono text-[10px] break-all select-all">
                {n8nProductsEndpoint}
                <button
                  type="button"
                  onClick={() => handleCopyToClipboard(n8nProductsEndpoint, "api-prod")}
                  className="absolute top-2 right-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white p-1 rounded-md transition-colors"
                  title="Copiar URL"
                >
                  {copiedTextId === "api-prod" ? <Check className="w-3.5 h-3.5 text-emerald-450" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <p className="text-[9px] text-zinc-400 leading-normal">
                💡 **Headers obrigatórios**:
                <br />`apikey: SUACHAVE_ANON`
                <br />`Authorization: Bearer SUACHAVE_ANON`
              </p>
            </div>

            {/* Step 2: Querying Chatbot system instruction */}
            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-150 flex flex-col justify-between space-y-4">
              <div>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-extrabold mb-3">2</span>
                <h4 className="font-bold text-xs text-zinc-800">Buscar Prompt da Stella no n8n</h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed mt-1">
                  Para que a personalidade da Stella seja alimentada a partir deste painel, consulte as configurações do prompt na tabela correspondente. Endpoint da requisição:
                </p>
              </div>

              <div className="bg-zinc-900 text-white rounded-xl p-3 relative font-mono text-[10px] break-all select-all">
                {n8nConfigEndpoint}
                <button
                  type="button"
                  onClick={() => handleCopyToClipboard(n8nConfigEndpoint, "api-conf")}
                  className="absolute top-2 right-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white p-1 rounded-md transition-colors"
                  title="Copiar URL"
                >
                  {copiedTextId === "api-conf" ? <Check className="w-3.5 h-3.5 text-emerald-450" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <p className="text-[9px] text-zinc-400 leading-normal">
                💡 **Uso prático**: O n8n pega as `rules`, `identity` e `tone` e constrói o prompt mestre do agente de inteligência artificial de forma dinâmica.
              </p>
            </div>

          </div>

          {/* Workflow overview diagram or summary */}
          <div className="border-t border-zinc-100 pt-6">
            <h4 className="font-bold text-xs text-zinc-800 mb-2.5 flex items-center gap-1.5">
              <Network className="w-4 h-4 text-emerald-600" />
              Arquitetura de Fluxo Recomendada (n8n + Evolution API)
            </h4>
            
            <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-150 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-center text-xs font-bold text-zinc-700">
                <div className="bg-zinc-900 text-white p-3 rounded-xl border border-zinc-800">
                  📱 WhatsApp
                  <p className="text-[9px] text-zinc-400 font-medium font-semibold mt-1">Cliente envia msg</p>
                </div>
                <div className="text-zinc-400 font-extrabold text-sm">➔</div>
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-emerald-805">
                  🔗 Evolution API
                  <p className="text-[9px] text-emerald-600 font-medium font-semibold mt-1">Dispara Webhook</p>
                </div>
                <div className="text-zinc-400 font-extrabold text-sm">➔</div>
                <div className="bg-emerald-600 text-white p-3 rounded-xl col-span-1 md:col-span-1 shadow-xs">
                  ⚡ n8n Workflow
                  <p className="text-[9px] text-emerald-200 font-medium font-semibold mt-1">Consulta Supabase + IA</p>
                </div>
              </div>
              
              <div className="text-[11px] text-zinc-500 leading-relaxed pt-2 space-y-2">
                <p>
                  1. **Webhook**: O n8n recebe as mensagens do cliente enviadas pelo webhook da **Evolution API**.
                </p>
                <p>
                  2. **Supabase Node**: O n8n consulta os **produtos** com estoque ativo e as diretrizes do **prompt da Stella** salvos no Supabase.
                </p>
                <p>
                  3. **AI Agent Node (n8n)**: O n8n passa o histórico do chat, a mensagem do cliente, a lista de produtos e o prompt mestre para o modelo de inteligência artificial (como Gemini ou OpenAI).
                </p>
                <p>
                  4. **Resposta**: O n8n envia a resposta formatada de volta para o cliente via nó da **Evolution API** no WhatsApp.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
