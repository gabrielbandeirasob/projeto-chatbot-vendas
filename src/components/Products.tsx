import React, { useState, FormEvent } from "react";
import { Product, Category, SupabaseConfig } from "../types";
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit2, 
  Sparkles, 
  Package, 
  Tag, 
  Check, 
  X,
  XCircle,
  HelpCircle,
  UploadCloud,
  Globe,
  Sliders
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ProductsProps {
  products: Product[];
  categories: Category[];
  onAddProduct: (product: Omit<Product, "id">) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  supabaseConfig: SupabaseConfig;
  onUpdateSupabaseConfig: (config: SupabaseConfig) => void;
}

export default function Products({ 
  products, 
  categories, 
  onAddProduct, 
  onEditProduct, 
  onDeleteProduct,
  supabaseConfig,
  onUpdateSupabaseConfig
}: ProductsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  
  // Modal / Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New Form Fields
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState(0);
  const [formCategory, setFormCategory] = useState("");
  const [formStock, setFormStock] = useState(1);
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formGender, setFormGender] = useState("Unissex");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formDescription, setFormDescription] = useState("");

  // Supabase Integration States
  const [imgSourceType, setImgSourceType] = useState<"url" | "upload">("url");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const handleUpdateSupabaseConfig = (key: keyof SupabaseConfig, value: string) => {
    onUpdateSupabaseConfig({
      ...supabaseConfig,
      [key]: value
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("O tamanho da imagem excede o limite de 5MB.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const { url, anonKey, bucket } = supabaseConfig;
      if (!url || !anonKey) {
        throw new Error("Por favor, configure as credenciais do seu Supabase na gaveta abaixo antes de enviar.");
      }

      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const fileName = `${timestamp}-${sanitizedName}`;
      const cleanUrl = url.replace(/\/$/, "");
      const uploadUrl = `${cleanUrl}/storage/v1/object/${bucket}/${fileName}`;

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "apikey": anonKey,
          "Authorization": `Bearer ${anonKey}`,
          "Content-Type": file.type
        },
        body: file
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Erro no Supabase: ${errText || response.statusText}`);
      }

      const publicUrl = `${cleanUrl}/storage/v1/object/public/${bucket}/${fileName}`;
      setFormImageUrl(publicUrl);
      setUploadSuccess(true);
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Erro inesperado ao realizar o upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenAddForm = () => {
    setEditingProduct(null);
    setFormName("");
    setFormPrice(0);
    setFormCategory(categories[0]?.name || "Vestuário");
    setFormStock(10);
    setFormImageUrl("");
    setFormGender("Unissex");
    setFormFeatured(false);
    setFormDescription("");
    setUploadError(null);
    setUploadSuccess(false);
    setImgSourceType("url");
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormPrice(product.price);
    setFormCategory(product.category);
    setFormStock(product.stock);
    setFormImageUrl(product.imageUrl);
    setFormGender(product.gender);
    setFormFeatured(product.featured);
    setFormDescription(product.description);
    setUploadError(null);
    setUploadSuccess(false);
    setImgSourceType(product.imageUrl.includes("supabase.co") ? "upload" : "url");
    setIsFormOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const dataValue = {
      name: formName,
      price: Number(formPrice) || 0,
      category: formCategory || "Vestuário",
      stock: Number(formStock) || 0,
      imageUrl: formImageUrl.trim() || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
      gender: formGender,
      featured: formFeatured,
      description: formDescription.trim(),
    };

    if (editingProduct) {
      onEditProduct({
        ...dataValue,
        id: editingProduct.id
      });
    } else {
      onAddProduct(dataValue);
    }
    setIsFormOpen(false);
  };

  // Inline Stock adjustment helpers
  const handleAdjustStock = (product: Product, delta: number) => {
    const updatedStock = Math.max(0, product.stock + delta);
    onEditProduct({
      ...product,
      stock: updatedStock
    });
  };

  const handleToggleFeatured = (product: Product) => {
    onEditProduct({
      ...product,
      featured: !product.featured
    });
  };

  // Filter products list
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-semibold text-zinc-950">Catálogo de Produtos</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Gerencie os itens do estoque e a vitrine virtual</p>
        </div>
        <button
          id="btn-add-product"
          onClick={handleOpenAddForm}
          className="inline-flex items-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl px-4 py-2.5 text-xs font-semibold shadow-xs hover:shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Novo Produto
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-3xs">
        
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            id="search-input"
            type="text"
            placeholder="Buscar por nome ou descrição..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-55 border border-zinc-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-hidden focus:border-zinc-400 focus:bg-white text-zinc-800 transition-colors"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filtrar:
          </span>
          <button
            onClick={() => setSelectedCategory("Todos")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              selectedCategory === "Todos"
                ? "bg-zinc-900 text-white shadow-3xs"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-150"
            }`}
          >
            Todos ({products.length})
          </button>
          
          {categories.map(cat => {
            const count = products.filter(p => p.category.toLowerCase() === cat.name.toLowerCase()).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedCategory === cat.name
                    ? "bg-zinc-900 text-white shadow-3xs"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-150"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Product List/Grid View */}
      {filteredProducts.length === 0 ? (
        <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-12 text-center max-w-lg mx-auto mt-6">
          <Package className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-zinc-800">Nenhum produto localizado</h3>
          <p className="text-xs text-zinc-500 mt-1">Limpe os filtros de busca ou cadastre novos produtos no catálogo.</p>
          <button
            onClick={() => { setSearchQuery(""); setSelectedCategory("Todos"); }}
            className="mt-4 text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline"
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredProducts.map(product => {
              const isLowStock = product.stock > 0 && product.stock <= 3;
              const isOutOfStock = product.stock === 0;

              return (
                <motion.div
                  key={product.id}
                  layoutId={`product-card-${product.id}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-3xs hover:shadow-md transition-shadow relative flex flex-col justify-between"
                >
                  {/* Photo area */}
                  <div className="relative h-44 bg-zinc-100 shrink-0">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Dark gradient overlap */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                    {/* Gender badge */}
                    <span className="absolute top-2.5 left-2.5 bg-black/40 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase">
                      {product.gender}
                    </span>

                    {/* Stock Alert Badge */}
                    {isOutOfStock && (
                      <span className="absolute top-2.5 right-2.5 bg-rose-600 text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold shadow-xs">
                        Esgotado
                      </span>
                    )}
                    {!isOutOfStock && isLowStock && (
                      <span className="absolute top-2.5 right-2.5 bg-amber-500 text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold shadow-xs animate-pulse">
                        Estoque Crítico ({product.stock})
                      </span>
                    )}

                    {/* Product Name bottom details */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                      <p className="text-[10px] text-zinc-300 font-medium tracking-wide uppercase">{product.category}</p>
                      <h4 className="font-display font-medium text-sm truncate leading-tight mt-0.5" title={product.name}>
                        {product.name}
                      </h4>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <p className="text-zinc-500 text-[11px] line-clamp-2 leading-relaxed min-h-[32px]">
                      {product.description || "Sem descrição disponível."}
                    </p>

                    <div className="flex items-center justify-between border-t border-zinc-50 pt-2.5">
                      {/* Price info */}
                      <div>
                        <span className="text-[9px] text-zinc-400 block uppercase font-semibold">Preço Unitário</span>
                        <span className="font-display font-bold text-sm text-zinc-900">
                          R$ {product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      {/* Stock in-line control */}
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] text-zinc-400 block uppercase font-semibold mb-1">Qtd. Estoque</span>
                        <div className="flex items-center bg-zinc-50 border border-zinc-150 rounded-lg p-0.5 shadow-3xs">
                          <button
                            title="Remover estoque"
                            onClick={() => handleAdjustStock(product, -1)}
                            className="w-5 h-5 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 hover:text-zinc-950 rounded-md transition-colors font-bold text-xs"
                          >
                            -
                          </button>
                          <span className="w-7 text-center text-xs font-mono font-bold text-zinc-800">
                            {product.stock}
                          </span>
                          <button
                            title="Adicionar estoque"
                            onClick={() => handleAdjustStock(product, 1)}
                            className="w-5 h-5 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 hover:text-zinc-950 rounded-md transition-colors font-bold text-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Featured & Action Row */}
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-50 gap-2">
                      {/* Toggle highlight (featured) */}
                      <button
                        onClick={() => handleToggleFeatured(product)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                          product.featured
                            ? "bg-amber-50 text-amber-600 border border-amber-200"
                            : "bg-zinc-50 text-zinc-400 border border-zinc-200 hover:text-zinc-600 hover:border-zinc-300"
                        }`}
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${product.featured ? "fill-amber-400" : ""}`} />
                        {product.featured ? "Destaque" : "Destacar"}
                      </button>

                      {/* Delete, Edit buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditForm(product)}
                          className="w-7 h-7 flex items-center justify-center bg-zinc-50 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 rounded-lg border border-zinc-150 transition-colors cursor-pointer"
                          title="Editar informações"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteProduct(product.id)}
                          className="w-7 h-7 flex items-center justify-center bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-700 rounded-lg border border-rose-100 transition-colors cursor-pointer"
                          title="Excluir produto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Product Form Modal (Slide-over/overlay dialog) */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-zinc-150 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50">
              <div>
                <h3 className="font-display font-semibold text-sm text-zinc-900">
                  {editingProduct ? "Editar Produto" : "Cadastrar Novo Produto"}
                </h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">Preencha os dados técnicos do item em estoque</p>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-800 hover:border-zinc-300 shadow-3xs cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Nome do Produto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Tênis Air Max Extreme"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-zinc-400 focus:bg-white text-zinc-805"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Preço (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="250.00"
                    value={formPrice || ""}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-zinc-400 focus:bg-white text-zinc-805"
                  />
                </div>

                {/* Initial Stock */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Estoque Inicial *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="10"
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-zinc-400 focus:bg-white text-zinc-805"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Categoria *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-zinc-400 focus:bg-white text-zinc-805"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Gender selection */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Gênero Alvo</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-zinc-400 focus:bg-white text-zinc-805"
                  >
                    <option value="Unissex">Unissex</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                  </select>
                </div>
              </div>

              {/* Cover Image Source Selector */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-2">Origem da Foto do Produto</label>
                <div className="flex gap-2 p-1 bg-zinc-100 rounded-lg border border-zinc-200 mb-3">
                  <button
                    type="button"
                    onClick={() => setImgSourceType("url")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      imgSourceType === "url"
                        ? "bg-white text-zinc-950 shadow-3xs"
                        : "text-zinc-500 hover:text-zinc-900"
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Link Externo (URL)
                  </button>
                  <button
                    type="button"
                    onClick={() => setImgSourceType("upload")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      imgSourceType === "upload"
                        ? "bg-white text-zinc-950 shadow-3xs"
                        : "text-zinc-500 hover:text-zinc-900"
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Upload Supabase
                  </button>
                </div>

                {imgSourceType === "url" ? (
                  <div className="space-y-1">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-zinc-400 focus:bg-white text-zinc-805 font-mono text-[11px]"
                    />
                    <p className="text-[10px] text-zinc-400">Insira a URL pública da foto do produto.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Supabase config reminder if not configured */}
                    {(!supabaseConfig.url || !supabaseConfig.anonKey) ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left">
                        <p className="text-[11px] font-semibold text-amber-800 flex items-center gap-1.5">
                          ⚠️ Supabase Não Configurado
                        </p>
                        <p className="text-[10px] text-amber-600 mt-1 leading-relaxed">
                          Para fazer upload direto, configure suas chaves do Supabase na gaveta expansível abaixo.
                        </p>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-zinc-200 hover:border-zinc-350 rounded-xl p-5 text-center bg-zinc-50/50 hover:bg-zinc-50 transition-colors relative">
                        <input
                          type="file"
                          accept="image/*"
                          id="supabase-file-upload"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={handleFileChange}
                          disabled={isUploading}
                        />
                        <div className="space-y-1 pointer-events-none">
                          <UploadCloud className={`w-8 h-8 text-zinc-400 mx-auto ${isUploading ? "animate-bounce" : ""}`} />
                          <p className="text-xs font-semibold text-zinc-700">
                            {isUploading ? "Enviando arquivo para o Supabase..." : "Clique ou arraste a imagem aqui"}
                          </p>
                          <p className="text-[10px] text-zinc-455">PNG, JPG, WEBP de até 5MB</p>
                        </div>
                      </div>
                    )}

                    {/* Upload progress & status */}
                    {uploadError && (
                      <div className="bg-rose-50 border border-rose-100 text-rose-700 px-3 py-2 rounded-lg text-[10px] font-semibold">
                        ❌ {uploadError}
                      </div>
                    )}
                    
                    {uploadSuccess && (
                      <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-2 rounded-lg text-[10px] font-semibold flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Foto carregada e salva com sucesso no Supabase!
                      </div>
                    )}

                    {/* Image Preview Thumbnail */}
                    {formImageUrl && (
                      <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-150 p-2.5 rounded-xl">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200">
                          <img src={formImageUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-zinc-450 block uppercase tracking-wider">URL Atual da Foto</span>
                          <p className="text-[10px] font-mono text-zinc-700 truncate" title={formImageUrl}>{formImageUrl}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormImageUrl("")}
                          className="text-zinc-400 hover:text-rose-600 p-1 transition-colors"
                          title="Remover foto"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Descrição</label>
                <textarea
                  rows={3}
                  placeholder="Forneça detalhes como material, caimento e indicações..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-zinc-400 focus:bg-white text-zinc-805"
                />
              </div>

              {/* Promote toggle (featured checkbox) */}
              <label className="flex items-center gap-2 p-2.5 bg-zinc-50 border border-zinc-150 rounded-lg cursor-pointer hover:bg-zinc-100 transition-colors">
                <input 
                  type="checkbox" 
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  className="rounded-sm accent-amber-500 w-4 h-4 cursor-pointer"
                />
                <div className="text-left">
                  <span className="text-xs font-bold text-zinc-800 block flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    Destacar Produto no Catálogo
                  </span>
                  <span className="text-[10px] text-zinc-500">Stella prioriza produtos de destaque ao dar conselhos para clientes indecisos.</span>
                </div>
              </label>

              {/* Supabase configuration settings drawer */}
              <div className="border-t border-zinc-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsConfigOpen(!isConfigOpen)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition-colors py-1 cursor-pointer select-none"
                >
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    Configurar Conexão do Supabase (Banco de Dados & Storage)
                  </span>
                  <span className="text-[10px]">{isConfigOpen ? "▲ Recolher" : "▼ Expandir"}</span>
                </button>

                <AnimatePresence>
                  {isConfigOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden mt-3 space-y-3 bg-zinc-50 p-3 rounded-xl border border-zinc-150"
                    >
                      <p className="text-[10px] text-zinc-505 leading-relaxed">
                        Insira as credenciais do seu projeto Supabase para ativar a sincronização em tempo real de produtos, categorias e prompts, além de habilitar o upload de imagens. Os dados serão gravados de forma segura nas tabelas do seu Supabase para consulta imediata pela sua automação do n8n.
                      </p>

                      <div className="space-y-2">
                        {/* URL */}
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-650 uppercase mb-1">Supabase Project URL</label>
                          <input
                            type="url"
                            placeholder="Ex: https://xyzcompany.supabase.co"
                            value={supabaseConfig.url}
                            onChange={(e) => handleUpdateSupabaseConfig("url", e.target.value)}
                            className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-zinc-400 text-zinc-800 font-mono"
                          />
                        </div>

                        {/* Anon Key */}
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-650 uppercase mb-1">Supabase Anon Key</label>
                          <input
                            type="password"
                            placeholder="Sua anon / public key..."
                            value={supabaseConfig.anonKey}
                            onChange={(e) => handleUpdateSupabaseConfig("anonKey", e.target.value)}
                            className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-zinc-400 text-zinc-800 font-mono"
                          />
                        </div>

                        {/* Bucket Name */}
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-650 uppercase mb-1">Bucket de Destino</label>
                          <input
                            type="text"
                            placeholder="Ex: produtos"
                            value={supabaseConfig.bucket}
                            onChange={(e) => handleUpdateSupabaseConfig("bucket", e.target.value)}
                            className="w-full bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-zinc-400 text-zinc-800"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Form Actions Footer */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100 bg-white">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-3xs transition-colors"
                >
                  {editingProduct ? "Salvar Alterações" : "Adicionar ao Estoque"}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
