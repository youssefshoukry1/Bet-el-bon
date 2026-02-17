"use client"

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchOrders, fetchInstitutions } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { motion } from 'framer-motion'
import { TrendingUp, DollarSign, ShoppingCart, Zap, Calendar, ChevronDown, AlertCircle } from 'lucide-react'
import { AdminGuard } from '../../components/auth/AdminGuard'

const FILTER_TABS = [
    { id: 'day', label: 'Today', days: 0 },
    { id: 'week', label: 'This Week', days: 7 },
    { id: 'month', label: 'This Month', days: 30 },
    { id: 'year', label: 'This Year', days: 365 }
]

const STATUS_COLORS = {
    'paid': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    'ready': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
    'pending': { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
    'cancelled': { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30' },
    'waiting_for_cash': { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' }
}


export default function Dashboard() {
    const [filterPeriod, setFilterPeriod] = useState('month')
    const [expandedInstitution, setExpandedInstitution] = useState(null)

    // Fetch all data
    const { data: allOrders = [], isLoading: ordersLoading, error: ordersError } = useQuery({
        queryKey: ['dashboard-orders'],
        queryFn: fetchOrders
    })

    const { data: institutions = [], isLoading: institutionsLoading, error: institutionsError } = useQuery({
        queryKey: ['institutions'],
        queryFn: fetchInstitutions
    })

    const isLoading = ordersLoading || institutionsLoading
    const hasError = ordersError || institutionsError

    // Calculate date range based on filter
    const getDateRange = () => {
        const endDate = new Date()
        const startDate = new Date()
        const daysToSubtract = FILTER_TABS.find(t => t.id === filterPeriod)?.days || 30

        if (filterPeriod === 'day') {
            startDate.setHours(0, 0, 0, 0)
            endDate.setHours(23, 59, 59, 999)
        } else {
            startDate.setDate(startDate.getDate() - daysToSubtract)
        }
        return { startDate, endDate }
    }

    // Filter orders by date range
    const { startDate, endDate } = getDateRange()
    const filteredOrders = useMemo(() => {
        return allOrders.filter(order => {
            const orderDate = new Date(order.createdAt)
            return orderDate >= startDate && orderDate <= endDate && order.status !== 'awaiting_payment'
        })
    }, [allOrders, filterPeriod])

    // Calculate revenue metrics by institution
    const institutionMetrics = useMemo(() => {
        const metrics = {}

        institutions.forEach(inst => {
            metrics[inst._id] = {
                institution: inst,
                revenue: 0,
                ordersCount: 0,
                topDrinks: {}
            }
        })

        filteredOrders.forEach(order => {
            const instId = order.institutionId
            if (metrics[instId]) {
                metrics[instId].revenue += order.totalPrice || 0
                metrics[instId].ordersCount += 1

                // Track top drinks
                order.items.forEach(item => {
                    const drinkKey = item.title
                    if (!metrics[instId].topDrinks[drinkKey]) {
                        metrics[instId].topDrinks[drinkKey] = { revenue: 0, quantity: 0 }
                    }
                    const itemTotal = (item.price || 0) * (item.quantity || 1)
                    metrics[instId].topDrinks[drinkKey].revenue += itemTotal
                    metrics[instId].topDrinks[drinkKey].quantity += item.quantity || 1
                })
            }
        })

        return metrics
    }, [filteredOrders, institutions])

    // Calculate total revenue
    const totalRevenue = Object.values(institutionMetrics).reduce((sum, m) => sum + m.revenue, 0)
    const totalOrders = filteredOrders.length

    // Get top 5 drinks overall
    const topDrinksOverall = useMemo(() => {
        const drinksMap = {}
        Object.values(institutionMetrics).forEach(inst => {
            Object.entries(inst.topDrinks).forEach(([drinkName, data]) => {
                if (!drinksMap[drinkName]) {
                    drinksMap[drinkName] = { revenue: 0, quantity: 0 }
                }
                drinksMap[drinkName].revenue += data.revenue
                drinksMap[drinkName].quantity += data.quantity
            })
        })

        return Object.entries(drinksMap)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5)
    }, [institutionMetrics])

    // Order status distribution
    const orderStatusDistribution = useMemo(() => {
        const distribution = {}
        filteredOrders.forEach(order => {
            distribution[order.status] = (distribution[order.status] || 0) + 1
        })
        return distribution
    }, [filteredOrders])

    return (
        <div className="space-y-8 pb-12">
            {/* Header Section */}
            <div className="space-y-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-100 to-gold-400">
                        Management Dashboard
                    </h1>
                    <p className="text-rich-black-300 mt-2">Track revenue, orders, and performance across all institutions</p>
                </motion.div>

                {/* Loading State */}
                {isLoading && (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                        <p className="text-blue-300 text-sm">Loading dashboard data...</p>
                    </div>
                )}

                {/* Error State */}
                {hasError && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
                        <AlertCircle className="text-red-400" size={20} />
                        <p className="text-red-300 text-sm">Failed to load dashboard data. Please try again later.</p>
                    </div>
                )}

                {/* Filter Tabs */}
                <div className="flex gap-2 flex-wrap">
                    {FILTER_TABS.map((tab) => (
                        <motion.button
                            key={tab.id}
                            onClick={() => setFilterPeriod(tab.id)}
                            className={`
                px-4 py-2 rounded-lg font-medium transition-all duration-300 border
                ${filterPeriod === tab.id
                                    ? 'bg-gold-500 text-rich-black-900 border-gold-500 shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                                    : 'bg-rich-black-800/50 text-rich-black-300 border-rich-black-700 hover:border-gold-500/50 hover:text-gold-200'}
              `}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Calendar className="inline w-4 h-4 mr-2" />
                            {tab.label}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Revenue */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <Card className="bg-gradient-to-br from-rich-black-800 to-rich-black-900 border-rich-black-700 hover:border-gold-500/30 transition-all">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-rich-black-400 text-sm mb-2">Total Revenue</p>
                                    <h3 className="text-3xl font-bold text-gold-400">
                                        {isLoading ? '...' : totalRevenue.toLocaleString('en-EG')} {!isLoading && 'EGP'}
                                    </h3>
                                    <p className="text-rich-black-500 text-xs mt-2">{totalOrders} orders</p>
                                </div>
                                <div className="bg-gold-500/10 p-3 rounded-lg">
                                    <DollarSign className="text-gold-400" size={24} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Total Orders */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card className="bg-gradient-to-br from-rich-black-800 to-rich-black-900 border-rich-black-700 hover:border-blue-500/30 transition-all">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-rich-black-400 text-sm mb-2">Total Orders</p>
                                    <h3 className="text-3xl font-bold text-blue-400">{isLoading ? '...' : totalOrders}</h3>
                                    <p className="text-rich-black-500 text-xs mt-2">{institutions.length} institutions</p>
                                </div>
                                <div className="bg-blue-500/10 p-3 rounded-lg">
                                    <ShoppingCart className="text-blue-400" size={24} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Average Order Value */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Card className="bg-gradient-to-br from-rich-black-800 to-rich-black-900 border-rich-black-700 hover:border-purple-500/30 transition-all">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-rich-black-400 text-sm mb-2">Avg Order Value</p>
                                    <h3 className="text-3xl font-bold text-purple-400">
                                        {isLoading ? '...' : totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0} {!isLoading && 'EGP'}
                                    </h3>
                                    <p className="text-rich-black-500 text-xs mt-2">per order</p>
                                </div>
                                <div className="bg-purple-500/10 p-3 rounded-lg">
                                    <TrendingUp className="text-purple-400" size={24} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Top Selling Drink */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <Card className="bg-gradient-to-br from-rich-black-800 to-rich-black-900 border-rich-black-700 hover:border-emerald-500/30 transition-all">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-rich-black-400 text-sm mb-2">Top Selling Drink</p>
                                    <h3 className="text-2xl font-bold text-emerald-400 truncate">
                                        {isLoading ? '...' : topDrinksOverall[0]?.name || 'N/A'}
                                    </h3>
                                    <p className="text-rich-black-500 text-xs mt-2">
                                        {isLoading ? '...' : `${topDrinksOverall[0]?.quantity || 0} sold`}
                                    </p>
                                </div>
                                <div className="bg-emerald-500/10 p-3 rounded-lg">
                                    <Zap className="text-emerald-400" size={24} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Revenue by Institution */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
            >
                <Card className="bg-gradient-to-br from-rich-black-800 to-rich-black-900 border-rich-black-700">
                    <CardContent className="p-6">
                        <h2 className="text-2xl font-bold text-gold-400 mb-6">Revenue by Institution</h2>

                        {institutions.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-rich-black-400">No institutions found. Please set up institutions first.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {institutions.map((institution) => {
                                    const metrics = institutionMetrics[institution._id]
                                    const isExpanded = expandedInstitution === institution._id

                                    return (
                                        <motion.div
                                            key={institution._id}
                                            initial={false}
                                            animate={{ backgroundColor: isExpanded ? 'rgba(212, 175, 55, 0.05)' : 'rgba(0, 0, 0, 0)' }}
                                            transition={{ duration: 0.3 }}
                                            className="border border-rich-black-700 rounded-lg overflow-hidden"
                                        >
                                            {/* Header */}
                                            <button
                                                onClick={() => setExpandedInstitution(isExpanded ? null : institution._id)}
                                                className="w-full p-4 flex items-center justify-between hover:bg-rich-black-800/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="w-3 h-3 rounded-full bg-gold-500/50"></div>
                                                    <div className="text-left">
                                                        <h3 className="font-bold text-gold-100">{institution.name}</h3>
                                                        <p className="text-xs text-rich-black-400">{institution.code}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-8 text-right">
                                                    <div>
                                                        <p className="text-gold-400 font-bold text-lg">
                                                            {metrics.revenue.toLocaleString('en-EG')} EGP
                                                        </p>
                                                        <p className="text-xs text-rich-black-400">{metrics.ordersCount} orders</p>
                                                    </div>
                                                    <motion.div
                                                        animate={{ rotate: isExpanded ? 180 : 0 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <ChevronDown className="text-rich-black-500" size={20} />
                                                    </motion.div>
                                                </div>
                                            </button>

                                            {/* Expanded Content */}
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{
                                                    height: isExpanded ? 'auto' : 0,
                                                    opacity: isExpanded ? 1 : 0
                                                }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-4 border-t border-rich-black-700 bg-rich-black-900/30 space-y-4">
                                                    {/* Top Drinks */}
                                                    <div>
                                                        <h4 className="text-sm font-bold text-gold-300 mb-3 flex items-center gap-2">
                                                            <Zap size={16} />
                                                            Top Selling Drinks
                                                        </h4>
                                                        {Object.keys(metrics.topDrinks).length === 0 ? (
                                                            <p className="text-xs text-rich-black-400">No orders for this institution yet.</p>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                {Object.entries(metrics.topDrinks)
                                                                    .map(([drinkName, data]) => ({ name: drinkName, ...data }))
                                                                    .sort((a, b) => b.revenue - a.revenue)
                                                                    .slice(0, 5)
                                                                    .map((drink, idx) => (
                                                                        <div key={idx} className="flex items-center justify-between p-2 bg-rich-black-800/50 rounded border border-rich-black-700">
                                                                            <div>
                                                                                <p className="text-sm text-gold-100">{drink.name}</p>
                                                                                <p className="text-xs text-rich-black-400">{drink.quantity} sold</p>
                                                                            </div>
                                                                            <p className="font-bold text-emerald-400">
                                                                                {drink.revenue.toLocaleString('en-EG')} EGP
                                                                            </p>
                                                                        </div>
                                                                    ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Top Selling Drinks Overall */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
            >
                <Card className="bg-gradient-to-br from-rich-black-800 to-rich-black-900 border-rich-black-700">
                    <CardContent className="p-6">
                        <h2 className="text-2xl font-bold text-gold-400 mb-6">Top Selling Drinks (All Institutions)</h2>

                        <div className="space-y-3">
                            {topDrinksOverall.map((drink, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="flex items-center gap-4 p-4 bg-rich-black-800/50 rounded-lg border border-rich-black-700 hover:border-gold-500/30 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center font-bold text-gold-400">
                                        #{idx + 1}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gold-100">{drink.name}</h4>
                                        <p className="text-xs text-rich-black-400">{drink.quantity} units sold</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-emerald-400">{drink.revenue.toLocaleString('en-EG')} EGP</p>
                                        <p className="text-xs text-rich-black-400">Total revenue</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Orders Status Distribution */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
            >
                <Card className="bg-gradient-to-br from-rich-black-800 to-rich-black-900 border-rich-black-700">
                    <CardContent className="p-6">
                        <h2 className="text-2xl font-bold text-gold-400 mb-6">Orders Status Distribution</h2>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(orderStatusDistribution)
                                .sort(([, a], [, b]) => b - a)
                                .map(([status, count], idx) => {
                                    const colors = STATUS_COLORS[status] || STATUS_COLORS.pending
                                    return (
                                        <motion.div
                                            key={status}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}
                                        >
                                            <p className={`font-bold text-2xl ${colors.text}`}>{count}</p>
                                            <p className="text-xs text-rich-black-400 mt-2 capitalize">
                                                {status.replace(/_/g, ' ')}
                                            </p>
                                            <div className="mt-2 h-1 bg-rich-black-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    className={`h-full ${colors.text}`}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(count / totalOrders) * 100}%` }}
                                                    transition={{ delay: idx * 0.1 + 0.3, duration: 0.5 }}
                                                />
                                            </div>
                                        </motion.div>
                                    )
                                })}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Recent Orders Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
            >
                <Card className="bg-gradient-to-br from-rich-black-800 to-rich-black-900 border-rich-black-700 overflow-hidden">
                    <CardContent className="p-0">
                        <div className="p-6 border-b border-rich-black-700">
                            <h2 className="text-2xl font-bold text-gold-400">Recent Orders</h2>
                        </div>

                        {filteredOrders.length === 0 ? (
                            <div className="p-12 text-center">
                                <p className="text-rich-black-400">No orders found for the selected period.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-rich-black-700 bg-rich-black-900/50">
                                            <th className="px-6 py-3 text-left text-xs font-bold text-rich-black-400 uppercase">Order #</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-rich-black-400 uppercase">Institution</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-rich-black-400 uppercase">Items</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-rich-black-400 uppercase">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-rich-black-400 uppercase">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-rich-black-400 uppercase">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders
                                            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                            .slice(0, 10)
                                            .map((order, idx) => {
                                                const institution = institutions.find(i => i._id === order.institutionId)
                                                const colors = STATUS_COLORS[order.status] || STATUS_COLORS.pending

                                                return (
                                                    <motion.tr
                                                        key={order._id}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        className="border-b border-rich-black-700 hover:bg-rich-black-800/30 transition-colors"
                                                    >
                                                        <td className="px-6 py-4 text-sm font-bold text-gold-400">#{order.orderNumber}</td>
                                                        <td className="px-6 py-4 text-sm text-gold-100">{institution?.name || 'Unknown'}</td>
                                                        <td className="px-6 py-4 text-sm text-rich-black-300">{order.items.length} items</td>
                                                        <td className="px-6 py-4 text-sm font-bold text-emerald-400">
                                                            {order.totalPrice.toLocaleString('en-EG')} EGP
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Badge
                                                                className={`capitalize ${colors.bg} ${colors.text} border ${colors.border}`}
                                                            >
                                                                {order.status.replace(/_/g, ' ')}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-rich-black-400">
                                                            {new Date(order.createdAt).toLocaleDateString('en-EG')}
                                                        </td>
                                                    </motion.tr>
                                                )
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
