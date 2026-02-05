"use client"
import { useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import { motion } from 'framer-motion'
import { Check, Clock, Coffee, ChefHat } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchOrderById } from '@/lib/api'

const STATUS_STEPS = [
    { id: 'pending', label: 'Order Placed', icon: Clock },
    { id: 'preparing', label: 'Preparing', icon: ChefHat },
    { id: 'ready', label: 'Ready to Serve', icon: Coffee },
]

export default function OrderStatusPage() {
    const { id } = useParams()

    const { data: order, isLoading } = useQuery({
        queryKey: ['order', id],
        queryFn: () => fetchOrderById(id),
        refetchInterval: 3000,
        enabled: !!id
    })

    // If loading or not found yet
    if (isLoading || !order) return <div className="min-h-screen text-center pt-20 text-gold-400">Loading Order...</div>

    const currentStatus = order.status || 'pending'
    const currentStepIndex = STATUS_STEPS.findIndex(s => s.id === currentStatus)

    return (
        <div className="max-w-xl mx-auto py-12 text-center">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
            >
                <div className="mb-6">
                    <h1 className="text-3xl font-amiri font-bold text-gold-100 mb-2">Order #{order.orderNumber}</h1>
                    <p className="text-rich-black-300">Thank you for ordering from Bayt Al-Bunn</p>
                </div>

                <Card className="border-gold-500/30 shadow-2xl shadow-gold-900/10">
                    <CardContent className="pt-8">
                        {/* Status Stepper */}
                        <div className="relative flex justify-between items-center mb-12 px-4">
                            {/* Connecting Line */}
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-rich-black-800 -z-10 -translate-y-1/2" />
                            <div
                                className="absolute top-1/2 left-0 h-1 bg-gold-500 -z-10 -translate-y-1/2 transition-all duration-1000 ease-in-out"
                                style={{ width: `${(Math.max(0, currentStepIndex) / (STATUS_STEPS.length - 1)) * 100}%` }}
                            />

                            {STATUS_STEPS.map((step, index) => {
                                const isCompleted = index <= currentStepIndex
                                const isCurrent = index === currentStepIndex
                                const Icon = step.icon

                                return (
                                    <div key={step.id} className="flex flex-col items-center gap-2">
                                        <div className={`
                                        w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500 bg-rich-black-900
                                        ${isCompleted ? 'border-gold-500 text-gold-500' : 'border-rich-black-700 text-rich-black-700'}
                                        ${isCurrent ? 'scale-125 shadow-lg shadow-gold-500/30' : ''}
                                    `}>
                                            <Icon size={20} />
                                        </div>
                                        <span className={`text-xs font-bold transition-colors ${isCompleted ? 'text-gold-200' : 'text-rich-black-600'}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="bg-rich-black-950/50 rounded-lg p-6 mb-4">
                            {currentStatus === 'pending' && (
                                <p className="text-gold-200 animate-pulse">Waiting for kitchen confirmation...</p>
                            )}
                            {currentStatus === 'preparing' && (
                                <p className="text-gold-200 flex items-center justify-center gap-2">
                                    <span className="animate-spin">⏳</span> Barista is brewing your coffee...
                                </p>
                            )}
                            {currentStatus === 'ready' && (
                                <div className="text-emerald-400 flex flex-col items-center">
                                    <Check size={48} className="mb-2" />
                                    <h3 className="text-xl font-bold">Order Ready!</h3>
                                    <p className="text-sm opacity-80">Please pick it up from the counter.</p>
                                </div>
                            )}
                            {currentStatus === 'completed' && (
                                <div className="text-rich-black-400">
                                    <p>Order picked up. Enjoy!</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
