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
import ChatbotConfigPanel from "./components/ChatbotConfigPanel";
import Login from "./components/Login";

// Lucide Icons
import { 
  BarChart3, 
  Package, 
  Layers, 
  Bot, 
  Heart, 
  Store,
  LogOut,
  Database,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Session tenant identification
  const [activeInstanceId, setActiveInstanceId] = useState<string | null>(() => {
    return sessionStorage.getItem("shop_master_active_instance");
  });

  const instanceId = activeInstanceId || "";

  // 1. Core States (Synchronized between Supabase and Local Fallback)
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [chatbotConfig, setChatbotConfig] = useState<ChatbotConfig>(defaultChatbotConfig);
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>({ url: "", anonKey: "", bucket: "produtos" });

  // 2. Integration / Sincronização States
  const [isSupabaseSynced, setIsSupabaseSynced] = useState(false);
  const [supabaseLoading, setSupabaseLoading] = useState(false);
  const [supabaseError, setSupabaseError] = useState<"connection_failed" | "tables_missing" | null>(null);

  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "categories" | "chatbot">("dashboard");

  // Load Namespaced LocalStorage data as secure fallback
  const loadFromLocalStorage = () => {
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

    // Load chatbot configuration
    try {
      const saved = localStorage.getItem(`shop_master_${instanceId}_chatbot_config`);
      setChatbotConfig(saved ? JSON.parse(saved) : {
        ...defaultChatbotConfig,
        identity: `Stella [${instanceId.toUpperCase()}]`
      });
    } catch {
      setChatbotConfig(defaultChatbotConfig);
    }
  };

  // Asynchronous central loader directly from Supabase REST APIs (PostgREST)
  const loadDataFromSupabase = async (url: string, key: string, bucketName: string) => {
    const cleanUrl = url.replace(/\/$/, "");
    const headers = {
      "apikey": key,
      "Authorization": `Bearer ${key}`
    };

    try {
      setSupabaseLoading(true);
      setSupabaseError(null);

      // 1. Fetch products
      const prodRes = await fetch(`${cleanUrl}/rest/v1/products?select=*`, { headers });
      if (!prodRes.ok) {
        const text = await prodRes.text();
        if (text.includes("does not exist")) {
          setSupabaseError("tables_missing");
          setIsSupabaseSynced(false);
          loadFromLocalStorage();
          return;
        }
        throw new Error("Erro na tabela produtos");
      }
      const prodData = await prodRes.json();

      // 2. Fetch categories
      const catRes = await fetch(`${cleanUrl}/rest/v1/categories?select=*`, { headers });
      if (!catRes.ok) {
        const text = await catRes.text();
        if (text.includes("does not exist")) {
          setSupabaseError("tables_missing");
          setIsSupabaseSynced(false);
          loadFromLocalStorage();
          return;
        }
        throw new Error("Erro na tabela categorias");
      }
      const catData = await catRes.json();

      // 3. Fetch chatbot config
      const configRes = await fetch(`${cleanUrl}/rest/v1/chatbot_config?select=*`, { headers });
      if (!configRes.ok) {
        const text = await configRes.text();
        if (text.includes("does not exist")) {
          setSupabaseError("tables_missing");
          setIsSupabaseSynced(false);
          loadFromLocalStorage();
          return;
        }
        throw new Error("Erro na tabela chatbot_config");
      }
      const configData = await configRes.json();

      // If configuration table is completely empty, insert a fallback row
      let activeConfig = defaultChatbotConfig;
      if (configData && configData.length > 0) {
        activeConfig = configData[0];
      } else {
        // Seed default config into Supabase
        await fetch(`${cleanUrl}/rest/v1/chatbot_config`, {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ...defaultChatbotConfig,
            id: "default"
          })
        });
      }

      setProducts(prodData);
      setCategories(catData);
      setChatbotConfig(activeConfig);
      setIsSupabaseSynced(true);
      setSupabaseError(null);
    } catch (err: any) {
      console.error("Erro ao conectar com o Supabase:", err);
      setSupabaseError("connection_failed");
      setIsSupabaseSynced(false);
      loadFromLocalStorage();
    } finally {
      setSupabaseLoading(false);
    }
  };

  // Main loader reactive to logged instance
  useEffect(() => {
    if (!instanceId) return;

    // Load namespaced supabase config first
    let activeSupabase: SupabaseConfig = { url: "", anonKey: "", bucket: "produtos" };
    try {
      const saved = localStorage.getItem(`shop_master_${instanceId}_supabase_config`);
      if (saved) {
        activeSupabase = JSON.parse(saved);
        setSupabaseConfig(activeSupabase);
      } else {
        setSupabaseConfig(activeSupabase);
      }
    } catch {
      setSupabaseConfig(activeSupabase);
    }

    // Connect dynamically if credentials are valid, else fallback immediately to localstorage
    if (activeSupabase.url && activeSupabase.anonKey) {
      loadDataFromSupabase(activeSupabase.url, activeSupabase.anonKey, activeSupabase.bucket);
    } else {
      setIsSupabaseSynced(false);
      setSupabaseError(null);
      loadFromLocalStorage();
    }
  }, [activeInstanceId]);

  // Sync state changes back to LocalStorage for safety fallback
  useEffect(() => {
    if (instanceId && !isSupabaseSynced) {
      localStorage.setItem(`shop_master_${instanceId}_products`, JSON.stringify(products));
    }
  }, [products, instanceId, isSupabaseSynced]);

  useEffect(() => {
    if (instanceId && !isSupabaseSynced) {
      localStorage.setItem(`shop_master_${instanceId}_categories`, JSON.stringify(categories));
    }
  }, [categories, instanceId, isSupabaseSynced]);

  useEffect(() => {
    if (instanceId && !isSupabaseSynced) {
      localStorage.setItem(`shop_master_${instanceId}_chatbot_config`, JSON.stringify(chatbotConfig));
    }
  }, [chatbotConfig, instanceId, isSupabaseSynced]);

  // 3. Product Action handlers with direct Supabase Syncing
  const handleAddProduct = async (newProd: Omit<Product, "id">) => {
    const p: Product = {
      ...newProd,
      id: `prod-${Date.now()}`
    };

    setProducts(prev => [p, ...prev]);

    if (isSupabaseSynced && supabaseConfig.url && supabaseConfig.anonKey) {
      try {
        const cleanUrl = supabaseConfig.url.replace(/\/$/, "");
        const response = await fetch(`${cleanUrl}/rest/v1/products`, {
          method: "POST",
          headers: {
            "apikey": supabaseConfig.anonKey,
            "Authorization": `Bearer ${supabaseConfig.anonKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(p)
        });
        if (!response.ok) throw new Error("Erro ao sincronizar produto");
      } catch (err) {
        console.error(err);
        alert("⚠️ Salvo localmente, mas não pôde ser gravado no Supabase. Verifique sua conexão.");
      }
    }
  };

  const handleEditProduct = async (updatedProd: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));

    if (isSupabaseSynced && supabaseConfig.url && supabaseConfig.anonKey) {
      try {
        const cleanUrl = supabaseConfig.url.replace(/\/$/, "");
        const response = await fetch(`${cleanUrl}/rest/v1/products?id=eq.${updatedProd.id}`, {
          method: "PATCH",
          headers: {
            "apikey": supabaseConfig.anonKey,
            "Authorization": `Bearer ${supabaseConfig.anonKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(updatedProd)
        });
        if (!response.ok) throw new Error("Erro ao atualizar no Supabase");
      } catch (err) {
        console.error(err);
        alert("⚠️ Modificação salva localmente, mas falhou ao gravar no Supabase.");
      }
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Deseja realmente remover este produto do catálogo?")) return;

    setProducts(prev => prev.filter(p => p.id !== id));

    if (isSupabaseSynced && supabaseConfig.url && supabaseConfig.anonKey) {
      try {
        const cleanUrl = supabaseConfig.url.replace(/\/$/, "");
        const response = await fetch(`${cleanUrl}/rest/v1/products?id=eq.${id}`, {
          method: "DELETE",
          headers: {
            "apikey": supabaseConfig.anonKey,
            "Authorization": `Bearer ${supabaseConfig.anonKey}`
          }
        });
        if (!response.ok) throw new Error("Erro ao deletar no Supabase");
      } catch (err) {
        console.error(err);
        alert("⚠️ Produto removido localmente, mas falhou ao apagar no Supabase.");
      }
    }
  };

  // 4. Category Action handlers with direct Supabase Syncing
  const handleAddCategory = async (newCat: Omit<Category, "id">) => {
    const c: Category = {
      ...newCat,
      id: `cat-${Date.now()}`
    };

    setCategories(prev => [...prev, c]);

    if (isSupabaseSynced && supabaseConfig.url && supabaseConfig.anonKey) {
      try {
        const cleanUrl = supabaseConfig.url.replace(/\/$/, "");
        const response = await fetch(`${cleanUrl}/rest/v1/categories`, {
          method: "POST",
          headers: {
            "apikey": supabaseConfig.anonKey,
            "Authorization": `Bearer ${supabaseConfig.anonKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(c)
        });
        if (!response.ok) throw new Error("Erro ao adicionar categoria no Supabase");
      } catch (err) {
        console.error(err);
        alert("⚠️ Categoria salva localmente, mas falhou ao sincronizar com o Supabase.");
      }
    }
  };

  const handleEditCategory = async (updatedCat: Category) => {
    setCategories(prev => prev.map(c => c.id === updatedCat.id ? updatedCat : c));

    if (isSupabaseSynced && supabaseConfig.url && supabaseConfig.anonKey) {
      try {
        const cleanUrl = supabaseConfig.url.replace(/\/$/, "");
        const response = await fetch(`${cleanUrl}/rest/v1/categories?id=eq.${updatedCat.id}`, {
          method: "PATCH",
          headers: {
            "apikey": supabaseConfig.anonKey,
            "Authorization": `Bearer ${supabaseConfig.anonKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(updatedCat)
        });
        if (!response.ok) throw new Error("Erro ao atualizar categoria no Supabase");
      } catch (err) {
        console.error(err);
        alert("⚠️ Categoria atualizada localmente, mas falhou ao sincronizar com o Supabase.");
      }
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const catToDelete = categories.find(c => c.id === id);
    if (!catToDelete) return;

    const count = products.filter(p => p.category.toLowerCase() === catToDelete.name.toLowerCase()).length;
    if (count > 0) {
      alert(`⚠️ Não é possível remover esta categoria. Existem ${count} produtos associados a ela! Modifique os produtos primeiro.`);
      return;
    }

    if (!confirm(`Tem certeza que deseja remover a categoria "${catToDelete.name}"?`)) return;

    setCategories(prev => prev.filter(c => c.id !== id));

    if (isSupabaseSynced && supabaseConfig.url && supabaseConfig.anonKey) {
      try {
        const cleanUrl = supabaseConfig.url.replace(/\/$/, "");
        const response = await fetch(`${cleanUrl}/rest/v1/categories?id=eq.${id}`, {
          method: "DELETE",
          headers: {
            "apikey": supabaseConfig.anonKey,
            "Authorization": `Bearer ${supabaseConfig.anonKey}`
          }
        });
        if (!response.ok) throw new Error("Erro ao deletar categoria no Supabase");
      } catch (err) {
        console.error(err);
        alert("⚠️ Categoria removida localmente, mas falhou ao deletar no Supabase.");
      }
    }
  };

  // 5. Save Chatbot personality config directly to Supabase config row
  const handleSaveChatbotConfig = async (newConfig: ChatbotConfig) => {
    setChatbotConfig(newConfig);

    if (isSupabaseSynced && supabaseConfig.url && supabaseConfig.anonKey) {
      try {
        const cleanUrl = supabaseConfig.url.replace(/\/$/, "");
        const response = await fetch(`${cleanUrl}/rest/v1/chatbot_config?id=eq.default`, {
          method: "PATCH",
          headers: {
            "apikey": supabaseConfig.anonKey,
            "Authorization": `Bearer ${supabaseConfig.anonKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(newConfig)
        });
        if (!response.ok) throw new Error("Erro ao salvar configuração no Supabase");
      } catch (err) {
        console.error(err);
        alert("⚠️ Parâmetros da IA salvos localmente, mas falhou ao sincronizar com o Supabase.");
      }
    }
  };

  // Supabase Credentials Manager
  const handleUpdateSupabaseConfig = (config: SupabaseConfig) => {
    setSupabaseConfig(config);
    localStorage.setItem(`shop_master_${instanceId}_supabase_config`, JSON.stringify(config));
    
    if (config.url && config.anonKey) {
      loadDataFromSupabase(config.url, config.anonKey, config.bucket);
    } else {
      setIsSupabaseSynced(false);
      setSupabaseError(null);
      loadFromLocalStorage();
    }
  };

  // Login session trigger
  const handleLogin = (id: string) => {
    sessionStorage.setItem("shop_master_active_instance", id);
    setActiveInstanceId(id);
    setActiveTab("dashboard");
  };

  // Logout trigger
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
                
                {/* Supabase status indicator badge */}
                {supabaseLoading ? (
                  <span className="inline-flex items-center text-[9px] font-semibold text-zinc-400 gap-1 animate-pulse">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" /> Conectando...
                  </span>
                ) : isSupabaseSynced ? (
                  <span className="inline-flex items-center bg-emerald-50 text-emerald-650 px-1 py-0.5 rounded-sm font-mono text-[8px] font-extrabold uppercase border border-emerald-100 gap-0.5">
                    <Database className="w-2 h-2" /> Live
                  </span>
                ) : (
                  <span className="inline-flex items-center bg-amber-50 text-amber-650 px-1 py-0.5 rounded-sm font-mono text-[8px] font-extrabold uppercase border border-amber-100">
                    Offline
                  </span>
                )}
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
              <span>Personalizar IA</span>
            </button>
          </nav>

          {/* Quick actions: Logout */}
          <div className="flex items-center gap-2">
            <span className="hidden md:inline text-[10px] font-mono font-medium text-zinc-500 bg-zinc-100 px-2 py-1 rounded-lg border border-zinc-200">
              n8n Ready
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
                onUpdateSupabaseConfig={handleUpdateSupabaseConfig}
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
              <ChatbotConfigPanel 
                config={chatbotConfig}
                onSaveConfig={handleSaveChatbotConfig}
                supabaseConfig={supabaseConfig}
                activeInstanceId={activeInstanceId}
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
            <span>© 2026 Catálogo Stella Hub. Painel de administração de produtos integrado ao Supabase.</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-450 font-medium">
            <span>Desenvolvido com</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>&</span>
            <span className="font-semibold text-zinc-800">Supabase & n8n</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
