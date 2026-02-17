"use client"
import { fetchOrders, fetchInstitutions } from '@/lib/api'
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
    const ready = orders.filter(o => o.status === 'ready')

    // Optional: Auto-scroll or pagination if list is too long?
    // For now, simple list.

    // Fetch institutions to lookup name
    const { data: institutions = [] } = useQuery({
        queryKey: ['institutions'],
        queryFn: fetchInstitutions
    })

    const currentBranch = institutions.find(i => i._id === institutionId)

    return (
        <div className="min-h-screen bg-rich-black-950 text-white p-4 lg:p-8 overflow-hidden flex flex-col">
            {/* Header */}
            <header className="mb-8 text-center border-b border-rich-black-800 pb-4 relative">
                <h1 className="text-4xl md:text-6xl font-amiri font-bold text-gold-400 tracking-wider">
                    {currentBranch ? currentBranch.name : 'ORDER STATUS'}
                </h1>
                <p className="text-rich-black-400 mt-2 text-lg uppercase tracking-widest">
                    {currentBranch ? 'Please wait for your number' : 'Select a branch'}
                </p>

                {/* Settings Trigger - Top Right */}
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="absolute top-0 right-0 p-2 text-rich-black-600 hover:text-gold-400 transition-colors"
                >
                    <Settings size={28} />
                </button>
            </header>

            {/* Content Grid */}
            <div className="flex-1 grid grid-cols-1 gap-8 h-full">

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
