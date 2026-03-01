import { create } from "zustand"
import { Category, Item } from "./types"
import { createClient } from "@/lib/client"

interface ItemsState {
    items: Item[]
    categories: Category[]
    isLoading: boolean,
    error: string | null,
    lastFetched: number | null,

    fetchItems: () => Promise<void>
    fetchCategories: () => Promise<void>
    fetchAll: () => Promise<void>

    getItemsByCategory: (categoryId: string) => Item[]
    getItemById: (itemId: string) => Item | undefined
}

const CACHE_TTL = 5 * 60 * 1000

export const useItemsStore = create<ItemsState>((set, get) => ({
    items: [],
    categories: [],
    isLoading: false,
    error: null,
    lastFetched: null,

    fetchItems: async () => {
        set({ isLoading: true, error: null })
        const supabase = createClient();

        try {
            const { data, error } = await supabase.from('items').select(`*, category: categories(*)`).eq('is_available', true).order('name')

            if (error) throw error

            set({ items: data ?? [], isLoading: false, lastFetched: Date.now() })
        } catch (err) {
            set({ error: "Failed to fetch items", isLoading: false })
        }
    },

    fetchCategories: async () => {
        const supabase = createClient();

        try {
            const { data, error } = await supabase.from('categories').select('*').order('name')

            if (error) throw error;

            set({ categories: data ?? [] })
        } catch (err) {
            set({ error: "Failed to fetch categories", isLoading: false })
        }
    },
    fetchAll: async () => {
        const { lastFetched } = get();
        const isCacheValid = lastFetched && Date.now() - lastFetched;

        if (isCacheValid) return;

        await Promise.all([
            get().fetchItems(),
            get().fetchCategories()
        ])
    },

    getItemsByCategory: (categoryId) =>
        get().items.filter((item) => item.category_id === categoryId),

    getItemById: (itemId) =>
        get().items.find((item) => item.id === itemId),
}))