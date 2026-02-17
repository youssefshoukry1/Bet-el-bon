"use client"
import { useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import { motion } from 'framer-motion'
import { Check, Clock, Coffee, ChefHat, Banknote, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useLanguage } from '@/context/LanguageContext'
import { fetchOrderById } from '@/lib/api'

export default function OrderStatusPage() {
    const { t } = useLanguage()
    const { id } = useParams()

    const { data: order, isLoading } = useQuery({
        queryKey: ['order', id],
        queryFn: () => fetchOrderById(id),
        refetchInterval: 3000,
        enabled: !!id
    })

    // If loading or not found yet
    if (isLoading || !order) return <div className="min-h-screen text-center pt-20 text-gold-400">{t('orderStatus.loading')}</div>

    // Define KITCHEN_STEPS inside component to use i18n
    const KITCHEN_STEPS = [
        { id: 'pending', labelKey: 'orderStatus.orderPlaced', icon: Clock },
        { id: 'ready', labelKey: 'orderStatus.readyToServe', icon: Coffee },
    ]

    const currentStatus = order.status || 'pending'

    // Calculate visual step
    let activeStepIndex = -1
    // Map 'paid' to 'pending' for visual consistency in the stepper
    if (['paid', 'pending'].includes(currentStatus)) activeStepIndex = 0
    else if (currentStatus === 'ready' || currentStatus === 'completed') activeStepIndex = 1

    const isWaitingForCash = currentStatus === 'waiting_for_cash'

    return (
        <div className="max-w-xl mx-auto py-12 text-center px-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
            >
                <div className="mb-8">
                    <h1 className="text-3xl md:text-5xl font-amiri font-bold text-gold-100 mb-2">{t('orders.orderNumber', { number: order.orderNumber })}</h1>
                    <p className="text-rich-black-300">
                        {isWaitingForCash ? t('orderStatus.actionRequired') : t('orderStatus.thankYou')}
                    </p>
                </div>

                <Card className={`border-2 ${isWaitingForCash ? 'border-amber-500 shadow-amber-900/20' : 'border-gold-500/30 shadow-gold-900/10'} shadow-2xl`}>
                    <CardContent className="pt-8 pb-8">

                        {/* Special UI for Waiting for Cash */}
                        {isWaitingForCash ? (
                            <div className="flex flex-col items-center animate-pulse">
                                <div className="w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center mb-6 text-amber-500">
                                    <Banknote size={48} strokeWidth={1.5} />
                                </div>
                                <h2 className="text-2xl font-bold text-amber-500 mb-2">{t('orderStatus.paymentRequired')}</h2>
                                <p className="text-rich-black-300 mb-6 max-w-xs mx-auto">
                                    {t('orderStatus.proceedCashPoint')} <strong>{order.totalPrice} EGP</strong>.
                                </p>
                                <div className="bg-rich-black-950 px-6 py-3 rounded-lg border border-rich-black-800">
                                    <span className="text-sm text-rich-black-400 uppercase tracking-widest">{t('orderStatus.yourNumber')}</span>
                                    <div className="text-4xl font-mono font-bold text-white mt-1">{order.orderNumber}</div>
                                </div>
                            </div>
                        ) : (
                            /* Normal Kitchen Stepper */
                            <>
                                {/* 🔹 Payment Status Indicators for Paymob */}
                                {order.paymentMethod === 'paymob' && (
                                    <div className="mb-8">
                                        {order.paymentStatus === 'paid' && (
                                            <div className="bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-emerald-900/10">
                                                <div className="bg-emerald-500/20 p-2 rounded-full">
                                                    <CheckCircle2 size={24} />
                                                </div>
                                                <div className="text-left gap-2 flex flex-col">
                                                    <h3 className="font-bold text-lg leading-tight">{t('orderStatus.paymentSuccessful')}</h3>
                                                    <p className="text-xs text-emerald-300/80">{t('orderStatus.electronicPaymentConfirmed')}</p>
                                                </div>
                                            </div>
                                        )}
                                        {order.paymentStatus === 'unpaid' && currentStatus === 'awaiting_payment' && (
                                            <div className="bg-amber-950/30 border border-amber-500/30 text-amber-500 p-4 rounded-xl flex items-center justify-center gap-3">
                                                <AlertCircle size={24} />
                                                <h3 className="font-bold text-lg">{t('orderStatus.paymentProcessing')}</h3>
                                            </div>
                                        )}
                                        {order.paymentStatus === 'failed' && (
                                            <div className="bg-red-950/30 border border-red-500/30 text-red-500 p-4 rounded-xl flex items-center justify-center gap-3">
                                                <AlertCircle size={24} />
                                                <h3 className="font-bold text-lg">{t('orderStatus.paymentFailed')}</h3>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="relative flex justify-between items-center mb-12 px-4">
                                    {/* Connecting Line */}
                                    <div className="absolute top-1/2 left-0 w-full h-1 bg-rich-black-800 -z-10 -translate-y-1/2" />
                                    <div
                                        className="absolute top-1/2 left-0 h-1 bg-gold-500 -z-10 -translate-y-1/2 transition-all duration-1000 ease-in-out"
                                        style={{ width: `${(Math.max(0, activeStepIndex) / (KITCHEN_STEPS.length - 1)) * 100}%` }}
                                    />

                                    {KITCHEN_STEPS.map((step, index) => {
                                        const isCompleted = index <= activeStepIndex
                                        const isCurrent = index === activeStepIndex
                                        const Icon = step.icon

                                        return (
                                            <div key={step.id} className="flex flex-col items-center gap-2 relative">
                                                <div className={`
                                                w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center border-4 transition-all duration-500 bg-rich-black-900 z-10
                                                ${isCompleted ? 'border-gold-500 text-gold-500' : 'border-rich-black-700 text-rich-black-700'}
                                                ${isCurrent ? 'scale-110 shadow-[0_0_20px_rgba(212,175,55,0.4)]' : ''}
                                            `}>
                                                    <Icon size={index === activeStepIndex ? 24 : 18} />
                                                </div>
                                                <span className={`text-[10px] md:text-xs font-bold transition-colors absolute -bottom-6 w-24 ${isCompleted ? 'text-gold-200' : 'text-rich-black-600'}`}>
                                                    {t(step.labelKey)}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>

                                <div className="bg-rich-black-950/50 rounded-xl p-6 border border-rich-black-800/50 mt-8">
                                    {(currentStatus === 'pending' || currentStatus === 'paid') && (
                                        <p className="text-gold-200 animate-pulse flex items-center justify-center gap-2">
                                            <Clock size={18} /> {t('orderStatus.waitingForKitchen')}
                                        </p>
                                    )}
                                    {currentStatus === 'ready' && (
                                        <div className="text-emerald-400 flex flex-col items-center">
                                            <Check size={48} className="mb-2" />
                                            <h3 className="text-xl font-bold">{t('orderStatus.orderReady')}</h3>
                                            <p className="text-sm opacity-80">{t('orderStatus.pickupCounter')}</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
