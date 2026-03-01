import { useBuilderStore } from "@/app/stores/builder.store";
import { DurationUnit } from "@/app/stores/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { DeskScene } from "./desk_silhoutte";
import { RefObject } from "react";

const DURATION_OPTIONS: { label: string, value: DurationUnit }[] = [
    { label: "Daily", value: 'daily' },
    { label: "Weekly", value: 'weekly' },
    { label: "Monthly", value: 'monthly' }
]

interface CanvasPanelProps {
    deskRef: RefObject<HTMLDivElement>
}

export default function CanvasPanel({deskRef} : CanvasPanelProps) {
    const { selectedItems, duration, setDurationUnit, setDateRange } = useBuilderStore();

    const handleDataChange = (field: 'start' | 'end', value: string) => {
        const date = new Date(value)
        const start = field === 'start' ? date : (duration.startDate ?? date)
        const end = field === 'end' ? date : (duration.endDate ?? date)
        if (start <= end) setDateRange(start, end)
    }

    // const toInputValue = (date: Date | null) => date ? date.toISOString().split("T")[0] : ''

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-slate-100">
                <h2 className="font-bold">Your Setup</h2>

                <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit mb-3">
                    {DURATION_OPTIONS.map((e) => (
                        <Button key={e.value} variant="outline"
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 
                            ${duration.unit === e.value ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => setDurationUnit(e.value)}
                        >
                            {e.label}
                        </Button>
                    ))}
                </div>

                <div className="flex flex-row gap-2 items-center">
                    <div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={"outline"}>{duration.startDate?.toString() ? format(duration.startDate, "dd MMM yyyy") : "Choose Start Date"}</Button>
                            </PopoverTrigger>
                            <PopoverContent>
                                <Calendar
                                    mode="single"
                                    disabled={(date) => date < new Date}
                                    onSelect={(date) => handleDataChange('start', date?.toISOString().split("T")[0]!)}>
                                </Calendar>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={"outline"}>{duration.endDate?.toString() ? format(duration.endDate, "dd MMM yyyy") : "Choose End Date"}</Button>
                            </PopoverTrigger>
                            <PopoverContent>
                                <Calendar
                                    mode="single"
                                    disabled={(date) => date < new Date}
                                    onSelect={(date) => handleDataChange('end', date?.toISOString().split("T")[0]!)}
                                >
                                </Calendar>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                {duration.days > 0 && duration.startDate && (
                    <p className="text-xs text-indigo-500 mt-1.5 font-medium">
                        {duration.days} day{duration.days > 1 ? 's' : ''} selected
                    </p>
                )}

                <div className="shrink-0 border-b border-slate-100}">
                    <DeskScene deskRef={deskRef}>

                    </DeskScene>
                </div>

                {/* <div ref={setNodeRef} className={`flex-1 overflow-y-auto p-4 space-y-2 transition-colors duration-200 ${isOver ? 'bg-indigo-50' : 'bg-transparent'}`}>
                    <AnimatePresence>
                        {selectedItems.length === 0 ? (

                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className={`h-48 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-colors duration-200 
                            ${isOver ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-slate-50'}`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center 
                                ${isOver ? 'bg-indigo-100' : 'bg-slate-100'}`}
                                >
                                    <Package size={22} className={isOver ? 'text-indigo-500' : 'text-slate-400'}></Package>
                                </div>
                                <div className="text-center">
                                    <p className={`text-sm font-semibold ${isOver ? 'text-indigo-600' : 'text-slate-500'}`}>
                                        {isOver ? 'Drop it here' : 'Drag items here'}
                                    </p>
                                    <p> or click + on any item</p>
                                </div>
                            </motion.div>
                        ) : (
                            selectedItems.map((builderItem) => (
                                <DroppedItemRow key={builderItem.item.id} builderItem={builderItem}></DroppedItemRow>
                            ))
                        )
                    }
                    </AnimatePresence>
                </div> */}
            </div>
        </div>
    )
}