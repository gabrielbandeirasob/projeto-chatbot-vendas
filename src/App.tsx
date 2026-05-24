import { useState, useEffect } from "react";
import { Product, Category, ChatbotConfig, SupabaseConfig } from "./types";
import { 
  initialProducts, 
  initialCategories, 
  defaultChatbotConfig 
} from "./data/initialData";
import Dashboard from "./components/Dashboard";
import Products from "./components/Products";
import Categories from "./components/Categories";
import ChatbotSimulator from "./components/ChatbotSimulator";
import Login from "./components/Login";

// Lucide Icons
import { 
  BarChart3, 
  Package, 
  Layers, 
  Bot, 
  Heart, 
  Store,
  LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Session tenant identification
  const [activeInstanceId, setActiveInstanceId] = useState<string | null>(() => {
    return sessionStorage.getItem("shop_master_active_instance");
  });

  const instanceId = activeInstanceId || "";

  // 1. Initialize states dynamically namespaced by active instance ID
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [chatbotConfig, setChatbotConfig] = useState<ChatbotConfig>(defaultChatbotConfig);
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>({ url: "", anonKey: "", bucket: "produtos" });

  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "categories" | "chatbot">("dashboard");

  // Load dynamically upon mounting or instance change
  useEffect(() => {
    if (!instanceId) return;

    // Load products
    try {
      const saved = localStorage.getItem(`shop_master_${instanceId}_products`);
      setProducts(saved ? JSON.parse(saved) : initialProducts);
    } catch {
      setProducts(initialProducts);
    }

    // Load categories
    try {
      const saved = localStorage.getItem(`shop_master_${instanceId}_categories`);
      setCategories(saved ? JSON.parse(saved) : initialCategories);
    } catch {
      setCategories(initialCategories);
    }

    // Load chatbot settings
    try {
      const saved = localStorage.getItem(`shop_master_${instanceId}_chatbot_config`);
      setChatbotConfig(saved ? JSON.parse(saved) : {
        ...defaultChatbotConfig,
        identity: `Stella [${instanceId.toUpperCase()}]` // Custom identity fallback
      });
    } catch {
      setChatbotConfig(defaultChatbotConfig);
    }

    // Load supabase credentials
    try {
      const saved = localStorage.getItem(`shop_master_${instanceId}_supabase_config`);
      setSupabaseConfig(saved ? JSON.parse(saved) : { url: "", anonKey: "", bucket: "produtos" });
    } catch {
      setSupabaseConfig({ url: "", anonKey: "", bucket: "produtos" });
    }
  }, [activeInstanceId]);

  // 2. Persist states in LocalStorage upon changes per active instance
  useEffect(() => {
    if (instanceId) {
      localStorage.setItem(`shop_master_${instanceId}_products`, JSON.stringify(products));
    }
  }, [products, instanceId]);

  useEffect(() => {
    if (instanceId) {
      localStorage.setItem(`shop_master_${instanceId}_categories`, JSON.stringify(categories));
    }
  }, [categories, instanceId]);

  useEffect(() => {
    if (instanceId) {
      localStorage.setItem(`shop_master_${instanceId}_chatbot_config`, JSON.stringify(chatbotConfig));
    }
  }, [chatbotConfig, instanceId]);

  useEffect(() => {
    if (instanceId) {
      localStorage.setItem(`shop_master_${instanceId}_supabase_config`, JSON.stringify(supabaseConfig));
    }
  }, [supabaseConfig, instanceId]);

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

  // Login handler
  const handleLogin = (id: string) => {
    sessionStorage.setItem("shop_master_active_instance", id);
    setActiveInstanceId(id);
    setActiveTab("dashboard");
  };

  // Logout handler
  const handleLogout = () => {
    if (confirm("Deseja realmente sair da conta do seu chatbot atual?")) {
      sessionStorage.removeItem("shop_master_active_instance");
      setActiveInstanceId(null);
    }
  };

  // If not logged in, render the login page
  if (!activeInstanceId) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div key={activeInstanceId} className="min-h-screen bg-zinc-55 text-zinc-900 font-sans flex flex-col justify-between">
      
      {/* Upper Navigation & Brand Banner */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-150 shadow-3xs">
        <div id="navigation-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-950 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Store className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="font-display font-bold text-sm tracking-tight text-zinc-900">Stella Hub</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Instância:</span>
                <span className="inline-flex items-center bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md font-mono text-[9px] font-extrabold border border-emerald-100 uppercase">
                  {activeInstanceId}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation tab bar selectors */}
          <nav className="flex space-x-1 bg-zinc-100 p-1 rounded-2xl border border-zinc-150 max-w-full overflow-x-auto">
            <button
              id="tab-dashboard"
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "chatbot"
                  ? "bg-white text-zinc-950 shadow-3xs hover:bg-white"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              <Bot className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>Simulador</span>
            </button>
          </nav>

          {/* Quick actions: Logout */}
          <div className="flex items-center gap-2">
            <span className="hidden md:inline text-[10px] font-mono font-medium text-zinc-500 bg-zinc-100 px-2 py-1 rounded-lg border border-zinc-200">
              v1.3.0
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 border border-rose-100 transition-colors cursor-pointer select-none"
              title="Sair da Instância"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
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
                supabaseConfig={supabaseConfig}
                onUpdateSupabaseConfig={setSupabaseConfig}
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
            <span>© 2026 Catálogo & Chatbot Stella Hub. Instâncias isoladas em tempo real.</span>
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
