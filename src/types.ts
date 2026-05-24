export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  imageUrl: string;
  gender: string; // 'Masculino' | 'Feminino' | 'Unissex'
  featured: boolean;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface ChatbotConfig {
  identity: string;
  tone: string;
  rules: string;
  showImage: boolean;
  showPrice: boolean;
  showActionButton: boolean;
  actionButtonText: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  bucket: string;
}

