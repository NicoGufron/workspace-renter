"use client"

// ============================================================
// DeskScene — pure display + droppable, NO DndContext here.
// All drag logic lives in BuilderLayout's single DndContext.
// ============================================================

import { RefObject } from "react"
import { useDroppable, useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, Minus } from "lucide-react"
import { useBuilderStore } from "@/app/stores/builder.store"
import { BuilderItem, DragData } from "@/app/stores/types"

const CATEGORY_EMOJI: Record<string, string> = {
    Monitor: "🖥️",
    Keyboard: "⌨️",
    Mouse: "🖱️",
    Chair: "🪑",
    Webcam: "📷",
    Headset: "🎧",
    Desk: "🪵",
    Lighting: "💡",
}

// ── Single item sitting on the desk ─────────────────────────

function DeskItem({ builderItem }: { builderItem: BuilderItem }) {
    const { removeItem, updateQuantity } = useBuilderStore()
    const { item, quantity, position } = builderItem
    const emoji = CATEGORY_EMOJI[item.category?.name ?? ""] ?? "📦"

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `desk-item-${item.id}`,
        data: { type: "desk-item", itemId: item.id } satisfies DragData,
    })

    const style = {
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.25 : 1,
        zIndex: isDragging ? 0 : 10,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="absolute -translate-x-1/2 -translate-y-1/2 group touch-none"
        >
            <motion.div
                initial={{ scale: 0, y: -16, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
                className="flex flex-col items-center gap-1"
            >
                {/* Draggable card */}
                <div
                    {...listeners}
                    {...attributes}
                    className="relative w-14 h-14 rounded-2xl bg-white shadow-lg
                        border border-slate-100 flex items-center justify-center
                        cursor-grab active:cursor-grabbing hover:shadow-xl hover:scale-105
                        transition-all duration-150"
                >
                    {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-9 h-9 object-contain" />
                    ) : (
                        <span className="text-2xl">{emoji}</span>
                    )}

                    {/* Remove button */}
                    <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => removeItem(item.id)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-400 hover:bg-red-500
                            text-white rounded-full items-center justify-center hidden group-hover:flex
                            shadow-md z-20 transition-colors"
                    >
                        <X size={10} />
                    </button>
                </div>

                {/* Label + qty controls on hover */}
                <div
                    className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => updateQuantity(item.id, quantity - 1)}
                        className="w-5 h-5 rounded-full bg-white shadow border border-slate-200
                            flex items-center justify-center text-slate-500 hover:bg-slate-50"
                    >
                        <Minus size={9} />
                    </button>
                    <span className="text-[10px] font-bold text-slate-700 bg-white/95
                        px-2 py-0.5 rounded-full shadow-sm border border-slate-100 whitespace-nowrap">
                        {item.name}{quantity > 1 && <span className="text-indigo-500 ml-1">×{quantity}</span>}
                    </span>
                    <button
                        onClick={() => updateQuantity(item.id, quantity + 1)}
                        className="w-5 h-5 rounded-full bg-white shadow border border-slate-200
                            flex items-center justify-center text-slate-500 hover:bg-slate-50"
                    >
                        <Plus size={9} />
                    </button>
                </div>
            </motion.div>
        </div>
    )
}

// ── Drop surface ─────────────────────────────────────────────

function DeskSurface() {
    const { selectedItems } = useBuilderStore()
    const { setNodeRef, isOver } = useDroppable({ id: "desk-surface" })

    return (
        <div
            ref={setNodeRef}
            className={`absolute inset-0 rounded-2xl transition-colors duration-200
                ${isOver ? "ring-2 ring-indigo-400 ring-inset bg-indigo-50/20" : ""}`}
        >
            <AnimatePresence>
                {selectedItems.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none"
                    >
                        <span className="text-3xl">🖥️</span>
                        <p className={`text-xs font-medium transition-colors ${isOver ? "text-indigo-500" : "text-slate-400"}`}>
                            {isOver ? "Release to place on desk!" : "Drag items from the catalog onto the desk"}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedItems.map((builderItem) => (
                    <DeskItem key={builderItem.item.id} builderItem={builderItem} />
                ))}
            </AnimatePresence>
        </div>
    )
}

// ── DeskScene — accepts deskRef from BuilderLayout ───────────

interface DeskSceneProps {
    deskRef: RefObject<HTMLDivElement>
}

export function DeskScene({ deskRef }: DeskSceneProps) {
    const { selectedItems } = useBuilderStore()
    const itemCount = selectedItems.reduce((s, i) => s + i.quantity, 0)

    return (
        <div className="w-full px-6 py-4 select-none">
            <div className="mb-4 text-center">
                <h2 className="text-lg font-bold text-slate-700 tracking-tight">
                    Your Workspace Preview
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                    Drag items from the catalog directly onto the desk
                </p>
            </div>

            <div className="relative w-full max-w-2xl mx-auto">
                {/* Monitor riser */}
                <div className="absolute top-0 left-[15%] right-[15%] h-[18%]
                    bg-gradient-to-b from-slate-200 to-slate-300 rounded-t-xl
                    border border-slate-300/50 z-0" />

                {/* Monitor stand */}
                <div className="absolute top-[14%] left-[46%] right-[46%] h-[10%]
                    bg-slate-300 z-0" />

                {/* Main desk surface — ref measured in BuilderLayout */}
                <div
                    ref={deskRef}
                    className="relative w-full bg-gradient-to-b from-[#f5f0e8] to-[#ede8df]
                        rounded-2xl border border-[#e0d8cc] shadow-xl overflow-hidden"
                    style={{ marginTop: "14%", minHeight: "220px" }}
                >
                    {/* Sheen overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-0 right-0 h-1/4
                            bg-gradient-to-b from-white/25 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 h-[15%]
                            bg-gradient-to-b from-transparent to-[#d4ccbe]" />
                    </div>

                    <DeskSurface />
                </div>

                {/* Legs */}
                <div className="absolute bottom-[-10%] left-[10%] w-[3%] h-[12%] bg-slate-300 rounded-b-md" />
                <div className="absolute bottom-[-10%] right-[10%] w-[3%] h-[12%] bg-slate-300 rounded-b-md" />

                {/* Shadow */}
                <div className="absolute bottom-[-16%] left-[8%] right-[8%] h-[6%]
                    bg-slate-400/20 rounded-full blur-lg" />

                {/* Item count badge */}
                <AnimatePresence>
                    {itemCount > 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute -top-3 -right-3 bg-indigo-500 text-white
                                text-xs font-bold px-2.5 py-1 rounded-full shadow-lg shadow-indigo-200 z-20"
                        >
                            {itemCount} item{itemCount > 1 ? "s" : ""}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}