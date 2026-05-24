import React, { useState, useRef, useEffect, FormEvent, ReactNode } from "react";
import { Product, ChatbotConfig, ChatMessage } from "../types";
import { 
  Bot, 
  Send, 
  Sparkles, 
  Settings, 
  RefreshCw, 
  Smile, 
  FileText, 
  Sliders, 
  Check, 
  User, 
  ShoppingBag,
  ExternalLink,
  Zap
} from "lucide-react";
import { motion } from "motion/react";

interface ChatbotSimulatorProps {
  products: Product[];
  config: ChatbotConfig;
  onSaveConfig: (newConfig: ChatbotConfig) => void;
}

export default function ChatbotSimulator({ products, config, onSaveConfig }: ChatbotSimulatorProps) {
  // Config state
  const [identity, setIdentity] = useState(config.identity);
  const [tone, setTone] = useState(config.tone);
  const [rules, setRules] = useState(config.rules);
  const [showImage, setShowImage] = useState(config.showImage);
  const [showPrice, setShowPrice] = useState(config.showPrice);
  const [showActionButton, setShowActionButton] = useState(config.showActionButton);
  const [actionButtonText, setActionButtonText] = useState(config.actionButtonText);

  const [hasSaved, setHasSaved] = useState(false);

  // Chat conversation states
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "bot",
      text: `Olá! Eu sou a **${config.identity}**, sua assistente de inteligência artificial. Como posso ajudar com nossa vitrine e estoque hoje? Pergunte por itens específicos, marcas ou recomendações!`,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const conversationEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

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

    // Append alert from the renovated bot info
    const newMsg: ChatMessage = {
      id: `m-renov-${Date.now()}`,
      sender: "bot",
      text: `🔄 *Configurações atualizadas!* Meu nome foi definido para **${identity}**, agindo sob o tom "${tone}". Como posso ajudar com nosso novo catálogo?`,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    };
    setMessages(prev => [...prev, newMsg]);
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    try {
      // Gather chat history for model (excluding the initial welcome just to focus prompt token capacity)
      const chatHistory = messages
        .filter(m => m.id !== "welcome")
        .map(m => ({
          role: m.sender === "user" ? "user" : "model",
          text: m.text
        }));

      // Send to server
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: textToSend,
          history: chatHistory,
          config: {
            identity,
            tone,
            rules,
            products // Sends updated list from state
          }
        })
      });

      if (!response.ok) {
        throw new Error("Erro na rede ou falha de requisição.");
      }

      const data = await response.json();
      
      const botResponse: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: "bot",
        text: data.text || "Desculpe, tive um contratempo para responder. Pode repetir?",
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error("Chatbot API response error:", error);
      
      // Stand-in model simulator answer (useful if key is absent or network fails block requests)
      const keyword = textToSend.toLowerCase();
      let replyText = "";
      
      if (keyword.includes("olá") || keyword.includes("oi")) {
        replyText = `Oi! Sou a ${identity} (Módulo de Simulação). Vi que a API do Gemini não pôde ser consultada agora. Mas posso te dar detalhes! Qual produto você quer conhecer?`;
      } else if (keyword.includes("destaque") || keyword.includes("recomenda") || keyword.includes("melhor")) {
        const featured = products.filter(p => p.featured)[0] || products[0];
        replyText = `Com certeza! Recomendo muito o nosso produto premium em destaque: **${featured.name}** por apenas *R$ ${featured.price.toFixed(2)}*. Temos ${featured.stock} em estoque! ![alt](${featured.imageUrl})`;
      } else if (keyword.includes("preço") || keyword.includes("quanto custa") || keyword.includes("tênis") || keyword.includes("tenis")) {
        const tenis = products.find(p => p.category.toLowerCase() === "calçados") || products[0];
        replyText = `O nosso modelo mais procurado na categoria é o **${tenis.name}**, saindo por *R$ ${tenis.price.toFixed(2)}*. Restam apenas ${tenis.stock} mercadorias. Aproveite! ![img](${tenis.imageUrl})`;
      } else {
        replyText = `Olha, que legal essa pergunta! Como estou em modo de simulação offline, posso te dizer que o nosso catálogo possui **${products.length} itens cadastrados** nas categorias. Qual categoria quer explorar?`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `msg-bot-sim-${Date.now()}`,
          sender: "bot",
          text: replyText,
          timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: "welcome",
        sender: "bot",
        text: `Olá! Eu sou a **${identity}**, acabo de redefinir nossa conversa. Como posso lhe ajudar hoje?`,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  };

  // Helper text suggestion buttons
  const suggestions = [
    "Quais tênis estão em destaque?",
    "Recomende uma jaqueta leve",
    "Tem óculos de sol?",
    "Quais marcas em calçados?"
  ];

  /* 
    Custom high-fidelity renderer that handles basic markdown tags:
    - Lists: - item
    - Bold: **text**
    - Italic: *text*
    - Image URLs with markdown: ![caption](url)
    This gives premium UI representation without breaking standard react-dom rules!
  */
  const renderMessageContent = (text: string) => {
    // Check if there are markdown image matches
    // regex format: !\[(.*?)\]\((.*?)\)
    const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
    const parts: ReactNode[] = [];
    let lastIndex = 0;
    let match;

    // We'll iterate to parse text and inject structured image cards
    while ((match = imgRegex.exec(text)) !== null) {
      const matchIndex = match.index;
      const textBefore = text.slice(lastIndex, matchIndex);
      
      if (textBefore) {
        parts.push(<span key={`text-${lastIndex}`} className="whitespace-pre-line leading-relaxed">{parseInlineMarkdown(textBefore)}</span>);
      }

      const altText = match[1];
      const imgUrl = match[2];

      // Try to find if this URL fits one of our real products so we can show its price or an action button!
      const matchingProduct = products.find(p => imgUrl.includes(p.imageUrl) || p.imageUrl.includes(imgUrl) || p.name.toLowerCase().includes(altText.toLowerCase()));

      parts.push(
        <div key={`img-card-${matchIndex}`} className="my-3 bg-zinc-50 border border-zinc-150 rounded-xl overflow-hidden shadow-3xs max-w-sm">
          {showImage && (
            <div className="h-40 bg-zinc-100">
              <img 
                src={imgUrl} 
                alt={altText || "Imagem do Produto"} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* Card details based on configuration preferences */}
          <div className="p-3 bg-white">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-zinc-900 truncate">
                {matchingProduct ? matchingProduct.name : altText || "Produto Recomendado"}
              </span>
              {showPrice && matchingProduct && (
                <span className="text-xs font-extrabold text-emerald-600 shrink-0">
                  R$ {matchingProduct.price.toFixed(2)}
                </span>
              )}
            </div>
            
            {matchingProduct && (
              <p className="text-[10px] text-zinc-500 mt-1 line-clamp-2">
                {matchingProduct.description}
              </p>
            )}

            {/* Buy now customized action button */}
            {showActionButton && (
              <button
                onClick={() => {
                  alert(`Produto reservado com sucesso! Stella adicionou ${matchingProduct ? matchingProduct.name : 'Produto'} ao carrinho.`);
                }}
                className="mt-2.5 w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-1.5 text-[10px] font-bold tracking-wide transition-colors uppercase cursor-pointer"
              >
                {actionButtonText}
              </button>
            )}
          </div>
        </div>
      );

      lastIndex = imgRegex.lastIndex;
    }

    const remainingText = text.slice(lastIndex);
    if (remainingText) {
      parts.push(<span key={`text-end-${lastIndex}`} className="whitespace-pre-line leading-relaxed">{parseInlineMarkdown(remainingText)}</span>);
    }

    return parts;
  };

  // Helper method to parse bold and italics in a block
  const parseInlineMarkdown = (text: string) => {
    // Simple inline replacements for bold and italic
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts: ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      const matchIndex = match.index;
      const textBefore = text.slice(lastIndex, matchIndex);

      if (textBefore) {
        parts.push(textBefore); // Simple string
      }

      parts.push(
        <strong key={`bold-${matchIndex}`} className="font-extrabold text-zinc-950">
          {match[1]}
        </strong>
      );

      lastIndex = boldRegex.lastIndex;
    }

    const remainingText = text.slice(lastIndex);
    if (remainingText) {
      parts.push(remainingText);
    }

    return parts;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      
      {/* LEFT: Assistant prompt rules and persona config */}
      <div className="bg-white border border-zinc-150 rounded-2xl p-6 shadow-3xs space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div>
            <h3 className="font-display font-semibold text-zinc-950 flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-600" />
              Parâmetros da Stella
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">Customize regras operacionais e comportamento</p>
          </div>
          
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 animate-pulse border border-emerald-100">
            <Zap className="w-3 h-3 fill-emerald-500" />
            Gemini 3.5 Ativo
          </span>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          {/* Persona Identity & Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Identidade / Nome do Robô *</label>
            <input
              type="text"
              required
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              className="w-full bg-zinc-55 border border-zinc-200 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-zinc-400 focus:bg-white text-zinc-810"
              placeholder="Ex: Atendente Stella"
            />
          </div>

          {/* Tone config */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Tom de Voz Principal *</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full bg-zinc-55 border border-zinc-200 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-zinc-400 focus:bg-white text-zinc-810"
            >
              <option value="Prestativo, elegante, engajador e levemente focado em conversão de vendas">Prestativo e Vendedor (Levemente Comercial)</option>
              <option value="Altamente técnico, profissional, sério e focado em detalhes de especificação">Profissional & Técnico (Formal)</option>
              <option value="Divertido, jovem, animado, usa emojis e focado em moda street style">Descontraído & Cool (Usa emojis)</option>
              <option value="Calmo, empático, paciente e focado em bem-estar">Empático & Acolhedor (Soft)</option>
            </select>
          </div>

          {/* Prompt Guidelines Rules (System Instruction) */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Diretrizes de Operação (System Prompts) *</label>
            <textarea
              rows={4}
              required
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              className="w-full bg-zinc-55 border border-zinc-200 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-zinc-400 focus:bg-white text-zinc-815 leading-relaxed font-mono"
              placeholder="Digite as instruções e comportamentos do robô..."
            />
            <p className="text-[10px] text-zinc-400 mt-1">
              Escreva regras claras que o assistente do Gemini deve seguir à risca nos diálogos com o cliente.
            </p>
          </div>

          {/* Response Visual Guidelines Switches */}
          <div className="border-t border-zinc-100 pt-4 space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-2">
              <Sliders className="w-3.5 h-3.5" />
              Diretrizes de Exibição de Produtos no Chat
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Show image */}
              <label className="flex items-center gap-2 p-2.5 bg-zinc-55 border border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-100 transition-colors select-none">
                <input 
                  type="checkbox" 
                  checked={showImage}
                  onChange={(e) => setShowImage(e.target.checked)}
                  className="rounded-xs accent-emerald-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-[11px] font-semibold text-zinc-700">Mostrar Imagem</span>
              </label>

              {/* Show Price */}
              <label className="flex items-center gap-2 p-2.5 bg-zinc-55 border border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-100 transition-colors select-none font-medium">
                <input 
                  type="checkbox" 
                  checked={showPrice}
                  onChange={(e) => setShowPrice(e.target.checked)}
                  className="rounded-xs accent-emerald-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-[11px] font-semibold text-zinc-700 font-medium">Exibir Preço</span>
              </label>

              {/* Show Action Button */}
              <label className="flex items-center gap-2 p-2.5 bg-zinc-55 border border-zinc-200 rounded-xl cursor-pointer hover:bg-zinc-100 transition-colors select-none font-medium">
                <input 
                  type="checkbox" 
                  checked={showActionButton}
                  onChange={(e) => setShowActionButton(e.target.checked)}
                  className="rounded-xs accent-emerald-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-[11px] font-semibold text-zinc-700 font-medium">Botão "Comprar"</span>
              </label>
            </div>
          </div>

          {showActionButton && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-50 p-3 rounded-lg border border-zinc-150"
            >
              <label className="block text-[10px] font-bold text-zinc-600 mb-1 uppercase tracking-wider">Texto do Botão de Compra</label>
              <input
                type="text"
                required
                value={actionButtonText}
                onChange={(e) => setActionButtonText(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-zinc-400 text-zinc-800"
                placeholder="Quero Comprar"
              />
            </motion.div>
          )}

          {/* Form Actions footer */}
          <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
            <span className="text-[10px] text-zinc-450">⚠️ Sempre registre as regras antes de conversar.</span>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              {hasSaved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  Salvo com Sucesso!
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  Aplicar Configurações
                </>
              )}
            </button>
          </div>
        </form>

      </div>

      {/* RIGHT: LIVE chatbot user interface */}
      <div className="bg-zinc-950 text-white rounded-3xl border border-zinc-800 p-5 shadow-2xl flex flex-col justify-between h-[540px] relative overflow-hidden">
        
        {/* Pattern graphic header background */}
        <div className="absolute inset-x-0 top-0 h-40 bg-radial from-emerald-950/40 via-transparent to-transparent pointer-events-none"></div>

        {/* Header Title bar */}
        <div className="border-b border-zinc-800/80 pb-3 flex items-center justify-between relative z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-xs text-white">{identity}</h3>
              <span className="text-[9px] text-emerald-450 font-medium block flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Atendente Virtual da Loja
              </span>
            </div>
          </div>

          <button
            onClick={handleClearHistory}
            className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Limpar Conversa (Recomeçar)"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Message Container Area */}
        <div className="flex-1 overflow-y-auto px-1 py-4 my-2 space-y-4 scrollbar-thin scrollbar-thumb-zinc-850 scrollbar-track-transparent">
          {messages.map((message) => {
            const isBot = message.sender === "bot";
            return (
              <div 
                key={message.id} 
                className={`flex gap-2.5 max-w-[85%] ${isBot ? "self-start" : "self-end ml-auto flex-row-reverse"}`}
              >
                {/* Avatar icon */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  isBot 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" 
                    : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                }`}>
                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Msg text bubble */}
                <div className={`rounded-2xl p-3.5 text-xs shadow-md ${
                  isBot 
                    ? "bg-zinc-900 text-zinc-200 border border-zinc-800/60 rounded-tl-xs" 
                    : "bg-emerald-600 text-white rounded-tr-xs"
                }`}>
                  <div className="prose prose-invert max-w-none">
                    {renderMessageContent(message.text)}
                  </div>
                  <span className={`text-[9px] mt-1.5 block text-right font-mono ${
                    isBot ? "text-zinc-505" : "text-emerald-250"
                  }`}>
                    {message.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-2.5 max-w-[85%] self-start">
              <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-zinc-900 text-zinc-400 rounded-2xl rounded-tl-xs p-3.5 text-xs border border-zinc-800/60 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-200"></span>
              </div>
            </div>
          )}

          <div ref={conversationEndRef} />
        </div>

        {/* Suggestion Quick Chips */}
        {messages.length === 1 && (
          <div className="px-1 pb-3 shrink-0 relative z-10">
            <p className="text-[10px] text-zinc-400 uppercase font-semibold tracking-wider mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              Tópicos Recomendados
            </p>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(sug)}
                  className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-750 text-zinc-300 hover:text-white rounded-lg px-2.5 py-1 text-[10px] transition-all cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Text Box */}
        <div className="border-t border-zinc-800/80 pt-3 flex gap-2 shrink-0 relative z-10">
          <input
            id="chat-simulator-input"
            type="text"
            disabled={isTyping}
            placeholder="Digite sua mensagem para Stella..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage(inputText)}
            className="flex-1 bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl px-4 py-2 text-xs focus:outline-hidden focus:border-emerald-500 transition-colors disabled:opacity-50"
          />
          <button
            title="Enviar mensagem"
            disabled={!inputText.trim() || isTyping}
            onClick={() => handleSendMessage(inputText)}
            className="w-9 h-9 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-55 text-white rounded-xl flex items-center justify-center transition-colors shadow-xs cursor-pointer select-none"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
