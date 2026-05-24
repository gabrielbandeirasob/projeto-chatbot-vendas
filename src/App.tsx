import { useState, useEffect } from "react";
import { Product, Category, ChatbotConfig } from "./types";
import { 
  initialProducts, 
  initialCategories, 
  defaultChatbotConfig 
} from "./data/initialData";
import Dashboard from "./components/Dashboard";
import Products from "./components/Products";
import Categories from "./components/Categories";
import ChatbotSimulator from "./components/ChatbotSimulator";

// Lucide Icons
import { 
  BarChart3, 
  Package, 
  Layers, 
  Bot, 
  Heart, 
  Github,
  Store,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // 1. Initialize states from LocalStorage or fallback to structured initial data
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem("shop_master_products");
      return saved ? JSON.parse(saved) : initialProducts;
    } catch {
      return initialProducts;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem("shop_master_categories");
      return saved ? JSON.parse(saved) : initialCategories;
    } catch {
      return initialCategories;
    }
  });

  const [chatbotConfig, setChatbotConfig] = useState<ChatbotConfig>(() => {
    try {
      const saved = localStorage.getItem("shop_master_chatbot_config");
      return saved ? JSON.parse(saved) : defaultChatbotConfig;
    } catch {
      return defaultChatbotConfig;
    }
  });

  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "categories" | "chatbot">("dashboard");

  // 2. Persist states in LocalStorage upon changes
  useEffect(() => {
    localStorage.setItem("shop_master_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("shop_master_categories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("shop_master_chatbot_config", JSON.stringify(chatbotConfig));
  }, [chatbotConfig]);

  // 3. Product Action handlers
  const handleAddProduct = (newProd: Omit<Product, "id">) => {
    const p: Product = {
      ...newProd,
      id: `prod-${Date.now()}`
    };
    setProducts(prev => [p, ...prev]);
  };

  const handleEditProduct = (updatedProd: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Deseja realmente remover este produto do catálogo em estoque?")) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  // 4. Category Action handlers
  const handleAddCategory = (newCat: Omit<Category, "id">) => {
    const c: Category = {
      ...newCat,
      id: `cat-${Date.now()}`
    };
    setCategories(prev => [...prev, c]);
  };

  const handleEditCategory = (updatedCat: Category) => {
    setCategories(prev => prev.map(c => c.id === updatedCat.id ? updatedCat : c));
  };

  const handleDeleteCategory = (id: string) => {
    const catToDelete = categories.find(c => c.id === id);
    if (!catToDelete) return;

    const count = products.filter(p => p.category.toLowerCase() === catToDelete.name.toLowerCase()).length;
    if (count > 0) {
      alert(`⚠️ Não é possível remover esta categoria. Existem ${count} produtos associados a ela! Modifique os produtos primeiro.`);
      return;
    }

    if (confirm(`Tem certeza que deseja remover a categoria "${catToDelete.name}"?`)) {
      setCategories(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-zinc-55 text-zinc-900 font-sans flex flex-col justify-between">
      
      {/* Upper Navigation & Brand Banner */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-150">
        <div id="navigation-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-950 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Store className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="font-display font-bold text-sm tracking-tight text-zinc-900">Catálogo & Chatbot</h1>
              <p className="text-[10px] text-zinc-400 tracking-wider uppercase font-semibold">PAINEL DE EXPEDIÇÃO</p>
            </div>
          </div>

          {/* Navigation tab bar selectors */}
          <nav className="flex space-x-1 bg-zinc-100 p-1 rounded-2xl border border-zinc-150">
            <button
              id="tab-dashboard"
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-white text-zinc-950 shadow-3xs"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Visão Geral</span>
            </button>

            <button
              id="tab-products"
              onClick={() => setActiveTab("products")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "products"
                  ? "bg-white text-zinc-950 shadow-3xs"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              <Package className="w-4 h-4 text-emerald-600" />
              <span>Produtos</span>
            </button>

            <button
              id="tab-categories"
              onClick={() => setActiveTab("categories")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "categories"
                  ? "bg-white text-zinc-950 shadow-3xs"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Categorias</span>
            </button>

            <button
              id="tab-chatbot"
              onClick={() => setActiveTab("chatbot")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "chatbot"
                  ? "bg-white text-zinc-950 shadow-3xs hover:bg-white"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              <Bot className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>Stella IA</span>
            </button>
          </nav>

          {/* Quick link button info */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-[11px] font-mono font-medium text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-lg border border-zinc-200">
              v1.2.0 (Gemini 3.5 Ready)
            </span>
          </div>

        </div>
      </header>

      {/* Main Container screen slots */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {activeTab === "dashboard" && (
              <Dashboard 
                products={products} 
                categories={categories} 
              />
            )}

            {activeTab === "products" && (
              <Products 
                products={products} 
                categories={categories}
                onAddProduct={handleAddProduct}
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
              />
            )}

            {activeTab === "categories" && (
              <Categories 
                categories={categories} 
                products={products}
                onAddCategory={handleAddCategory}
                onEditCategory={handleEditCategory}
                onDeleteCategory={handleDeleteCategory}
              />
            )}

            {activeTab === "chatbot" && (
              <ChatbotSimulator 
                products={products}
                config={chatbotConfig}
                onSaveConfig={setChatbotConfig}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Humble craft Footer */}
      <footer className="bg-white border-t border-zinc-150 py-5 mt-10 text-xs text-zinc-500 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 font-medium">
            <Store className="w-4 h-4 text-zinc-400" />
            <span>© 2026 Catálogo & Chatbot Stella Hub. Orgulhosamente desenvolvido para vendas.</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-450 font-medium">
            <span>Desenvolvido com</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>&</span>
            <span className="font-semibold text-zinc-800">Gemini de Google AI</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
