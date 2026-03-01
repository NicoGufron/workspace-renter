import { useBuilderStore } from "@/app/stores/builder.store";
import { BuilderItem } from "@/app/stores/types";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";

interface Props {
    builderItem: BuilderItem
}

export default function DroppedItemRow({ builderItem }: Props) {
    const { item, quantity } = builderItem
    const { updateQuantity, removeItem, getItemPrice } = useBuilderStore();
    const linePrice = getItemPrice(item.id);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 20, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-sm group"
        >
            <div className="w-11 h-11 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover"></img>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 ">{item.name}</p>
                <p className="text-xs text-slate-400">${item.daily_rate.toFixed(2)} / day</p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
                <Button variant="outline" onClick={() => updateQuantity(item.id, quantity - 1)}><Minus size={12}></Minus></Button>
                <span className="w-6 text-center text-sm font-bold text-slate-700">{quantity}</span>
                <Button variant="outline" onClick={() => updateQuantity(item.id, quantity + 1)}><Plus size={12}></Plus></Button>
            </div>
            
            <div className="text-sm font-bold text-indigo-600 w-16 text-right shrink-0">
                ${linePrice.toFixed(2)}
            </div>

            <Button variant={"destructive"} onClick={() => removeItem(item.id)}>
                Remove Item
            </Button>
        </motion.div>
    )
}