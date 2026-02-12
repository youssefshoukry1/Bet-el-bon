"use client"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { fetchOrders, updateOrderStatus } from '@/lib/api'
import { Check, Clock, Settings, Banknote } from 'lucide-react'
import { InstitutionSelector } from '@/components/features/InstitutionSelector'
import { useState, useEffect } from 'react'
import { AdminGuard } from '@/components/auth/AdminGuard'

export default function CashierPage() {
    return (
        <AdminGuard level="admin">
            <CashierContent />
        </AdminGuard>
    )
}

function CashierContent() {
    const queryClient = useQueryClient()
    const [institutionId, setInstitutionId] = useState(null)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)

    useEffect(() => {
        // Cashier specific settings storage
        const stored = localStorage.getItem('cashier_instId')
        if (stored) setInstitutionId(stored)
        else setIsSettingsOpen(true)
    }, [])

    const { data: orders = [], isLoading } = useQuery({
        queryKey: ['orders', institutionId],
        queryFn: () => fetchOrders(institutionId),
        enabled: !!institutionId,
        refetchInterval: 3000 // Fast polling for cashier
    })

    const { mutate, isPending } = useMutation({
        mutationFn: updateOrderStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders', institutionId] })
        }
    })

    const handleConfirmPayment = (orderId) => {
        // Cashier confirms => Status moves to 'paid' (which sends it to Kitchen)
        mutate({ id: orderId, status: 'paid', paymentStatus: 'paid' })
    }
    
    // Filter ONLY 'waiting_for_cash'
    const cashOrders = orders.filter(o => o.status === 'waiting_for_cash')
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) // Oldest first

    if (isLoading && institutionId) return <div className="p-8 text-gold-400">Loading...</div>

    return (
        <div className="min-h-screen bg-rich-black-950 p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-amiri font-bold text-gold-400">Cashier Terminal</h1>
                    {institutionId && <p className="text-rich-black-400 text-sm">Mode: Cash Confirmation</p>}
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)}>
                    <Settings className="mr-2" size={16} /> Branch
                </Button>
            </div>

            {!institutionId ? (
                <div className="text-center py-12 text-gold-400 border rounded-lg border-rich-black-800 bg-rich-black-900/50">
                    <p className="mb-4">Select Branch to Start Cashier Mode</p>
                    <Button onClick={() => setIsSettingsOpen(true)}>Select Branch</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cashOrders.length === 0 && (
                        <div className="col-span-full text-center py-20 text-rich-black-500 bg-rich-black-900/30 rounded-xl border-2 border-dashed border-rich-black-800">
                            <div className="text-6xl mb-4">☕</div>
                            <p className="text-xl">No pending cash orders</p>
                            <p className="text-sm">Waiting for customers...</p>
                        </div>
                    )}

                    {cashOrders.map(order => (
                        <Card key={order._id} className="border-l-4 border-l-gold-500 bg-rich-black-900 shadow-xl">
                            <CardContent className="p-6 flex flex-col justify-between h-full gap-6">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-4xl font-bold text-white block">#{order.orderNumber}</span>
                                            <span className="text-xs text-rich-black-400 flex items-center gap-1 mt-1">
                                                <Clock size={12} /> {new Date(order.createdAt).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <div className="bg-gold-500/10 text-gold-400 px-3 py-1 rounded-full text-xl font-bold font-amiri">
                                            {order.totalPrice} EGP
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-4 bg-rich-black-950 p-3 rounded-lg border border-rich-black-800">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="text-sm text-rich-black-300 flex justify-between">
                                                <span>{item.quantity}x {item.title} ({item.size})</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    onClick={() => handleConfirmPayment(order._id)}
                                    size="lg"
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-14 text-lg shadow-lg shadow-emerald-900/20"
                                >
                                    <Banknote className="mr-2" size={24} /> Confirm Payment
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <InstitutionSelector
                isOpen={isSettingsOpen}
                onClose={() => { if (institutionId) setIsSettingsOpen(false) }}
                onSelect={(inst) => {
                    setInstitutionId(inst._id)
                    localStorage.setItem('cashier_instId', inst._id)
                    setIsSettingsOpen(false)
                }}
            />
        </div>
    )
}
