import { create } from "zustand";
import { Rental } from "./types";
import { createClient } from "@/lib/client";
import { useAuthStore } from "./auth.store";
import { useBuilderStore } from "./builder.store";

interface RentalsState {
    rentals: Rental[],
    activeRental: Rental | null,
    isLoading: boolean,
    error: string | null,
    isSuccess: boolean,

    fetchRentals: () => Promise<void>
    fetchRentalById: (rentalId: string) => Promise<void>
    submitRental: () => Promise<string | null>
    cancelRental: (rentalId: string) => Promise<void>
    clearSuccess: () => void
    clearError: () => void,
}

export const useRentalsStore = create<RentalsState>((set, get) => ({
    rentals: [],
    activeRental: null,
    isLoading: false,
    error: null,
    isSuccess: false,

    fetchRentals: async () => {
        set({ isLoading: true, error: null })
        const supabase = createClient();

        try {
            const { data, error } = await supabase.from('rentals').select(`*,rental_items (  *,  item:items (*))`).order('created_at', { ascending: false })

            if (error) throw error

            set({ rentals: data ?? [], isLoading: false})
        } catch (err) {
            set({error: "Failed to fetch rentals", isLoading: false})
        }
    },

    fetchRentalById: async (rentalId) => {
        set({isLoading: true, error: null})
        const supabase = createClient()

        try {
            const { data, error} = await supabase.from('rentals').select(`*, rental_items (*, item: items(*))`).eq('id', rentalId).single();

            if (error) throw error

            set({activeRental: data, isLoading: false})
        } catch (err) {
            set({error: err instanceof Error ? err.message : "Failed to fetch rental by id", isLoading: false})
        }
    },

    submitRental: async () => {
        const {
            selectedItems,
            duration,
            deliveryType,
            deliveryAddress,
            damageProtection,
            notes,
            totalPrice,
            setIsCheckingOut,
            setCheckoutError,
            clearBuilder
        } = useBuilderStore.getState()

        const { profile } = useAuthStore.getState();

        if (!profile) {
            set({error: "You must be logged in to rent."})
            return null;
        }

        if (selectedItems.length === 0) {
            set({error: "Please add at least one item"});
            return null;
        }

        if (!duration.startDate || !duration.endDate) {
            set({error: "Please select a rental date range"});
            return null;
        }

        if (deliveryType === "delivery" && !deliveryAddress.trim()) {
            set({error: "Please enter a delivery address"});
            return null;
        }

        set({isLoading: true, error: null})
        setIsCheckingOut(true);
        const supabase = createClient();
        
        try {
            const { data : rental, error: rentalError } = await supabase.from('rentals').insert({
                user_id: profile.id,
                status: 'pending',
                delivery_type: deliveryType,
                delivery_address: deliveryAddress,
                start_date: duration.startDate.toISOString().split("T")[0],
                end_date: duration.endDate.toISOString().split("T")[0],
                total_amount: totalPrice,
                damage_protection: damageProtection,
                notes: notes || null,
            }).select().single()

            if (rentalError) throw rentalError

            const lineItems = selectedItems.map(({item, quantity}) => ({
                rental_id: rental.id,
                item_id: item.id,
                quantity,
                unit_price: item.daily_rate,
                duration_days: duration.days,
            }))

            const { error: itemsError} = await supabase.from('rental_items').insert(lineItems);

            if (itemsError) throw itemsError

            const availabilityRows = selectedItems.map(({item}) => ({
                item_id: item.id,
                booked_from: duration.startDate!.toISOString().split("T")[0],
                booked_until: duration.endDate!.toISOString().split("T")[0],
            }))

            await supabase.from('item_availability').insert(availabilityRows);

            set((state) => ({
                rentals: [rental, ...state.rentals],
                isLoading: false,
                isSuccess: true,
            }))

            clearBuilder(),
            setIsCheckingOut(false)

            return rental.id
        } catch (err) {
            const message = err instanceof Error ? err.message : "Checkout Failed";
            set({ error: message, isLoading: false});
            setCheckoutError(message);
            return null;
        }
    },

    cancelRental: async (rentalId) => {
        set({isLoading: true, error: null})
        const supabase = createClient();

        try {
            const { error } = await supabase.from('rentals').update({status: 'cancelled'}).eq('id', rentalId).in('status', ["pending", "confirmed"])

            if (error) throw error
            set((state) => ({
                rentals: state.rentals.map((r) => 
                    r.id === rentalId ? { ...r, status: "cancelled"} : r), 
                isLoading: false
            }))
        } catch (err) {
            set({error: err instanceof Error ? err.message : "Failed to cancel rental", isLoading: false})
        }
    },

    clearSuccess: () => set({isSuccess : false}),
    clearError: () => set({error: null})

}))