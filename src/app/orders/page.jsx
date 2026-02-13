"use client"
import Link from 'next/link'
import { ArrowRight, Clock, Coffee, CheckCircle2, ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchOrders } from '@/lib/api'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import axios from 'axios'
import { useSearchParams, useRouter } from 'next/navigation'

const API_BASE_URL = 'https://bet-el-bon-api.vercel.app/api'

export default function MyOrdersPage() {
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
            const requests = myOrderIds.map(id => axios.get(`${API_BASE_URL}/order/${id}`).catch(err => null))
            const responses = await Promise.all(requests)
            const validOrders = responses
                .filter(r => r && r.data)
                .map(r => r.data)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Newest first

            setOrders(validOrders
                .filter(order => order.status !== 'awaiting_payment') // 🔹 HIDE pending paymob orders
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Newest first
            )
        } catch (error) {
            console.error("Failed to load orders", error)
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

                    // Clean URL
                    router.replace('/orders')

                    // Reload orders immediately
                    loadOrders()
                } catch (error) {
                    console.error('❌ Failed to verify payment on redirect:', error)
                    // Still try to reload orders
                    loadOrders()
                }
            }
            // Case 2: Payment Failed / Refused
            else if (success === 'false') {
                console.warn('❌ Payment was refused or failed.')
                alert("Payment Failed! Please try again with a valid card or wallet.")

                // Optional: Remove the failed order ID from localStorage so it doesn't try to load
                // Or keep it but it won't show up because of the filter
                router.replace('/orders') // Clean URL
            }
        }

        verifyPayment()
    }, [searchParams]) // Verify when params change

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

    if (isLoading) return <div className="p-8 text-gold-400 text-center">Loading your orders...</div>

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl min-h-[60vh]">
            <h1 className="text-3xl font-amiri font-bold text-gold-100 mb-8 flex items-center gap-3">
                <Coffee /> My Orders
            </h1>

            {orders.length === 0 ? (
                <div className="text-center text-rich-black-400 py-12 bg-rich-black-900 rounded-xl border border-rich-black-800">
                    <p className="mb-4">You haven't placed any orders yet.</p>
                    <Link href="/">
                        <Button>Browse Menu</Button>
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
                                            <span className="font-bold text-gold-50 text-lg">Order #{order.orderNumber}</span>
                                            <Badge variant={
                                                order.status === 'ready' ? 'success' :
                                                    order.status === 'paid' ? 'default' :
                                                        order.status === 'completed' ? 'outline' : 'warning'
                                            } className="text-xs uppercase">
                                                {order.status === 'awaiting_payment' ? 'Waiting for Payment' :
                                                    order.status === 'waiting_for_cash' ? 'Pay Cashier' :
                                                        order.status}
                                            </Badge>
                                        </div>
                                        <span className="text-xs text-rich-black-400 flex items-center gap-1">
                                            <Clock size={12} /> {new Date(order.createdAt).toLocaleString()}
                                        </span>
                                        <div className="text-sm text-rich-black-300 mt-1">
                                            {order.items.length} items • {order.totalPrice} EGP
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
