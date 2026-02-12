"use client"
import { useState, useEffect } from 'react'
import { useCart } from '@/context/CartContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Banknote, Smartphone } from 'lucide-react'
import Link from 'next/link'
import { useMutation } from '@tanstack/react-query'
import { createOrder } from '@/lib/api'
import { InstitutionSelector } from '@/components/features/InstitutionSelector'
import { Building2 } from 'lucide-react'

export default function CheckoutPage() {
    const { items, total, clearCart } = useCart()
    const router = useRouter()
    const [tableNumber, setTableNumber] = useState('')
    const [paymentMethod, setPaymentMethod] = useState('cash')
    const [notes, setNotes] = useState('')
    const [selectedInst, setSelectedInst] = useState(null)
    const [isInstModalOpen, setIsInstModalOpen] = useState(false)



    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('selectedInstitution'))
        if (stored) {
            setSelectedInst(stored)
        } else {
            setIsInstModalOpen(true)
        }
    }, [])

    const handleInstSelect = (inst) => {
        setSelectedInst(inst)
        localStorage.setItem('selectedInstitution', JSON.stringify(inst))
        setIsInstModalOpen(false)
    }

    // Mutation for creating order
    const { mutate, isPending } = useMutation({
        mutationFn: createOrder,
        onSuccess: (data) => {
            clearCart()

            // If Paymob payment is required
            if (data.paymentUrl) {
                window.location.href = data.paymentUrl
                return
            }

            // Otherwise (Cash order)
            const orderId = data._id || data.order?._id

            // Persist order ID - Support Multiple Orders
            const existingOrders = JSON.parse(localStorage.getItem('myOrders') || '[]')
            const updatedOrders = [orderId, ...existingOrders]
            localStorage.setItem('myOrders', JSON.stringify(updatedOrders))

            router.push(`/order/${orderId}`)
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
        if (!selectedInst) {
            setIsInstModalOpen(true)
            return
        }

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
            notes,
            institutionId: selectedInst._id
        })
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <Link href="/" className="inline-flex items-center text-gold-400 hover:text-gold-300 mb-4">
                <ArrowLeft size={16} className="mr-2" /> Back to Menu
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-4xl font-amiri font-bold text-gold-100 mb-8">Checkout</h1>

                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    {/* Left Column - Details */}
                    <div className="lg:col-span-2 space-y-6">
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

                        {/* Special Notes */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Special Request</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <label className="block text-sm font-medium text-rich-black-300 mb-2">Add a note for the kitchen</label>
                                <textarea
                                    className="w-full bg-rich-black-950 border border-rich-black-700 rounded-lg p-3 text-gold-100 focus:outline-none focus:border-gold-500 transition-colors h-24 resize-none"
                                    placeholder="Allergies, extra ice, etc..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Actions */}
                    <div className="lg:col-span-1 space-y-6 sticky top-24">
                        {/* Branch Selection */}
                        <Card>
                            <CardHeader className="flex flex-row justify-between items-center pb-2">
                                <CardTitle className="text-base">Pick-up Location</CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => setIsInstModalOpen(true)} className="text-gold-400 h-auto p-0 hover:bg-transparent">
                                    Change
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {selectedInst ? (
                                    <div className="flex items-center gap-3 text-gold-100 bg-rich-black-950 p-3 rounded-lg border border-rich-black-800">
                                        <Building2 className="text-gold-500 shrink-0" size={20} />
                                        <div className="overflow-hidden">
                                            <div className="font-bold truncate">{selectedInst.name}</div>
                                            <div className="text-xs text-rich-black-400 truncate">{selectedInst.code}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-red-400 text-sm">Please select a branch</div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Payment Method */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Payment Method</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setPaymentMethod('cash')}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${paymentMethod === 'cash' ? 'border-gold-500 bg-gold-500/10 text-gold-400' : 'border-rich-black-700 hover:bg-rich-black-800 text-rich-black-400'}`}
                                    >
                                        <Banknote size={20} className="mb-1" />
                                        <span className="font-bold text-sm">Cash</span>
                                    </button>

                                    <button
                                        onClick={() => setPaymentMethod('paymob')}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${paymentMethod === 'paymob' ? 'border-gold-500 bg-gold-500/10 text-gold-400' : 'border-rich-black-700 hover:bg-rich-black-800 text-rich-black-400'}`}
                                    >
                                        <Smartphone size={20} className="mb-1" />
                                        <span className="font-bold text-sm">Paymob</span>
                                    </button>
                                </div>
                            </CardContent>
                        </Card>

                        <Button
                            onClick={handlePlaceOrder}
                            size="lg"
                            className="w-full text-xl font-amiri font-bold h-16 shadow-xl shadow-gold-500/20 animate-pulse hover:animate-none"
                            isLoading={isPending}
                        >
                            Place Order
                        </Button>
                    </div>
                </div>
            </motion.div>

            <InstitutionSelector
                isOpen={isInstModalOpen}
                onClose={() => { if (selectedInst) setIsInstModalOpen(false) }}
                onSelect={handleInstSelect}
            />
        </div>
    )
}
