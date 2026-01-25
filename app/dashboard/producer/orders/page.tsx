"use client";

import { useState, useEffect } from "react";
import { authenticatedFetch } from "@/lib/auth";
import { motion } from "framer-motion";
import Loading from "@/app/components/general/loading";

interface Order {
    id: string;
    date: string;
    product: string;
    amount: number;
    downloadUrl: string | null;
}

const fadeVar = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
};

export default function ProducerOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            const ordersRes = await authenticatedFetch("/api/producer/orders");
            if (ordersRes.ok) {
                const data = await ordersRes.json();
                setOrders(data.orders);
            }
            setLoading(false);
        };
        fetchOrders();
    }, []);

    if (loading) {
        return (
            <div className="h-[calc(100vh-12rem)] flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    return (
        <motion.div
            variants={fadeVar}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-none pt-24"
        >
            <h2 className="font-main text-5xl md:text-7xl uppercase text-white mb-12">History</h2>

            {orders.length === 0 ? (
                <div className="py-20 border-y border-white/10 text-center">
                    <p className="font-mono text-white/40 uppercase tracking-widest">No orders found</p>
                </div>
            ) : (
                <div className="space-y-0">
                    <div className="grid grid-cols-12 gap-4 pb-4 border-b border-white/10 text-[10px] font-mono uppercase tracking-widest text-white/40">
                        <div className="col-span-3">Date</div>
                        <div className="col-span-5">Product</div>
                        <div className="col-span-2">Amount</div>
                        <div className="col-span-2 text-right">Invoice</div>
                    </div>

                    {orders.map((order) => (
                        <div key={order.id} className="grid grid-cols-12 gap-4 py-6 border-b border-white/5 hover:bg-white/[0.02] transition-colors items-center group">
                            <div className="col-span-3 font-mono text-sm text-white/60">
                                {new Date(order.date).toLocaleDateString()}
                            </div>
                            <div className="col-span-5 font-medium text-white group-hover:text-primary transition-colors">
                                {order.product}
                            </div>
                            <div className="col-span-2 font-mono text-sm text-white/60">
                                ${order.amount.toFixed(2)}
                            </div>
                            <div className="col-span-2 text-right">
                                {order.downloadUrl ? (
                                    <a href={order.downloadUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-widest border-b border-white/20 hover:border-primary hover:text-primary pb-0.5 transition-colors">
                                        Download
                                    </a>
                                ) : (
                                    <span className="text-xs text-white/20">—</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
