import { useBuilderStore } from "@/app/stores/builder.store";
import { useRentalsStore } from "@/app/stores/rental.store";
import { DeliveryType } from "@/app/stores/types";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, Store, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PriceSummary() {
    const {
        selectedItems,
        duration,
        totalPrice,
        damageProtection,
        deliveryType,
        deliveryAddress,
        setDamageProtection,
        setDeliveryType,
        setDeliveryAddress,
        getItemCount
    } = useBuilderStore()

    const { submitRental, isLoading, error, isSuccess, clearSuccess } = useRentalsStore();
    const router = useRouter();

    const itemCount = getItemCount();
    const subtotal = damageProtection ? totalPrice / 1.1 : totalPrice;
    const protectionFee = damageProtection ? totalPrice - subtotal : 0;
    const hasItems = selectedItems.length > 0;
    const hasDateRange = duration.startDate && duration.endDate

    const handleRent = async () => {
        const rentalId = await submitRental()
        if (rentalId) {
            clearSuccess()
            router.push(`/rentals/${rentalId}`);
        }
    }

    const DELIVERY_OPTIONS: { label: string, value: DeliveryType, icon: React.ReactNode }[] = [
        { label: 'Delivery', value: 'delivery', icon: <Truck size={14} /> },
        { label: 'Self Pickup', value: 'pickup', icon: <Store size={14} /> },
    ]

    const [openDrawer, setOpenDrawer] = useState(false);

    return (
        <div className="border-t border-slate-100 bg-white p-4 space-y-4 ">
            <div className="border rounded-xl p-5 h-full overflow-y-auto">
                <p className="text-xs font-semibold text-slate-500 tracking-wide mb-2">
                    Choose Delivery
                </p>
                <div className="flex gap-2">
                    {DELIVERY_OPTIONS.map((d) => (
                        <Button key={d.value} variant={"outline"} className={deliveryType === d.value ? 'bg-indigo-50 border-indigo-400 text-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'}>{d.icon}{d.label}</Button>
                    ))}
                </div>

                <AnimatePresence>
                    {deliveryType === "delivery" && (
                        <motion.input
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            type="text"
                            placeholder="Enter delivery address..."
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.currentTarget.value)}
                            className="w-full mt-2 px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder:text-slate-400"
                        >

                        </motion.input>
                    )}
                </AnimatePresence>

                {/* <AnimatePresence>
                    {hasItems && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-1.5 text-sm"
                        >
                            <div className="flex justify0between text-slate-500 text-xs">
                                <span>{itemCount} item{itemCount > 1 ? 's' : ''} x {duration.days} day{duration.days > 1 ? 's' : ''} </span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            {damageProtection && (
                                <div className="flex justify-between text-emerald-600 text-xs">
                                    <span>Damage Protection</span>
                                    <span>${protectionFee.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-slate-800 pt-3 border-t border-slate-100">
                                <span>Total</span>
                                <motion.span key={totalPrice}
                                    initial={{ scale: 1.1, color: "#6366F1" }}
                                    animate={{ scale: 1, color: "#1E293B" }}
                                >
                                    ${totalPrice.toFixed(2)}
                                </motion.span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence> */}

                {error && (
                    <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                )}




                <Button disabled={!hasItems || !hasDateRange || isLoading} onClick={() => setOpenDrawer(true)}
                    className={`float-right mt-5 ${hasItems && hasDateRange ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                    {isLoading ? (
                        <Spinner></Spinner>
                    ) : (
                        <>
                            {!hasItems
                                ? 'Add items to get started'
                                : !hasDateRange
                                    ? 'Select rental dates'
                                    : `Checkout Cart`
                            }
                        </>
                    )}
                </Button>

                <Drawer open={openDrawer} onOpenChange={setOpenDrawer} direction="right">
                    <DrawerContent className="w-[400px]">
                        <DrawerHeader>
                            <DrawerTitle className="font-bold">Checkout Cart</DrawerTitle>
                        </DrawerHeader>

                        <div className="p-2 overflow-y-auto">
                            {selectedItems.length > 0 ?
                                selectedItems.map((e) => (
                                    <div key={e.item.id} className="pl-1 border-2 rounded-lg my-2.5">
                                        <div className="flex flex-row items-center pr-5">
                                            <img src={e.item.image_url!} className="w-25 h-25 object-cover"></img>
                                            <div>
                                                <p className="font-bold text-sm">{e.item.name}</p>
                                                <p className="text-xs">${e.item.daily_rate} / day</p>
                                                <p className="text-xs">Quantity: <span className="font-bold">{e.quantity}</span></p>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <span className="flex flex-col items-center">
                                        <p className="text-center font-bold text-2xl">Your cart is empty</p>
                                        {/* <p>Or, you can add items to the desk</p> */}
                                    </span>
                                )
                            }
                            <div onClick={() => setDamageProtection(!damageProtection)} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 
                    ${damageProtection ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}>
                                <ShieldCheck size="18" className={damageProtection ? 'text-emerald-500' : 'text-slate-400'}></ShieldCheck>
                                <div className="flex-1">
                                    <p className={`text-xs font-semibold ${damageProtection ? 'text-emerald-700' : 'text-slate-600'}`}>Damage Protection</p>
                                    <p className="text-xs text-slate-400">+10% of order total</p>
                                </div>
                                <div className={`w-9 h-5 rounded-full transition-all duration-300 relative ${damageProtection ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duraiton-300 ${damageProtection ? 'left-4' : 'left-0.5'}`}></div>
                                </div>
                            </div>

                            <span className="flex flex-row justify-between py-2">
                                <p className="font-bold">Subtotal</p>
                                <p className="font-bold">${totalPrice.toFixed(2)} /day</p>
                            </span>
                            <div className="float-right flex flex-row gap-3 mt-5">
                                <DrawerClose asChild>
                                    <Button variant={"destructive"}>Close</Button>
                                </DrawerClose>
                                <Button className="bg-indigo-500">Proceed to payment</Button>
                            </div>
                        </div>

                    </DrawerContent>
                </Drawer>
            </div>
        </div >
    )
}