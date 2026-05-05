
import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import api from "./api";

export interface IProduct {
  id: string;
  name: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PriceRecord {
  price: number;
  recordedAt: string;
  marketId: string;
  marketName: string;
  marketLocation?: string;
}

export interface ProductWithPrices extends IProduct {
  prices: PriceRecord[];
  averagePrice?: number;
  lowestPrice?: number;
  highestPrice?: number;
  priceCount?: number;
}

interface ProductState {
  products: IProduct[];
  currentProduct: IProduct | null;
  currentProductWithPrices: ProductWithPrices | null;
  loading: boolean;
  error: string | null;

  // Fetch operations
  fetchProducts: () => Promise<void>;
  fetchProductById: (id: string) => Promise<IProduct | null>;
  fetchProductWithPrices: (id: string) => Promise<ProductWithPrices | null>;

  // Add operations
  addProduct: (data: { name: string; category?: string }) => Promise<IProduct | null>;
  updateProduct: (id: string, data: Partial<IProduct>) => Promise<IProduct | null>;
  deleteProduct: (id: string) => Promise<boolean>;

  // Price operations
  addProductPrice: (productId: string, marketId: string, price: number) => Promise<boolean>;

  // Utils
  clearError: () => void;
  setCurrentProduct: (product: IProduct | null) => void;
}

export const useProductStore = create<ProductState>()(
  (set, get) => ({
    products: [],
    currentProduct: null,
    currentProductWithPrices: null,
    loading: false,
    error: null,

    fetchProducts: async () => {
      try {
        set({ loading: true, error: null });

        const { data } = await api.get("/products/list");

        if (data.data && Array.isArray(data.data)) {
          set({ products: data.data, loading: false });
        } else if (data.data && Array.isArray(data.data.data)) {
          // Handle nested data structure
          set({ products: data.data.data, loading: false });
        } else {
          set({ products: [], loading: false });
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Failed to fetch products";
        set({ error: errorMessage, loading: false });
        toast.error(errorMessage);
        console.error("Fetch products error:", error);
      }
    },

    fetchProductById: async (id: string) => {
      try {
        set({ loading: true, error: null });

        const { data } = await api.get(`/products/${id}`);

        let product = null;
        if (data.data) {
          product = data.data;
          set({ currentProduct: product, loading: false });
          return product;
        }

        set({ loading: false });
        return null;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Failed to fetch product";
        set({ error: errorMessage, loading: false });
        toast.error(errorMessage);
        console.error("Fetch product by ID error:", error);
        return null;
      }
    },

    fetchProductWithPrices: async (id: string) => {
      try {
        set({ loading: true, error: null });

        const { data } = await api.get(`/products/${id}/prices`);

        let productWithPrices = null;
        if (data.data) {
          productWithPrices = data.data;

          // Calculate additional stats
          if (productWithPrices.prices && productWithPrices.prices.length > 0) {
            const prices = productWithPrices.prices.map((p: PriceRecord) => p.price);
            productWithPrices.averagePrice = Math.round(
              prices.reduce((a: number, b: number) => a + b, 0) / prices.length
            );
            productWithPrices.lowestPrice = Math.min(...prices);
            productWithPrices.highestPrice = Math.max(...prices);
            productWithPrices.priceCount = prices.length;
          }

          set({ currentProductWithPrices: productWithPrices, loading: false });
          return productWithPrices;
        }

        set({ loading: false });
        return null;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Failed to fetch product prices";
        set({ error: errorMessage, loading: false });
        toast.error(errorMessage);
        console.error("Fetch product with prices error:", error);
        return null;
      }
    },

    addProduct: async (data: { name: string; category?: string }) => {
      try {
        set({ loading: true, error: null });

        const { data: response } = await api.post("/products/create", data);

        let newProduct = null;
        if (response.data) {
          newProduct = response.data;
          // Refresh products list
          await get().fetchProducts();
          toast.success("Product created successfully");
          set({ loading: false });
          return newProduct;
        }

        set({ loading: false });
        return null;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Failed to create product";
        set({ error: errorMessage, loading: false });
        toast.error(errorMessage);
        console.error("Add product error:", error);
        return null;
      }
    },

    updateProduct: async (id: string, data: Partial<IProduct>) => {
      try {
        set({ loading: true, error: null });

        const { data: response } = await api.put(`/products/${id}`, data);

        let updatedProduct:any = null;
        if (response.data) {
          updatedProduct = response.data;
          // Update in products list
          const currentProducts = get().products;
          const updatedProducts = currentProducts.map(p =>
            p.id === id ? { ...p, ...updatedProduct } : p
          );
          set({ products: updatedProducts, loading: false });
          toast.success("Product updated successfully");
          return updatedProduct;
        }

        set({ loading: false });
        return null;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Failed to update product";
        set({ error: errorMessage, loading: false });
        toast.error(errorMessage);
        console.error("Update product error:", error);
        return null;
      }
    },

    deleteProduct: async (id: string) => {
      try {
        set({ loading: true, error: null });

        await api.delete(`/products/${id}`);

        // Remove from products list
        const currentProducts = get().products;
        const updatedProducts = currentProducts.filter(p => p.id !== id);
        set({ products: updatedProducts, loading: false });

        toast.success("Product deleted successfully");
        return true;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Failed to delete product";
        set({ error: errorMessage, loading: false });
        toast.error(errorMessage);
        console.error("Delete product error:", error);
        return false;
      }
    },

    addProductPrice: async (productId: string, marketId: string, price: number) => {
      try {
        set({ loading: true, error: null });

        await api.post("/prices", {
          productId,
          marketId,
          price,
        });

        // Refresh product with prices if it's the current one
        const currentProduct = get().currentProduct;
        if (currentProduct && currentProduct.id === productId) {
          await get().fetchProductWithPrices(productId);
        }

        set({ loading: false });
        toast.success("Price added successfully");
        return true;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Failed to add price";
        set({ error: errorMessage, loading: false });
        toast.error(errorMessage);
        console.error("Add product price error:", error);
        return false;
      }
    },

    clearError: () => {
      set({ error: null });
    },

    setCurrentProduct: (product: IProduct | null) => {
      set({ currentProduct: product });
    },
  })
);

// Optional: Selectors for derived data
export const useProductSelectors = {
  getProductById: (state: ProductState, id: string) =>
    state.products.find(p => p.id === id),

  getProductsByCategory: (state: ProductState, category: string) =>
    state.products.filter(p => p.category === category),

  getProductCount: (state: ProductState) => state.products.length,

  getCategories: (state: ProductState) => {
    const categories = new Set(state.products.map(p => p.category).filter(Boolean));
    return Array.from(categories);
  },
};