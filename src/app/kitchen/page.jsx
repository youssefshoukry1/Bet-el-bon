"use client"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { motion, AnimatePresence } from 'framer-motion'
import { ChefHat, Clock } from 'lucide-react'
import { fetchOrders, updateOrderStatus } from '@/lib/api'

export default function KitchenPage() {
    const queryClient = useQueryClient()

    // Poll for new orders every 5 seconds
    const { data: orders = [], isLoading } = useQuery({
        queryKey: ['orders'],
        queryFn: fetchOrders,
        refetchInterval: 5000
    })

    const { mutate } = useMutation({
        mutationFn: updateOrderStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] })
        }
    })

    const handleStatusUpdate = (id, newStatus) => {
        // Just logical mapping for payment: if ready/delivered, usually paid. 
        // But for simpler KDS, we just toggle status.
        mutate({ id, status: newStatus })
    }

    if (isLoading) return <div className="p-8 text-gold-400">Loading KDS...</div>

    const activeOrders = orders.filter(o =>
        o.status !== 'completed' &&
        o.status !== 'cancelled' &&
        o.status !== 'awaiting_payment' // Double check
    )

    return (
        <div className="min-h-screen bg-rich-black-950 p-6">
            <header className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-amiri font-bold text-gold-400 flex items-center gap-3">
                    <ChefHat size={32} />
                    Kitchen Display System
                </h1>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-gold-100">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                        Live Connection
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                    {activeOrders.map(order => (
                        <motion.div
                            key={order._id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <Card className={`
                                border-t-4 h-full flex flex-col
                                ${(order.status === 'pending' || order.status === 'paid') ? 'border-t-red-500' : ''}
                                ${order.status === 'preparing' ? 'border-t-amber-500' : ''}
                                ${order.status === 'ready' ? 'border-t-emerald-500' : ''}
                            `}>
                                <CardHeader className="bg-rich-black-900 pb-4 border-b border-rich-black-800">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gold-100">#{order.orderNumber}</h2>
                                            <div className="text-sm text-rich-black-400 flex items-center gap-1">
                                                <Clock size={12} /> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        <Badge variant={
                                            (order.status === 'pending' || order.status === 'paid') ? 'warning' :
                                                order.status === 'preparing' ? 'secondary' : 'success'
                                        } className="uppercase tracking-wider">
                                            {order.status === 'paid' ? 'PAID' : order.status}
                                        </Badge>
                                    </div>
                                    <div className="mt-2 text-sm text-gold-200 font-bold bg-rich-black-800 px-2 py-1 rounded w-fit">
                                        {/* Table number removed */}
                                    </div>
                                </CardHeader>

                                <CardContent className="flex-1 py-4 space-y-3">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-2 border-b border-rich-black-800 pb-2 last:border-0">
                                            <span className="font-bold text-gold-400 min-w-[20px]">{item.quantity}x</span>
                                            <div>
                                                <div className="font-medium text-gold-50">{item.title}</div>
                                                <div className="text-xs text-rich-black-400">
                                                    {item.size}
                                                    {item.customizations?.sugar && typeof item.customizations.sugar === 'string' && item.customizations.sugar !== 'no_sugar' && ` / ${item.customizations.sugar.replace('_', ' ')}`}
                                                    {item.customizations?.sugar === true && ' / Sugar'}
                                                    {item.customizations?.spiced && ' / Spiced'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>

                                <div className="p-4 bg-rich-black-900 mt-auto border-t border-rich-black-800">
                                    {(order.status === 'pending' || order.status === 'paid') && (
                                        <Button
                                            onClick={() => handleStatusUpdate(order._id, 'preparing')}
                                            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold"
                                        >
                                            Start Preparing
                                        </Button>
                                    )}
                                    {order.status === 'preparing' && (
                                        <Button
                                            onClick={() => handleStatusUpdate(order._id, 'ready')}
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                        >
                                            Mark Ready
                                        </Button>
                                    )}
                                    {order.status === 'ready' && (
                                        <Button
                                            onClick={() => handleStatusUpdate(order._id, 'completed')}
                                            variant="outline"
                                            className="w-full border-rich-black-700 text-rich-black-400 hover:bg-rich-black-800"
                                        >
                                            Archive
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}
