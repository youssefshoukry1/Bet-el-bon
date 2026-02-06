"use client"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { fetchOrders, updateOrderStatus } from '@/lib/api'
import { Check, Clock, Loader2, ArrowRight } from 'lucide-react'

import { InstitutionSelector } from '@/components/features/InstitutionSelector'
import { Settings } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function AdminOrdersPage() {
    const queryClient = useQueryClient()
    const [institutionId, setInstitutionId] = useState(null)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)

    useEffect(() => {
        // Check for admin orders screen settings
        // We can reuse the same modal approach
        const stored = localStorage.getItem('adminOrders_instId')
        if (stored) setInstitutionId(stored)
        else setIsSettingsOpen(true)
    }, [])

    // Poll for orders every 5s
    const { data: orders = [], isLoading } = useQuery({
        queryKey: ['orders', institutionId],
        queryFn: () => fetchOrders(institutionId),
        enabled: !!institutionId,
        refetchInterval: 5000
    })

    const { mutate, isPending } = useMutation({
        mutationFn: updateOrderStatus,
        onSuccess: () => {
            // invalidate the specific query with the institution ID
            queryClient.invalidateQueries({ queryKey: ['orders', institutionId] })
        }
    })

    const handleStatusUpdate = (orderId, newStatus) => {
        mutate({ id: orderId, status: newStatus })
    }

    // Filter to show active orders first, then completed recent ones
    const sortedOrders = [...orders].sort((a, b) => {
        const statusPriority = { pending: 0, preparing: 1, ready: 2, completed: 3, cancelled: 4 }
        return statusPriority[a.status] - statusPriority[b.status] || new Date(b.createdAt) - new Date(a.createdAt)
    })

    if (isLoading && institutionId) return <div className="p-8 text-gold-400">Loading Orders...</div>

    // Instead of early return, render the selector wrapper
    return (
        <div className="space-y-6 relative">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-amiri font-bold text-gold-400">Order Management</h1>
                <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)}>
                    <Settings className="mr-2" size={16} /> Switch Branch
                </Button>
            </div>

            {!institutionId ? (
                <div className="text-center py-12 text-gold-400 border rounded-lg border-rich-black-800 bg-rich-black-900/50">
                    <p className="mb-4">Please select a branch to manage orders.</p>
                    <Button onClick={() => setIsSettingsOpen(true)}>Select Branch</Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedOrders.length === 0 && (
                        <div className="text-center py-12 text-rich-black-400">No orders found for this branch.</div>
                    )}
                    {sortedOrders.map(order => (
                        <Card key={order._id} className={`
                        border-l-4 
                        ${order.status === 'pending' ? 'border-l-red-500' : ''}
                        ${order.status === 'preparing' ? 'border-l-amber-500' : ''}
                        ${order.status === 'ready' ? 'border-l-emerald-500' : ''}
                        ${order.status === 'completed' ? 'border-l-rich-black-600 opacity-60' : ''}
                    `}>
                            <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-xl font-bold text-gold-100">#{order.orderNumber}</span>
                                        <Badge variant={order.status === 'ready' ? 'success' : 'secondary'} className="uppercase">
                                            {order.status}
                                        </Badge>
                                        <span className="text-xs text-rich-black-400 flex items-center gap-1">
                                            <Clock size={12} /> {new Date(order.createdAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="text-sm text-rich-black-300">
                                                <span className="font-bold text-gold-50">{item.quantity}x {item.title}</span>
                                                <span className="text-xs opacity-70 ml-2">({item.size})</span>
                                                {item.customizations?.sugar !== 'no_sugar' && (
                                                    <span className="text-xs text-amber-400 ml-2">
                                                        [{item.customizations.sugar.replace('_', ' ')}]
                                                    </span>
                                                )}
                                                {item.customizations?.spiced && (
                                                    <span className="text-xs text-orange-400 ml-2">[Spiced]</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {order.notes && (
                                        <div className="mt-2 text-xs text-red-300 italic">
                                            Note: {order.notes}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 w-full md:w-auto">
                                    {order.status === 'pending' && (
                                        <Button onClick={() => handleStatusUpdate(order._id, 'preparing')} className="bg-amber-600 hover:bg-amber-700 w-full md:w-auto">
                                            Start Preparing <ArrowRight size={16} className="ml-2" />
                                        </Button>
                                    )}
                                    {order.status === 'preparing' && (
                                        <Button onClick={() => handleStatusUpdate(order._id, 'ready')} className="bg-emerald-600 hover:bg-emerald-700 w-full md:w-auto">
                                            Mark Ready <Check size={16} className="ml-2" />
                                        </Button>
                                    )}
                                    {order.status === 'ready' && (
                                        <Button onClick={() => handleStatusUpdate(order._id, 'completed')} variant="outline" className="w-full md:w-auto">
                                            Complete Order
                                        </Button>
                                    )}
                                    {order.status === 'completed' && (
                                        <span className="text-rich-black-500 text-sm font-medium px-4">Completed</span>
                                    )}
                                </div>
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
                    localStorage.setItem('adminOrders_instId', inst._id)
                    setIsSettingsOpen(false)
                    // No need to reload, react-query handles key change
                }}
            />
        </div>
    )
}
