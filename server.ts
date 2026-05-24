import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Instantiate Gemini Client
  let ai: GoogleGenAI | null = null;
  try {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });
    }
  } catch (err) {
    console.error("Erro ao inicializar o GoogleGenAI:", err);
  }

  // API route for AI Chatbot Simulator
  app.post("/api/chat", async (req, res) => {
    try {
      const { prompt, history, config } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || !ai) {
        return res.status(200).json({
          text: "Chave API não configurada ou inválida. Por favor, configure `GEMINI_API_KEY` nas configurações ou ignore se estiver rodando em ambiente local. Você pode enviar mensagens e irei responder com um modo de simulação!"
        });
      }

      // Build context
      const botIdentity = config?.identity || "Mestre Atendente";
      const botTone = config?.tone || "Profissional, atencioso e persuasivo";
      const botRules = config?.rules || "Sua missão é responder dúvidas sobre nosso estoque de produtos, dar recomendações baseadas no estilo dos clientes e ser muito prestativo.";
      
      // Filter out some unnecessary attributes to keep token size compact
      const formattedProducts = config?.products?.map((p: any) => ({
        id: p.id,
        nome: p.name,
        preco: `R$ ${p.price.toFixed(2)}`,
        categoria: p.category,
        estoque: p.stock,
        genero: p.gender || "unissex",
        urlImagem: p.imageUrl || "",
        emDestaque: p.featured ? "Sim" : "Não"
      })) || [];

      const currentProductsText = formattedProducts.length > 0 
        ? `\nCATÁLOGO DE PRODUTOS DISPONÍVEIS:\n${JSON.stringify(formattedProducts, null, 2)}` 
        : "\nNão há produtos cadastrados no catálogo no momento.";

      const systemInstruction = `Você é o assistente virtual da nossa loja.
Sua Identidade/Nome: "${botIdentity}"
Seu Tom de Voz: "${botTone}"
Regras de atendimento e diretrizes:
"${botRules}"

${currentProductsText}

REGRAS CRÍTICAS DE TEXTO:
1. Responda em Português de forma elegante, respeitando seu tom de voz.
2. Seja objetivo e não gere respostas excessivamente longas.
3. Se o usuário perguntar por produtos, cite exatamente o preço real, apresente os detalhes de forma atraente e, caso queira enviar uma imagem, use a URL da imagem correspondente exata usando markdown clássico: ![nome](urlImagem) para que a imagem seja visualizada em chat.
4. Se o usuário pedir recomendações, baseie-se inteiramente nas categorias e itens de nosso catálogo de produtos disponível acima.`;

      // Transform chat history back into contents
      const contents = [];
      if (history && Array.isArray(history)) {
        for (const msg of history) {
          contents.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.text }]
          });
        }
      }
      contents.push({
        role: "user",
        parts: [{ text: prompt }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Erro na rota de chat:", error);
      res.status(500).json({ error: error.message || "Erro interno do servidor" });
    }
  });

  // Serve static assets or mount Vite Developer Server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
