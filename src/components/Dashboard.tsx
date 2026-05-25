import { useState } from "react";
import { Product, Category } from "../types";
import { 
  Package, 
  AlertTriangle, 
  DollarSign, 
  Database, 
  TrendingUp,
  Award,
  Archive,
  BarChart3
} from "lucide-react";
import { motion } from "motion/react";

interface DashboardProps {
  products: Product[];
  categories: Category[];
}

export default function Dashboard({ products, categories }: DashboardProps) {
  const [chartKey, setChartKey] = useState<"stock" | "avgPrice">("stock");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Calculate statistics dynamically
  const totalProducts = products.length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 3).length;
  
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const averagePrice = totalProducts > 0 
    ? products.reduce((sum, p) => sum + p.price, 0) / totalProducts 
    : 0;

  // Group data by category for custom charts
  const categoryChartData = categories.map(cat => {
    const catProducts = products.filter(p => p.category.toLowerCase() === cat.name.toLowerCase());
    const totalEstoque = catProducts.reduce((sum, p) => sum + p.stock, 0);
    const precoMedio = catProducts.length > 0 
      ? catProducts.reduce((sum, p) => sum + p.price, 0) / catProducts.length 
      : 0;
    
    return {
      name: cat.name,
      stock: totalEstoque,
      avgPrice: precoMedio,
      count: catProducts.length
    };
  });

  const maxVal = Math.max(
    ...categoryChartData.map(d => chartKey === "stock" ? d.stock : d.avgPrice), 
    1
  );

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-lg">
        <div>
          <h2 className="text-2xl font-semibold font-display tracking-tight">Visão Geral do Hub</h2>
          <p className="text-emerald-100 mt-1 max-w-xl">
            Acompanhe o desempenho do seu estoque em tempo real. Adicione produtos, atualize quantidades e gerencie o catálogo de produtos que abastece o seu chatbot do n8n.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-medium self-start md:self-auto border border-white/10">
          <Database className="w-4 h-4 text-emerald-300" />
          <span>Local Storage Sincronizado</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div id="kpi-total-products" className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-zinc-500 text-xs font-semibold tracking-wider uppercase mb-1">Total de Produtos</p>
            <h3 className="text-3xl font-display font-bold text-zinc-900">{totalProducts}</h3>
            <p className="text-xs text-zinc-500 mt-1">ativos no catálogo</p>
          </div>
          <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-800">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div id="kpi-low-stock" className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-zinc-500 text-xs font-semibold tracking-wider uppercase mb-1">Alerta Estoque Baixo</p>
            <h3 className="text-3xl font-display font-bold text-amber-600">{lowStockCount}</h3>
            <p className="text-xs text-amber-600/80 mt-1 flex items-center gap-1 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              menos de 3 unidades
            </p>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Valuation of Inventory */}
        <div id="kpi-inventory-value" className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-zinc-500 text-xs font-semibold tracking-wider uppercase mb-1">Avaliação do Estoque</p>
            <h3 className="text-2xl font-display font-bold text-emerald-600">
              R$ {totalInventoryValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-zinc-500 mt-1">Preço × Quantidade em estoque</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Average price index */}
        <div id="kpi-average-price" className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-zinc-500 text-xs font-semibold tracking-wider uppercase mb-1">Preço Médio Unitário</p>
            <h3 className="text-2xl font-display font-bold text-zinc-900">
              R$ {averagePrice.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-zinc-500 mt-1">média dos itens cadastrados</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid of Chart + List details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive custom bar chart (2 cols) */}
        <div className="bg-white border border-zinc-100 shadow-xs rounded-2xl p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <span className="flex items-center gap-2 text-zinc-800 font-display font-semibold">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  Métricas por Categoria de Produto
                </span>
                <p className="text-xs text-zinc-500 mt-0.5">Analise o desempenho atual e preenchimento</p>
              </div>
              
              {/* Toggle switch */}
              <div className="flex bg-zinc-100 p-1 rounded-xl self-start sm:self-auto">
                <button
                  id="btn-chart-stock"
                  onClick={() => setChartKey("stock")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    chartKey === "stock" 
                      ? "bg-white text-zinc-950 shadow-xs" 
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  Estoque Total
                </button>
                <button
                  id="btn-chart-price"
                  onClick={() => setChartKey("avgPrice")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    chartKey === "avgPrice" 
                      ? "bg-white text-zinc-950 shadow-xs" 
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  Preço Médio
                </button>
              </div>
            </div>

            {/* Custom Interactive SVG / Flex Bar Chart */}
            <div className="h-64 flex items-end gap-3 border-b border-zinc-150 pb-2 relative mt-4">
              {categoryChartData.map((data, index) => {
                const currentVal = chartKey === "stock" ? data.stock : data.avgPrice;
                const percentage = maxVal > 0 ? (currentVal / maxVal) * 100 : 0;
                
                return (
                  <div 
                    key={index} 
                    className="flex-1 flex flex-col items-center group relative cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Bar column */}
                    <div className="w-full flex justify-center items-end h-48 mb-2">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${percentage}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className={`w-10 sm:w-12 rounded-t-lg transition-all ${
                          chartKey === "stock"
                            ? "bg-gradient-to-t from-emerald-500 to-teal-400 group-hover:from-emerald-600 group-hover:to-teal-500"
                            : "bg-gradient-to-t from-blue-500 to-indigo-400 group-hover:from-blue-600 group-hover:to-indigo-500"
                        }`}
                        style={{ height: `${percentage}%` }}
                      />
                    </div>
                    
                    {/* Category Label */}
                    <span className="text-xs text-zinc-600 font-medium truncate max-w-full text-center">
                      {data.name}
                    </span>

                    {/* Simple native-styled tooltip popover */}
                    {(hoveredIndex === index) && (
                      <div className="absolute bottom-full mb-3 bg-zinc-900 text-white rounded-lg px-3 py-2 text-xs shadow-lg z-20 pointer-events-none w-36 text-center transition-all before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-zinc-950">
                        <p className="font-semibold text-zinc-300">{data.name}</p>
                        <p className="text-sm font-bold mt-1">
                          {chartKey === "stock" 
                            ? `${data.stock} un. em estoque` 
                            : `R$ ${data.avgPrice.toFixed(2)}`
                          }
                        </p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{data.count} produtos</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="text-[11px] text-zinc-400 mt-4 flex justify-between items-center bg-zinc-50 p-2.5 rounded-lg border border-zinc-100">
            <span>💡 Toque ou passe o mouse sobre as barras para ver detalhes específicos de cada categoria.</span>
            <span className="font-mono text-zinc-500">{chartKey === "stock" ? "Valores em Unidades" : "Valores em R$"}</span>
          </div>
        </div>

        {/* Highlights & Alerts panel (1 col) */}
        <div className="bg-white border border-zinc-100 shadow-xs rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-md font-semibold text-zinc-900 font-display flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-amber-500" />
              Destaques e Alertas
            </h3>

            {/* List items */}
            <div className="space-y-4">
              {/* Featured products counting */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/40">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <TrendingUp className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-800">Itens em Destaque</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Há <span className="font-bold text-emerald-600">{products.filter(p => p.featured).length}</span> produtos promovidos no catálogo. Stella os prioriza em recomendações.
                  </p>
                </div>
              </div>

              {/* Stock alerts */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100/40">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                  <AlertTriangle className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-800">Itens Sob Alerta</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {lowStockCount > 0 
                      ? `Temos ${lowStockCount} produtos chegando a níveis críticos. É hora de repor!` 
                      : "Excelente! Nenhum item com estoque baixo no momento."}
                  </p>
                </div>
              </div>

              {/* Sem Estoque */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-50/50 border border-rose-100/40">
                <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                  <Archive className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-800">Esgotados de Estoque</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {outOfStockCount > 0 
                      ? `Existem ${outOfStockCount} produtos zerados em estoque. O robô não pode recomendá-los!` 
                      : "Todo o catálogo está abastecido!"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 text-[11px] text-zinc-500 flex items-center justify-between">
            <span>Status Total da Loja:</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Operando 100%
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
