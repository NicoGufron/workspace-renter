import { useBuilderStore } from "@/app/stores/builder.store";
import { useItemsStore } from "@/app/stores/item.store";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import DraggableItemCard from "./draggable_item_card";

export default function CatalogPanel() {
    const { items, categories, isLoading, fetchAll } = useItemsStore();
    const { activeCategory, setActiveCategory } = useBuilderStore();
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchAll();
    }, [fetchAll])

    const filteredItems = items.filter((item) => {
        const matchesCategory = !activeCategory || item.category_id === activeCategory
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
        return matchesCategory && matchesSearch
    })

    return(
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-800 mb-2">Item Catalog</h2>
                <div className="relative">
                    <InputGroup>
                        <InputGroupAddon>
                            <Search></Search>
                        </InputGroupAddon>
                        <InputGroupInput type="text" placeholder="Search items..." value={search} onChange={(e) => setSearch(e.currentTarget.value)} className="w-full pl-9 pr-3 py-2 text-sm rounded-lg"></InputGroupInput>
                    </InputGroup>
                </div>
            </div>
            <div className="px-6 pt-3 pb-2 flex gap-2 flex-wrap">
                <Button variant="outline" onClick={() => setActiveCategory(null)}>
                    All
                </Button>
                {categories.map((c) => (
                    <Button key={c.id} className={`${activeCategory === c.id ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`} 
                        onClick={() => setActiveCategory(activeCategory === c.id ? null : c.id)}>
                    {c.name}
                    </Button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
                {isLoading ? (
                    <div className="flex flex-col gap-5">
                        <Spinner className="size-12"></Spinner>
                        <p>Loading items...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="items-center">
                        <p>No items found</p>
                    </div>
                ) : <AnimatePresence>
                        {filteredItems.map((item) => (
                            <DraggableItemCard key={item.id} item={item}></DraggableItemCard>
                        ))}
                    </AnimatePresence>}
            </div>
        </div>
    );
}