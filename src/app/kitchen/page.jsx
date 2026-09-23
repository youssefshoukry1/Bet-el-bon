"use client"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { motion, AnimatePresence } from 'framer-motion'
import { ChefHat, Clock } from 'lucide-react'
import { fetchOrders, updateOrderStatus } from '@/lib/api'
import { useLanguage } from '@/context/LanguageContext'

export default function KitchenPage() {
    const { t } = useLanguage()
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
        mutate({ id, status: newStatus })
    }

    const getSizeLabel = (size) => {
        if (!size) return ''
        const sizeMap = {
            small: 'product.small',
            medium: 'product.medium',
            large: 'product.large'
        }
        return t(sizeMap[size.toLowerCase()] || size)
    }

    const getSugarLabel = (sugar) => {
        if (!sugar || sugar === 'no_sugar') return null
        const sugarMap = {
            '1_shot': 'product.1Shot',
            '2_shots': 'product.2Shots',
            '3_shots': 'product.3Shots'
        }
        if (sugar === true) return t('product.sugar')
        return t(sugarMap[sugar] || sugar)
    }

    const getStatusLabel = (status) => {
        const statusMap = {
            'awaiting_payment': 'status.awaiting_payment',
            'waiting_for_cash': 'status.waiting_for_cash',
            'pending': 'status.pending',
            'paid': 'status.paid',
            'preparing': 'status.preparing',
            'ready': 'status.ready',
            'completed': 'status.completed',
            'cancelled': 'status.cancelled',
        }
        return t(statusMap[status] || `status.${status}`)
    }

    if (isLoading) return <div className="p-8 text-gold-400 text-center">{t('kitchen.loading')}</div>

    const activeOrders = orders.filter(o =>
        o.status !== 'cancelled'
    )

    return (
        <div className="min-h-screen bg-rich-black-950 p-6">
            <header className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-amiri font-bold text-gold-400 flex items-center gap-3">
                    <ChefHat size={32} />
                    {t('kitchen.title')}
                </h1>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-gold-100">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                        {t('kitchen.liveConnection')}
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                    {activeOrders.length === 0 ? (
                        <div className="col-span-full text-center py-20 text-rich-black-500 bg-rich-black-900/30 rounded-xl border-2 border-dashed border-rich-black-800">
                            <div className="text-6xl mb-4">👨‍🍳</div>
                            <p className="text-xl">{t('kitchen.noActiveOrders')}</p>
                        </div>
                    ) : (
                        activeOrders.map(order => (
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
                                                {getStatusLabel(order.status)}
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="flex-1 py-4 space-y-3">
                                        {order.items.map((item, idx) => {
                                            const sizeText = getSizeLabel(item.size)
                                            const sugarText = getSugarLabel(item.customizations?.sugar)
                                            const spicedText = item.customizations?.spiced ? t('product.spiced') : null
                                            const details = [sizeText, sugarText, spicedText].filter(Boolean)

                                            return (
                                                <div key={idx} className="flex items-start gap-2 border-b border-rich-black-800 pb-2 last:border-0">
                                                    <span className="font-bold text-gold-400 min-w-[20px]">{item.quantity}x</span>
                                                    <div>
                                                        <div className="font-medium text-gold-50">{item.title}</div>
                                                        {details.length > 0 && (
                                                            <div className="text-xs text-rich-black-400">
                                                                {details.join(' / ')}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </CardContent>

                                    <div className="p-4 bg-rich-black-900 mt-auto border-t border-rich-black-800">
                                        {order.status === 'preparing' && (
                                            <Button
                                                onClick={() => handleStatusUpdate(order._id, 'ready')}
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                            >
                                                {t('kitchen.markReady')}
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
