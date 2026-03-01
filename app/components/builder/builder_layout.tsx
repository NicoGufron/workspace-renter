"use client"

import { useBuilderStore } from "@/app/stores/builder.store";
import { useItemsStore } from "@/app/stores/item.store";
import { DragData, Item } from "@/app/stores/types";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useRef, useState } from "react";
import CatalogPanel from "./catalog_panel";
import CanvasPanel from "./canvas_panel";
import PriceSummary from "./price_summary";
import { AnimatePresence, motion } from "framer-motion";

export default function BuilderLayout() {

    const { addItem, moveItem } = useBuilderStore();
    const { getItemById } = useItemsStore();

    const deskRef = useRef<HTMLDivElement | null>(null);

    const [draggingItem, setDraggingItem] = useState<Item | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 6,
            }
        }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 200, tolerance: 6 }
        })
    )

    const toPercent = (clientX: number, clientY: number) => {
        const desk = deskRef.current;
        if (!desk) return { x: 50, y: 50 }
        const rect = desk.getBoundingClientRect()
        const x = Math.min(95, Math.max(5, ((clientX - rect.left) / rect.width) * 100))
        const y = Math.min(90, Math.max(10, ((clientY - rect.top) / rect.height) * 100))
        return { x, y }
    }

    const handleDragStart = (event: DragStartEvent) => {
        const data = event.active.data.current as DragData;
        if (data?.type === "catalog-item") {
            const item = getItemById(data.itemId);
            setDraggingItem(item ?? null);
        }
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over, delta } = event;
        setDraggingItem(null);
        
        if (!over || over.id !== "desk-surface") return;

        const data = active.data.current as DragData;
        const activator = event.activatorEvent as PointerEvent;
        const position = toPercent(
            activator.clientX + delta.x,
            activator.clientY + delta.y
        )

        if (data?.type === "catalog-item") {
            const item = getItemById(data.itemId);
            if (item) addItem(item, position);
        }

        if (data?.type === "desk-item") {
            moveItem(data.itemId, position);
        }
    }

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-screen bg-slate-50 overflow-hidden">
                <div className="w-80 shrink-0 bg-white border-r border-slate-100 flex flex-col overflow-hidden">
                    <CatalogPanel></CatalogPanel>
                </div>
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex-1 overflow-hidden flex flex-col">
                        <CanvasPanel deskRef={deskRef}></CanvasPanel>
                    </div>
                    <PriceSummary></PriceSummary>
                </div>
            </div>
            <DragOverlay dropAnimation={{ duration: 200, easing: 'ease-out' }}>
                <AnimatePresence>
                    {draggingItem && (
                        <motion.div
                            initial={{ scale: 1.05, rotate: -1 }}
                            animate={{ scale: 1.05, rotate: -1 }}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border-2 border-indigo-400 shadow-xl shadow-indigo-100/50 cursor-grabbing w-72 pointer-events-none"
                        >
                            <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                                {draggingItem.image_url ? (
                                    <img src={draggingItem.image_url} alt={draggingItem.name} className="w-full h-full object-cover"></img>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-bold">{draggingItem.name}</p>
                                <p className="text-xs font-bold">{draggingItem.daily_rate.toFixed(2)} / day</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DragOverlay>
        </DndContext>
    );
}