"use client"
import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useCart } from '@/context/CartContext'
import { Coffee, Check, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

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
                {/* Size Selection */}
                <div>
                    <label className="block text-sm font-medium text-rich-black-300 mb-3 tracking-wide uppercase text-xs">Size</label>
                    <div className="grid grid-cols-3 gap-3">
                        {product.sizes.map((s) => (
                            <button
                                key={s.size}
                                onClick={() => setSize(s.size)}
                                className={cn(
                                    "relative overflow-hidden flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 group",
                                    size === s.size
                                        ? "border-gold-500 bg-gold-500/10 text-gold-100 shadow-[0_0_10px_rgba(212,175,55,0.1)]"
                                        : "border-rich-black-700 bg-rich-black-800/50 text-rich-black-400 hover:bg-rich-black-800 hover:border-rich-black-600"
                                )}
                            >
                                <Coffee size={size === 'small' ? 20 : size === 'medium' ? 24 : 28}
                                    className={cn("mb-2 transition-transform duration-300", size === s.size && "scale-110 text-gold-400")}
                                />
                                <span className="capitalize font-bold text-sm">{s.size}</span>
                                <span className="text-xs mt-1 opacity-70 group-hover:opacity-100 transition-opacity">{s.price} EGP</span>

                                {size === s.size && (
                                    <motion.div
                                        layoutId="activeSize"
                                        className="absolute inset-0 border-2 border-gold-500 rounded-xl pointer-events-none"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Customizations */}
                <div>
                    <label className="block text-sm font-medium text-rich-black-300 mb-3 tracking-wide uppercase text-xs">Customizations</label>
                    <div className="space-y-4">
                        {/* Spiced Option */}
                        {product.options?.spiced && (
                            <div
                                onClick={() => setCustomizations(prev => ({ ...prev, spiced: !prev.spiced }))}
                                className={cn(
                                    "flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer",
                                    customizations.spiced
                                        ? "bg-amber-900/20 border-amber-500/50"
                                        : "bg-rich-black-800/30 border-rich-black-700 hover:bg-rich-black-800/50"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn("p-2 rounded-full", customizations.spiced ? "bg-amber-500/20 text-amber-500" : "bg-rich-black-800 text-rich-black-500")}>
                                        <Flame size={20} />
                                    </div>
                                    <div>
                                        <span className={cn("block font-bold", customizations.spiced ? "text-amber-100" : "text-rich-black-300")}>Spiced (Mahweja)</span>
                                        <span className="text-xs text-rich-black-500">Add traditional spices</span>
                                    </div>
                                </div>
                                <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                    customizations.spiced ? "bg-amber-500 border-amber-500 text-rich-black-900" : "border-rich-black-600"
                                )}>
                                    {customizations.spiced && <Check size={14} strokeWidth={4} />}
                                </div>
                            </div>
                        )}

                        {/* Sugar Options */}
                        {product.options?.sugar && (
                            <div className="space-y-3">
                                <span className="text-xs uppercase text-rich-black-400 font-bold tracking-wider">Sugar Level</span>
                                <div className="grid grid-cols-4 gap-2">
                                    {sugarOptions.map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setCustomizations(prev => ({ ...prev, sugar: opt.id }))}
                                            className={cn(
                                                "py-3 px-1 text-[11px] md:text-xs rounded-lg border transition-all flex flex-col items-center gap-1",
                                                customizations.sugar === opt.id
                                                    ? "bg-gold-500 text-rich-black-900 border-gold-500 font-bold shadow-sm"
                                                    : "bg-rich-black-800/30 border-rich-black-700 text-rich-black-400 hover:bg-rich-black-800"
                                            )}
                                        >
                                            {customizations.sugar === opt.id && <Check size={12} className="mb-0.5" />}
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
