"use client"
import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Banknote, Smartphone } from 'lucide-react'
import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import { createOrder } from '@/lib/api'

export default function CheckoutPage() {
    const { items, total, clearCart } = useCart()
    const router = useRouter()
    const [tableNumber, setTableNumber] = useState('')
    const [paymentMethod, setPaymentMethod] = useState('cash')
    const [notes, setNotes] = useState('')

    // Mutation for creating order
    const { mutate, isPending } = useMutation({
        mutationFn: createOrder,
        onSuccess: (data) => {
            clearCart()
            // Persist order ID so user can return to track it
            localStorage.setItem('activeOrderId', data._id)
            router.push(`/order/${data._id}`)
        },
        onError: (error) => {
            alert('Failed to place order: ' + (error.response?.data?.message || error.message))
        }
    })

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <h2 className="text-2xl font-amiri text-gold-400 mb-4">Your cart is empty</h2>
                <Link href="/">
                    <Button>Browse Menu</Button>
                </Link>
            </div>
        )
    }

    const handlePlaceOrder = () => {
        // Transform cart items to match backend expectation if needed
        const orderItems = items.map(item => ({
            drinkId: item._id,
            size: item.selectedSize,
            quantity: item.quantity,
            customizations: item.customizations
        }))

        mutate({
            items: orderItems,
            paymentMethod,
            notes
        })
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Link href="/" className="inline-flex items-center text-gold-400 hover:text-gold-300 mb-4">
                <ArrowLeft size={16} className="mr-2" /> Back to Menu
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-4xl font-amiri font-bold text-gold-100 mb-8">Checkout</h1>

                <div className="grid gap-6">
                    {/* Order Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {items.map(item => (
                                <div key={item.cartId} className="flex justify-between items-center text-sm border-b border-rich-black-800 pb-2 last:border-0">
                                    <div>
                                        <div className="font-bold text-gold-50">{item.quantity}x {item.title}</div>
                                        <div className="text-rich-black-400 text-xs">{item.selectedSize}</div>
                                    </div>
                                    <div className="text-gold-200">{item.price * item.quantity} EGP</div>
                                </div>
                            ))}
                            <div className="pt-4 flex justify-between items-center text-xl font-bold text-gold-400 border-t border-rich-black-700">
                                <span>Total</span>
                                <span>{total} EGP</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Table Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Dine-in Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-rich-black-300 mb-1">Special Notes</label>
                                <textarea
                                    className="w-full bg-rich-black-950 border border-rich-black-700 rounded-lg p-3 text-gold-100 focus:outline-none focus:border-gold-500 transition-colors h-24"
                                    placeholder="Any allergies or special requests?"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Method */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Method</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setPaymentMethod('cash')}
                                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${paymentMethod === 'cash' ? 'border-gold-500 bg-gold-500/10 text-gold-400' : 'border-rich-black-700 hover:border-rich-black-600 text-rich-black-400'}`}
                                >
                                    <Banknote size={24} className="mb-2" />
                                    <span className="font-bold">Cash</span>
                                </button>

                                <button
                                    onClick={() => setPaymentMethod('wallet')}
                                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${paymentMethod === 'wallet' ? 'border-gold-500 bg-gold-500/10 text-gold-400' : 'border-rich-black-700 hover:border-rich-black-600 text-rich-black-400'}`}
                                >
                                    <Smartphone size={24} className="mb-2" />
                                    <span className="font-bold">E-Wallet</span>
                                    <span className="text-[10px] opacity-70">VF Cash / InstaPay</span>
                                </button>
                            </div>

                            {paymentMethod === 'wallet' && (
                                <div className="mt-4 p-4 bg-rich-black-950 rounded-lg border border-gold-500/30">
                                    <p className="text-sm text-center text-gold-200 mb-2">Scan to Pay via InstaPay</p>
                                    <div className="w-32 h-32 bg-white mx-auto rounded-lg flex items-center justify-center">
                                        {/* Placeholder QR */}
                                        <span className="text-black font-bold">QR CODE</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Button
                        onClick={handlePlaceOrder}
                        size="lg"
                        className="w-full text-xl font-amiri font-bold h-16 shadow-xl shadow-gold-500/20"
                        isLoading={isPending}
                    >
                        Place Order - {total} EGP
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}
