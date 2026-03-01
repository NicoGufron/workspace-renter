import { useBuilderStore } from "@/app/stores/builder.store";
import { DragData, Item } from "@/app/stores/types";
import { useDraggable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { Check, GripVertical, Plus } from "lucide-react";

interface Props {
    item: Item
}

export default function DraggableItemCard({ item }: Props) {
    const { addItem, isItemSelected } = useBuilderStore();
    const selected = isItemSelected(item.id)

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `catalog-${item.id}`,
        data: {
            type: 'catalog-item',
            itemId: item.id
        } satisfies DragData
    })

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`
            relative group flex items-center gap-3 -3 rounded-xl border-bg-white cursor-grab active:cursor-grabbing select-none transition-all duration-150 
            ${selected ? 'border-indigo-400 bg-indigo-50 shadow-sm shadow-indigo-100' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'}`}
        >
            <div className="text-slate-300 hover:text-slate-400 shrink-0">
                <GripVertical size="16"></GripVertical>
            </div>
            <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover">
                    </img>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">
                        📦
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{item.name}</p>
                <p className="text-xs mt-0.5">${item.daily_rate.toFixed(2)} <span className="text-slate-400"> / day</span></p>
            </div>

            <motion.button whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                    e.stopPropagation();
                    addItem(item)
                }}
                title={selected ? 'Add another' : 'Add to setup'}
                className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 font-medium text-sm 
                    ${selected ? 'bg-indigo-500 text-white hover:bg-indigo-600' : 'bg-slate-100 text-slate-500 hover:bg-indigo-100 hover:text-indigo-600'}`}
            >
                {selected ? <Check size={14}/> : <Plus size={14}/>}
            </motion.button>
        </motion.div>
    )
}

