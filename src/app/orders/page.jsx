"use client"
import Link from 'next/link'
import { ArrowRight, Clock, Coffee, CheckCircle2, ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchOrders } from '@/lib/api' // We might need a specific 'fetchMyOrders' but for now fetching all is too much. 
// Ideally we should have an endpoint `fetchOrderByIds` or `fetchMyOrders`.
// For MVP, since we don't have auth, we can just fetch all or fetch individually. 
// Fetching all is risky for data leak but easiest for now if number of orders is small.
// A better approach is to fetch each ID individually using useQueries, but that is complex.
// Let's assume for this small coffee shop, fetching the specific IDs one by one or a small bulk is okay.
// Actually, `fetchOrders` returns ALL orders currently. That works for "Admins" but for users? 
// The user has IDs in localStorage. We can filter the client side data if we are lazy, OR (better) call getOrderById multiple times.

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import axios from 'axios'

export default function MyOrdersPage() {
    const [myOrderIds, setMyOrderIds] = useState([])
    const [orders, setOrders] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('myOrders') || '[]')
        setMyOrderIds(stored)
    }, [])

    useEffect(() => {
        const loadOrders = async () => {
            if (myOrderIds.length === 0) {
                setIsLoading(false)
                return
            }

            try {
                // Fetch details for each ID
                // Note: In a real app, use a bulk fetch endpoint.
                const requests = myOrderIds.map(id => axios.get(`https://bet-el-bon-api.vercel.app/api/order/${id}`).catch(err => null))
                const responses = await Promise.all(requests)
                const validOrders = responses
                    .filter(r => r && r.data)
                    .map(r => r.data)
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Newest first

                setOrders(validOrders)
            } catch (error) {
                console.error("Failed to load orders", error)
            } finally {
                setIsLoading(false)
            }
        }

        if (myOrderIds.length > 0) {
            loadOrders()
            const interval = setInterval(loadOrders, 5000) // Poll for updates
            return () => clearInterval(interval)
        }
    }, [myOrderIds])

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
                                            <Badge variant={order.status === 'ready' ? 'success' : order.status === 'completed' ? 'outline' : 'warning'} className="text-xs uppercase">
                                                {order.status}
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
