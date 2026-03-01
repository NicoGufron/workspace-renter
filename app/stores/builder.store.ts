import { create } from "zustand";
import { BuilderItem, DeliveryType, DurationUnit, Item, RentalDuration } from "./types";

const DURATION_MULTIPLIERS: Record<DurationUnit, number> = {
    daily: 1,
    weekly: 7,
    monthly: 30,
}

function getUnitRates(item: Item, unit: DurationUnit): number {
    if (unit === "weekly" && item.weekly_rate) return item.weekly_rate;
    if (unit === "monthly" && item.monthly_rate) return item.monthly_rate;
    return item.daily_rate;
}

function calculateItemPrice(item: Item, quantity: number, duration: RentalDuration): number {
    const dailyRate = getUnitRates(item, duration.unit);
    return dailyRate * quantity * duration.days
}

function calculateTotal(items: BuilderItem[], duration: RentalDuration, damageProtection: boolean): number {
    const itemsTotal = items.reduce((sum, { item, quantity }) => sum + calculateItemPrice(item, quantity, duration), 0);
    const protection = damageProtection ? itemsTotal * 0.1 : 0;
    return parseFloat((itemsTotal + protection).toFixed(2));
}

function getDurationDays(start: Date, end: Date): number {
    const diff = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

interface BuilderState {
    selectedItems: BuilderItem[]
    duration: RentalDuration,
    deliveryType: DeliveryType,
    deliveryAddress: string,
    damageProtection: boolean,
    notes: string,
    totalPrice: number,
    activeCategory: string | null,
    isCheckingOut: boolean,
    checkoutError: string | null,

    addItem: (item: Item) => void,
    removeItem: (itemId: string) => void,
    updateQuantity: (itemId: string, quantity: number) => void,
    clearBuilder: () => void,

    setDurationUnit: (unit: DurationUnit) => void,
    setDateRange: (startDate: Date, endDate: Date) => void,

    setDeliveryType: (type: DeliveryType) => void,
    setDeliveryAddress: (address: string) => void,
    setDamageProtection: (enabled: boolean) => void,
    setNotes: (notes: string) => void,
    setIsCheckingOut: (value: boolean) => void,
    setCheckoutError: (error: string | null) => void,

    setActiveCategory: (categoryId: string | null) => void,
    getItemCount: () => number,
    getItemPrice: (itemId: string) => number,
    isItemSelected: (itemId: string) => boolean
}

const defaultDuration: RentalDuration = {
    startDate: null,
    endDate: null,
    unit: 'daily',
    days: 1
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
    selectedItems: [],
    duration: defaultDuration,
    deliveryType: 'delivery',
    deliveryAddress: '',
    damageProtection: false,
    notes: '',
    totalPrice: 0,
    activeCategory: null,
    isCheckingOut: false,
    checkoutError: null,

    addItem: (item) => {
        const { selectedItems, duration, damageProtection } = get();
        const existing = selectedItems.find((i) => i.item.id === item.id);

        const updated = existing ? selectedItems.map((i) => i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) : [...selectedItems, { item, quantity: 1 }];

        set({ selectedItems: updated, totalPrice: calculateTotal(updated, duration, damageProtection) });
    },

    removeItem: (itemId) => {
        const { selectedItems, duration, damageProtection } = get();
        const updated = selectedItems.filter((i) => i.item.id !== itemId);
        set({ selectedItems: updated, totalPrice: calculateTotal(updated, duration, damageProtection) });
    },

    updateQuantity: (itemId, quantity) => {
        const { selectedItems, duration, damageProtection } = get();
        const updated = quantity <= 0 ? selectedItems.filter((i) => i.item.id !== itemId) : selectedItems.map((i) => i.item.id === itemId ? { ...i, quantity } : i);

        set({ selectedItems: updated, totalPrice: calculateTotal(updated, duration, damageProtection) });
    },

    clearBuilder: () => {
        set({
            selectedItems: [],
            duration: defaultDuration,
            deliveryAddress: "",
            damageProtection: false,
            notes: "",
            totalPrice: 0,
            checkoutError: null,
        })
    },

    setDurationUnit: (unit) => {
        const { duration, selectedItems, damageProtection } = get();
        const days = duration.startDate && duration.endDate ? getDurationDays(duration.startDate, duration.endDate) : DURATION_MULTIPLIERS[unit];

        const updated = { ...duration, unit, days };
        set({
            duration: updated,
            totalPrice: calculateTotal(selectedItems, updated, damageProtection)
        });
    },

    setDateRange: (startDate, endDate) => {
        const { duration, selectedItems, damageProtection } = get();
        const days = getDurationDays(startDate, endDate);
        const updated = { ...duration, startDate, endDate, days };
        set({ duration: updated, totalPrice: calculateTotal(selectedItems, updated, damageProtection) });
    },

    setDeliveryType: (deliveryType) => set({ deliveryType }),
    setDeliveryAddress: (deliveryAddress) => set({deliveryAddress}) ,
    setDamageProtection: (enabled) => {
        const { selectedItems, duration } = get();
        set({damageProtection: enabled, totalPrice: calculateTotal(selectedItems, duration, enabled)});
    },

    setNotes: (notes) => set({notes}),
    setIsCheckingOut: (isCheckingOut) => set({isCheckingOut}),
    setCheckoutError: (checkoutError) => set({checkoutError}),
    setActiveCategory: (activeCategory) => set({activeCategory}),
    getItemCount: () => get().selectedItems.reduce((sum, i) => sum + i.quantity, 0),
    getItemPrice: (itemId) => {
        const { selectedItems, duration } = get();
        const found = selectedItems.find((i) => i.item.id === itemId);
        if (!found) return 0;
        return calculateItemPrice(found.item, found.quantity, duration);
    },

    isItemSelected: (itemId) => get().selectedItems.some((i) => i.item.id === itemId)
}))