import { Product, Category, ChatbotConfig } from "../types";

export const initialCategories: Category[] = [
  { id: "vestuario", name: "Vestuário", description: "Roupas, Jaquetas, Camisetas e moletons" },
  { id: "calcados", name: "Calçados", description: "Tênis casuais, esportivos e botas" },
  { id: "acessorios", name: "Acessórios", description: "Óculos, relógios, bonés e carteiras" },
  { id: "lifestyle", name: "Lifestyle", description: "Mochilas, garrafas térmicas e itens de treino" },
];

export const initialProducts: Product[] = [
  {
    id: "prod-1",
    name: "Tênis Neo Air Max X",
    price: 649.90,
    category: "Calçados",
    stock: 12,
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
    gender: "Unissex",
    featured: true,
    description: "Design futurista com excelente sistema de amortecimento a ar para o dia a dia."
  },
  {
    id: "prod-2",
    name: "Mochila Urban Explorer 25L",
    price: 289.90,
    category: "Lifestyle",
    stock: 8,
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
    gender: "Unissex",
    featured: true,
    description: "Compartimento acolchoado para notebook de até 16'', materiais resistentes à água e design ergonômico."
  },
  {
    id: "prod-3",
    name: "Jaqueta Corta Vento Tech Carbon",
    price: 399.90,
    category: "Vestuário",
    stock: 15,
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80",
    gender: "Masculino",
    featured: true,
    description: "Tecido corta-vento leve e impermeável com refletivos de segurança para atividades noturnas."
  },
  {
    id: "prod-4",
    name: "Óculos de Sol Matte Obsidian",
    price: 189.90,
    category: "Acessórios",
    stock: 3,
    imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80",
    gender: "Unissex",
    featured: false,
    description: "Lentes polarizadas UV400 com armação ultra leve em policarbonato fosco resistente."
  },
  {
    id: "prod-5",
    name: "Boné Retro Strapback Crema",
    price: 99.90,
    category: "Acessórios",
    stock: 22,
    imageUrl: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=80",
    gender: "Unissex",
    featured: false,
    description: "Lona de algodão puro, bordado frontal minimalista em alta definição e ajuste em fivela de latão."
  },
  {
    id: "prod-6",
    name: "Moletom Over Hoodie Minimal Sand",
    price: 249.90,
    category: "Vestuário",
    stock: 2,
    imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80",
    gender: "Feminino",
    featured: true,
    description: "Modelagem oversized confortável confeccionada em algodão orgânico premium felpado."
  },
  {
    id: "prod-7",
    name: "Relógio Digital Cronos Stealth",
    price: 450.00,
    category: "Acessórios",
    stock: 0,
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    gender: "Masculino",
    featured: false,
    description: "Cronógrafo digital esportivo militar, pulseira de silicone resistente a impactos e à prova d'água 50m."
  }
];

export const defaultChatbotConfig: ChatbotConfig = {
  identity: "Atendente Stella",
  tone: "Prestativo, elegante, engajador e levemente focado em conversão de vendas",
  rules: "1. Cumprimente o cliente com entusiasmo.\n2. Ofereça sugestões de produtos caso ele queira jaquetas, óculos ou calçados.\n3. Sempre use imagens com markdown do tipo ![nome](url) para que fiquem lindas no chat!\n4. Ofereça descontos especiais de 10% para pagamentos via Pix se o cliente hesitar.",
  showImage: true,
  showPrice: true,
  showActionButton: true,
  actionButtonText: "Quero Comprar!"
};
