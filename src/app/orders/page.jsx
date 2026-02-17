"use client"
import Link from 'next/link'
import { ArrowRight, Clock, Coffee, CheckCircle2, ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchOrders } from '@/lib/api'
import { useLanguage } from '@/context/LanguageContext'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import axios from 'axios'
import { useSearchParams, useRouter } from 'next/navigation'

const API_BASE_URL = 'https://bet-el-bon-api.vercel.app/api'

export default function MyOrdersPage() {
    const { t } = useLanguage()
    const [myOrderIds, setMyOrderIds] = useState([])
    const [orders, setOrders] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    // Hooks for Paymob Redirect Handling
    const searchParams = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('myOrders') || '[]')
        setMyOrderIds(stored)
    }, [])

    // 🔹 Load Orders Function (Defined here to be utilized by multiple effects)
    const loadOrders = async () => {
        if (myOrderIds.length === 0) {
            setIsLoading(false)
            return
        }

        try {
            // Fetch details for each ID
            const requests = myOrderIds.map(id => axios.get(`${API_BASE_URL}/order/${id}`)
                .then(res => ({ status: 'fulfilled', value: res.data, id }))
                .catch(err => ({ status: 'rejected', reason: err, id }))
            )

            const results = await Promise.all(requests)

            // 1. Separate valid orders and dead IDs (404s)
            const validOrders = []
            const deadIds = []

            results.forEach(result => {
                if (result.status === 'fulfilled') {
                    validOrders.push(result.value)
                } else {
                    const err = result.reason
                    // If 404, it means the order caused by failed payment was deleted from DB
                    if (err.response && err.response.status === 404) {
                        deadIds.push(result.id)
                    }
                }
            })

            // 2. Clean up LocalStorage if we found dead IDs
            // 2. Clean up LocalStorage if we found dead IDs
            if (deadIds.length > 0) {
                console.warn(`Cleaning up ${deadIds.length} invalid/deleted orders from history.`)
                const currentIds = JSON.parse(localStorage.getItem('myOrders') || '[]')
                const updatedIds = currentIds.filter(id => !deadIds.includes(id))

                localStorage.setItem('myOrders', JSON.stringify(updatedIds))
                setMyOrderIds(updatedIds) // Update state to stop polling these
            }

            // 3. Update UI
            setOrders(validOrders
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Newest first
            )
            console.error(t('error.failedLoadOrders'))
        } finally {
            setIsLoading(false)
        }
    }

    // 🔹 Paymob Verification Effect
    useEffect(() => {
        const hmac = searchParams.get('hmac')
        const success = searchParams.get('success')

        const verifyPayment = async () => {
            // Case 1: Payment Success
            if (hmac && success === 'true') {
                try {
                    console.log('🔄 Verifying Paymob payment via frontend redirect...')
                    const queryString = searchParams.toString()

                    // Call backend callback endpoint (GET) to process the result
                    await axios.get(`${API_BASE_URL}/order/paymob-callback?${queryString}`)

                    console.log('✅ Payment verified successfully!')

                    // 🔹 NEW: Promote the pending order to "My Orders"
                    // We only do this AFTER successful verification
                    const pendingOrderId = localStorage.getItem('pendingPaymobOrder')
                    if (pendingOrderId) {
                        const existingOrders = JSON.parse(localStorage.getItem('myOrders') || '[]')
                        if (!existingOrders.includes(pendingOrderId)) {
                            existingOrders.unshift(pendingOrderId)
                            localStorage.setItem('myOrders', JSON.stringify(existingOrders))
                            setMyOrderIds(existingOrders) // Update state to trigger loadOrders
                        }
                        localStorage.removeItem('pendingPaymobOrder')
                    }

                    // Clean URL by removing paymob params
                    window.history.replaceState({}, document.title, window.location.pathname)
                } catch (err) {
                    console.error('❌ Payment verification failed:', err)
                    // Even if verification fails, the order might exist
                    const pendingOrderId = localStorage.getItem('pendingPaymobOrder')
                    if (pendingOrderId) {
                        localStorage.removeItem('pendingPaymobOrder')
                    }
                }
            }
            // Case 2: Payment Cancelled or Failed
            else if (hmac && success === 'false') {
                console.warn('⚠️ Payment cancelled by user or failed')
                localStorage.removeItem('pendingPaymobOrder')
                window.history.replaceState({}, document.title, window.location.pathname)
            }
        }

        verifyPayment()
    }, [searchParams])

    // 🔹 Initial Load & Polling Effect
    useEffect(() => {
        if (myOrderIds.length > 0) {
            loadOrders()
            const interval = setInterval(loadOrders, 5000) // Poll for updates
            return () => clearInterval(interval)
        } else {
            setIsLoading(false)
        }
    }, [myOrderIds]) // Re-run when IDs are loaded

    if (isLoading) return <div className="p-8 text-gold-400 text-center">{t('term.loading')}</div>

    const getStatusLabel = (status) => {
        const statusMap = {
            'awaiting_payment': 'awaiting_payment',
            'waiting_for_cash': 'waiting_for_cash',
            'pending': 'status.pending',
            'paid': 'status.paid',
            'preparing': 'status.preparing',
            'ready': 'status.ready',
            'completed': 'status.completed',
        }
        return t(statusMap[status] || status)
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl min-h-[60vh]">
            <h1 className="text-3xl font-amiri font-bold text-gold-100 mb-8 flex items-center gap-3">
                <Coffee /> {t('orders.title')}
            </h1>

            {orders.length === 0 ? (
                <div className="text-center text-rich-black-400 py-12 bg-rich-black-900 rounded-xl border border-rich-black-800">
                    <p className="mb-4">{t('orders.noOrders')}</p>
                    <Link href="/">
                        <Button>{t('link.browseMenu')}</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <Link key={order._id} href={`/order/${order._id}`}>
                            <Card className="hover:border-gold-500/50 transition-colors cursor-pointer group">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gold-50 text-lg">{t('orders.orderNumber', { number: order.orderNumber })}</span>
                                            <Badge variant={
                                                order.status === 'ready' ? 'success' :
                                                    order.status === 'paid' ? 'default' :
                                                        order.status === 'completed' ? 'outline' : 'warning'
                                            } className="text-xs uppercase">
                                                {getStatusLabel(order.status)}
                                            </Badge>
                                        </div>
                                        <span className="text-xs text-rich-black-400 flex items-center gap-1">
                                            <Clock size={12} /> {new Date(order.createdAt).toLocaleString()}
                                        </span>
                                        <div className="text-sm text-rich-black-300 mt-1">
                                            {t('orders.items', { count: order.items.length })} • {order.totalPrice} EGP
                                        </div>
                                    </div>
                                    <ChevronRight className="text-rich-black-600 group-hover:text-gold-400 transition-colors" />
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
