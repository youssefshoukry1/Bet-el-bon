"use client"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { fetchOrders, updateOrderStatus } from '@/lib/api'
import { Check, Clock, Settings } from 'lucide-react'
import { InstitutionSelector } from '@/components/features/InstitutionSelector'
import { useState, useEffect } from 'react'
import { AdminGuard } from '@/components/auth/AdminGuard'
import { useLanguage } from '@/context/LanguageContext'

export default function AdminOrdersPage() {
    return (
        <AdminGuard level="admin">
            <AdminOrdersContent />
        </AdminGuard>
    )
}

function AdminOrdersContent() {
    const { t } = useLanguage()
    const queryClient = useQueryClient()
    const [institutionId, setInstitutionId] = useState(null)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)

    useEffect(() => {
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

    const { mutate } = useMutation({
        mutationFn: updateOrderStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders', institutionId] })
        }
    })

    const handleStatusUpdate = (orderId, newStatus) => {
        mutate({ id: orderId, status: newStatus })
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

    const kitchenOrders = orders.filter(o => o.status !== 'waiting_for_cash')

    const sortedOrders = [...kitchenOrders].sort((a, b) => {
        const statusPriority = { paid: 0, pending: 0, ready: 1, cancelled: 2 }
        return statusPriority[a.status] - statusPriority[b.status] || new Date(b.createdAt) - new Date(a.createdAt)
    })

    if (isLoading && institutionId) return <div className="p-8 text-gold-400 text-center">{t('term.loading')}</div>

    return (
        <div className="space-y-6 relative">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-amiri font-bold text-gold-400">{t('orderManagement.title')}</h1>
                <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)}>
                    <Settings className="me-2" size={16} /> {t('orderManagement.switchBranch')}
                </Button>
            </div>

            {!institutionId ? (
                <div className="text-center py-12 text-gold-400 border rounded-lg border-rich-black-800 bg-rich-black-900/50">
                    <p className="mb-4">{t('orderManagement.selectBranchPrompt')}</p>
                    <Button onClick={() => setIsSettingsOpen(true)}>{t('cashier.selectBranchBtn')}</Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedOrders.length === 0 && (
                        <div className="text-center py-12 text-rich-black-400">{t('orderManagement.noOrders')}</div>
                    )}
                    {sortedOrders.map(order => (
                        <Card key={order._id} className={`
                        border-l-4 
                        ${(order.status === 'paid') ? 'border-l-red-500' : ''}
                        ${order.status === 'ready' ? 'border-l-emerald-500' : ''}
                        ${order.status === 'cancelled' ? 'border-l-rich-black-600 opacity-60' : ''}
                    `}>
                            <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-xl font-bold text-gold-100"># {order.orderNumber}</span>
                                        <Badge variant={order.status === 'ready' ? 'success' : 'secondary'} className="uppercase">
                                            {getStatusLabel(order.status)}
                                        </Badge>
                                        <span className="text-xs text-rich-black-400 flex items-center gap-1">
                                            <Clock size={12} /> {new Date(order.createdAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        {order.items.map((item, idx) => {
                                            const sizeText = getSizeLabel(item.size)
                                            const sugarText = getSugarLabel(item.customizations?.sugar)
                                            const spicedText = item.customizations?.spiced ? t('product.spiced') : null
                                            const details = [sizeText, sugarText, spicedText].filter(Boolean)

                                            return (
                                                <div key={idx} className="text-sm text-rich-black-300">
                                                    <span className="font-bold text-gold-50">{item.quantity}x {item.title}</span>
                                                    {details.length > 0 && (
                                                        <span className="text-xs opacity-70 ms-2">({details.join(' • ')})</span>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                    {order.notes && (
                                        <div className="mt-2 text-xs text-red-300 italic">
                                            {t('orderManagement.note')}: {order.notes}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 w-full md:w-auto">
                                    {(order.status === 'paid') && (
                                        <Button onClick={() => handleStatusUpdate(order._id, 'ready')} className="bg-emerald-600 hover:bg-emerald-700 w-full md:w-auto">
                                            {t('orderManagement.markReady')} <Check size={16} className="ms-2" />
                                        </Button>
                                    )}
                                    {order.status === 'ready' && (
                                        <span className="text-emerald-400 text-sm font-medium px-4">{t('status.ready')}</span>
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
                }}
            />
        </div>
    )
}
