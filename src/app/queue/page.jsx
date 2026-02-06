"use client"
import { fetchOrders } from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { InstitutionSelector } from '@/components/features/InstitutionSelector'
import { Settings } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

export default function QueuePage() {
    const [institutionId, setInstitutionId] = useState(null)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)

    useEffect(() => {
        // Check for queue screen settings
        const stored = localStorage.getItem('queueSettings_instId')
        if (stored) setInstitutionId(stored)
        else setIsSettingsOpen(true)
    }, [])

    // Poll for orders frequently (every 3s)
    const { data: orders = [] } = useQuery({
        queryKey: ['orders', institutionId],
        queryFn: () => fetchOrders(institutionId), // fetchOrders handles param now
        enabled: !!institutionId,
        refetchInterval: 3000
    })

    // Filter orders
    const preparing = orders.filter(o => o.status === 'preparing')
    const ready = orders.filter(o => o.status === 'ready')

    // Optional: Auto-scroll or pagination if list is too long?
    // For now, simple list.

    return (
        <div className="min-h-screen bg-rich-black-950 text-white p-4 lg:p-8 overflow-hidden flex flex-col">
            {/* Header */}
            <header className="mb-8 text-center border-b border-rich-black-800 pb-4">
                <h1 className="text-4xl md:text-6xl font-amiri font-bold text-gold-400 tracking-wider">
                    ORDER STATUS
                </h1>
                <p className="text-rich-black-400 mt-2 text-lg uppercase tracking-widest">Please wait for your number</p>
            </header>

            {/* Content Grid */}
            <div className="flex-1 grid grid-cols-2 gap-8 h-full">

                {/* PREPARING COLUMN */}
                <div className="bg-rich-black-900/50 rounded-3xl border border-rich-black-800 p-6 flex flex-col">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-amber-500 uppercase tracking-widest flex items-center justify-center gap-3">
                        <span className="w-4 h-4 rounded-full bg-amber-500 animate-pulse" />
                        Preparing
                    </h2>

                    <div className="grid grid-cols-2 gap-4 content-start">
                        <AnimatePresence>
                            {preparing.map(order => (
                                <motion.div
                                    key={order._id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    layout
                                    className="bg-rich-black-800 rounded-xl p-4 text-center border border-rich-black-700"
                                >
                                    <span className="text-4xl md:text-6xl font-bold text-white font-mono">
                                        {order.orderNumber}
                                    </span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* READY COLUMN */}
                <div className="bg-gradient-to-br from-gold-900/20 to-rich-black-900 rounded-3xl border border-gold-500/30 p-6 flex flex-col relative overflow-hidden">
                    <div className="absolute inset-0 bg-gold-500/5 pointer-events-none" />

                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-3 relative z-10">
                        <span className="w-4 h-4 rounded-full bg-emerald-400 animate-bounce" />
                        Ready to Serve
                    </h2>

                    <div className="grid grid-cols-1 gap-4 content-start relative z-10">
                        <AnimatePresence>
                            {ready.map(order => (
                                <motion.div
                                    key={order._id}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ type: 'spring' }}
                                    layout
                                    className="bg-emerald-500/10 rounded-2xl p-6 text-center border-2 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                                >
                                    <span className="text-6xl md:text-8xl font-bold text-emerald-100 font-mono drop-shadow-lg">
                                        {order.orderNumber}
                                    </span>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {ready.length === 0 && (
                            <div className="text-center text-rich-black-500 mt-20 italic text-xl">
                                No orders ready yet
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Hidden Settings Trigger (Bottom Right) */}
            <button
                onClick={() => setIsSettingsOpen(true)}
                className="fixed bottom-4 right-4 text-rich-black-800 hover:text-white transition-colors opacity-20 hover:opacity-100"
            >
                <Settings />
            </button>

            <InstitutionSelector
                isOpen={isSettingsOpen}
                onClose={() => { if (institutionId) setIsSettingsOpen(false) }}
                onSelect={(inst) => {
                    setInstitutionId(inst._id)
                    localStorage.setItem('queueSettings_instId', inst._id)
                    setIsSettingsOpen(false)
                    window.location.reload() // Reload to refresh query
                }}
            />
        </div>
    )
}
