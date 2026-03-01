import { create } from "zustand";
import { Profile } from "./types";
import { persist } from "zustand/middleware";
import { createClient } from "@/lib/client";

interface AuthState {
    profile: Profile | null,
    isLoading: boolean,
    isAuthenticated: boolean,
    error: string | null

    fetchProfile: () => Promise<void>,
    updateProfile: (updates: Partial<Profile>) => Promise<void>,
    signOut: () => Promise<void>,
    clearError: () => void,
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            profile: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,

            fetchProfile: async () => {
                set({ isLoading: true, error: null })
                const supabase = createClient()

                try {
                    const { data: { user } } = await supabase.auth.getUser();

                    if (!user) {
                        set({ profile: null, isAuthenticated: false, isLoading: false })
                        return;
                    }

                    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()

                    if (error) throw error

                    set({ profile: data, isAuthenticated: true, isLoading: false })
                } catch (err) {
                    set({ error: 'Failed to fetch profile', isLoading: false })
                }
            },
            updateProfile: async (updates) => {
                const { profile } = get();

                if (!profile) return;

                set({isLoading: true, error: null})
                const supabase = createClient();

                try {
                    const { data, error } = await supabase.from('profiles').update(updates).eq('id', profile.id).select().single();

                    if (error) throw error

                    set({ profile: data, isLoading: false})
                } catch (err) {
                    set({error: 'Failed to update profile', isLoading: false})
                }

            },
            signOut: async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                set({profile: null, isAuthenticated: false, error: null})
            },
            clearError: async () => set({error: null}),
        }),
        {
            name: 'auth-store',
            partialize: (state) => ({
                profile: state.profile,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    ),

)