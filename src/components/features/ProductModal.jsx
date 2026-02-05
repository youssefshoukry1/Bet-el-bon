"use client"
import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useCart } from '@/context/CartContext'
import { Coffee, Check, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ProductModal({ product, isOpen, onClose }) {
    const { addToCart } = useCart()
    const [size, setSize] = useState(null)
    const [customizations, setCustomizations] = useState({
        sugar: 'no_sugar',
        spiced: false
    })

    // Reset state when product changes
    useEffect(() => {
        if (product && product.sizes?.length > 0) {
            setSize(product.sizes[0].size) // Default to first size (usually small)
            setCustomizations({
                // Default to no_sugar as requested, regardless of product options for now, 
                // assuming all sugary drinks allow customization.
                sugar: 'no_sugar',
                spiced: false
            })
        }
    }, [product, isOpen])

    if (!product) return null

    // Calculate dynamic price
    const selectedSizeObj = product.sizes.find(s => s.size === size)
    const basePrice = selectedSizeObj ? selectedSizeObj.price : 0

    const currentPrice = basePrice

    const handleAddToCart = () => {
        addToCart(product, size, customizations, currentPrice)
        onClose()
    }

    const sugarOptions = [
        { id: 'no_sugar', label: 'No Sugar' },
        { id: '1_shot', label: '1 Shot' },
        { id: '2_shots', label: '2 Shots' },
        { id: '3_shots', label: '3 Shots' }
    ]

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={product.title}>
            <div className="p-4 space-y-6">
                {/* Image Header */}
                <div className="relative h-48 rounded-lg overflow-hidden bg-rich-black-800 -mx-4 -mt-4 mb-6">
                    <img
                        src={product.image || "/api/placeholder/600/400"}
                        alt={product.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-rich-black-900 to-transparent" />
                </div>

                {/* Size Selection */}
                <div>
                    <label className="block text-sm font-medium text-rich-black-300 mb-3">Select Size</label>
                    <div className="grid grid-cols-3 gap-3">
                        {product.sizes.map((s) => (
                            <button
                                key={s.size}
                                onClick={() => setSize(s.size)}
                                className={cn(
                                    "flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all",
                                    size === s.size
                                        ? "border-gold-500 bg-gold-500/10 text-gold-400"
                                        : "border-rich-black-700 hover:border-rich-black-500 text-rich-black-400"
                                )}
                            >
                                <Coffee size={size === 'small' ? 16 : size === 'medium' ? 20 : 24} className="mb-2" />
                                <span className="capitalize font-medium">{s.size}</span>
                                <span className="text-xs mt-1 opacity-80">{s.price} EGP</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Customizations */}
                <div>
                    <label className="block text-sm font-medium text-rich-black-300 mb-3">Customizations</label>
                    <div className="space-y-4">
                        {/* Spiced Option */}
                        {product.options?.spiced && (
                            <div
                                onClick={() => setCustomizations(prev => ({ ...prev, spiced: !prev.spiced }))}
                                className="flex items-center justify-between p-3 rounded-lg border border-rich-black-700 hover:bg-rich-black-800 cursor-pointer"
                            >
                                <div className="flex items-center gap-2">
                                    <Flame size={18} className="text-amber-500" />
                                    <span className="text-gold-100">Spiced (Mahweja)</span>
                                </div>
                                <div className={cn("w-6 h-6 rounded-full border flex items-center justify-center transition-colors", customizations.spiced ? "bg-gold-500 border-gold-500 text-rich-black-900" : "border-rich-black-500")}>
                                    {customizations.spiced && <Check size={14} />}
                                </div>
                            </div>
                        )}

                        {/* Sugar Options - Only if product allows sugar */}
                        {product.options?.sugar && (
                            <div className="space-y-2">
                                <span className="text-sm text-gold-200">Sugar Level</span>
                                <div className="grid grid-cols-4 gap-2">
                                    {sugarOptions.map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setCustomizations(prev => ({ ...prev, sugar: opt.id }))}
                                            className={cn(
                                                "py-2 px-1 text-xs rounded border transition-all",
                                                customizations.sugar === opt.id
                                                    ? "bg-gold-500 text-rich-black-900 border-gold-500 font-bold"
                                                    : "border-rich-black-700 text-rich-black-400 hover:border-rich-black-500"
                                            )}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 mt-6 border-t border-rich-black-800 flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-rich-black-400">Total Price</span>
                        <span className="text-2xl font-bold text-gold-400 font-amiri">{currentPrice} EGP</span>
                    </div>
                    <Button onClick={handleAddToCart} size="lg" className="flex-1 font-bold">
                        Add to Cart
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
