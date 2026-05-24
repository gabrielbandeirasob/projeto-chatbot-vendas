import React, { useState, FormEvent } from "react";
import { Category, Product } from "../types";
import { 
  Plus, 
  Folder, 
  Edit3, 
  Tag, 
  Trash2, 
  Briefcase, 
  FileText,
  Layers,
  ChevronRight
} from "lucide-react";
import { motion } from "motion/react";

interface CategoriesProps {
  categories: Category[];
  products: Product[];
  onAddCategory: (category: Omit<Category, "id">) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
}

export default function Categories({ 
  categories, 
  products, 
  onAddCategory, 
  onEditCategory, 
  onDeleteCategory 
}: CategoriesProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleOpenAddForm = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description);
    setIsFormOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCategory) {
      onEditCategory({
        id: editingCategory.id,
        name: name.trim(),
        description: description.trim()
      });
    } else {
      onAddCategory({
        name: name.trim(),
        description: description.trim()
      });
    }
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-semibold text-zinc-950">Categorias de Produtos</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Defina a taxonomia do inventário para o assistente de IA</p>
        </div>
        <button
          id="btn-add-category"
          onClick={handleOpenAddForm}
          className="inline-flex items-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl px-4 py-2.5 text-xs font-semibold shadow-xs hover:shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nova Categoria
        </button>
      </div>

      {/* Grid of Bento-style Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => {
          const catProducts = products.filter(
            p => p.category.toLowerCase() === cat.name.toLowerCase()
          );
          const totalStock = catProducts.reduce((sum, p) => sum + p.stock, 0);

          return (
            <motion.div
              key={cat.id}
              className="bg-white border border-zinc-150 rounded-2xl p-5 hover:shadow-xs transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-800 shrink-0">
                      <Folder className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-md text-zinc-950">{cat.name}</h3>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 text-zinc-800 mt-0.5">
                        <Tag className="w-3 h-3 text-zinc-500" />
                        {catProducts.length} {catProducts.length === 1 ? "Produto" : "Produtos"}
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditForm(cat)}
                      className="w-7 h-7 flex items-center justify-center bg-zinc-50 hover:bg-zinc-100 border border-zinc-150 text-zinc-600 rounded-lg transition-colors cursor-pointer"
                      title="Editar descrição"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    {categories.length > 1 && (
                      <button
                        onClick={() => onDeleteCategory(cat.id)}
                        className="w-7 h-7 flex items-center justify-center bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-500 rounded-lg transition-colors cursor-pointer"
                        title="Remover categoria"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-zinc-500 mt-4 leading-relaxed min-h-[36px]">
                  {cat.description || "Nenhuma descrição adicionada para essa categoria taxonomica."}
                </p>
              </div>

              {/* Mini breakdown footer */}
              <div className="border-t border-zinc-100 pt-3 mt-4 flex items-center justify-between text-[11px] text-zinc-500">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  Estoque de Categoria: <strong className="text-zinc-800">{totalStock} itens</strong>
                </span>
                
                {catProducts.length > 0 && (
                  <span className="text-zinc-400 flex items-center">
                    Ver todos <ChevronRight className="w-3 h-3" />
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Category Creation & Editing Sheet / Inline Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-zinc-150 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50">
              <div>
                <h3 className="font-display font-semibold text-sm text-zinc-900">
                  {editingCategory ? "Editar Categoria" : "Nova Categoria"}
                </h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">Adicione agrupadores lógicos para apoiar o catálogo</p>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="w-7 h-7 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-800 hover:border-zinc-300 shadow-3xs cursor-pointer"
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Category name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Nome da Categoria *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Acessórios Esportivos"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-zinc-400 focus:bg-white text-zinc-810"
                />
              </div>

              {/* Short explanation */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Breve Descrição *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explique o propósito da categoria jurídica ou mercadológica desta seção..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs focus:outline-hidden focus:border-zinc-400 focus:bg-white text-zinc-810"
                />
              </div>

              <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg text-[10px] text-amber-800 flex gap-2">
                <span>⚠️</span>
                <span>
                  <strong>Nota:</strong> Adicionar uma nova categoria permite associá-la imediatamente a qualquer produto novo ou editado no catálogo.
                </span>
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
                  {editingCategory ? "Atualizar" : "Criar Categoria"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
