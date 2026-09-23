"use client"
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useLanguage } from '@/context/LanguageContext'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

export function CartSidebar() {
    const { items, isOpen, setIsOpen, removeFromCart, updateQuantity, total } = useCart()
    const { t, isRTL } = useLanguage()
    const router = useRouter()

    const handleCheckout = () => {
        setIsOpen(false)
        router.push('/checkout')
    }

    const getSizeLabel = (size) => {
        if (!size) return ''
        const sizeMap = {
            small: 'product.small',
            medium: 'product.medium',
            large: 'product.large'
        }
        return t(sizeMap[size.toLowerCase()] || size)
    }

    const getSugarLabel = (sugar) => {
        if (!sugar || sugar === 'no_sugar') return null
        const sugarMap = {
            '1_shot': 'product.1Shot',
            '2_shots': 'product.2Shots',
            '3_shots': 'product.3Shots'
        }
        if (sugar === true) return t('product.sugar')
        return t(sugarMap[sugar] || sugar)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 z-50 bg-rich-black-950/80 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-rich-black-800 bg-rich-black-900 shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-rich-black-800">
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="text-gold-400" />
                                <h2 className="text-xl font-amiri font-bold text-gold-100">{t('cart.yourOrder')}</h2>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-full hover:bg-rich-black-800 transition-colors text-rich-black-400 hover:text-gold-400"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-rich-black-400 opacity-60">
                                    <ShoppingBag size={64} className="mb-4" />
                                    <p>{t('cart.empty')}</p>
                                </div>
                            ) : (
                                items.map((item) => {
                                    const sizeText = getSizeLabel(item.selectedSize)
                                    const sugarText = getSugarLabel(item.customizations?.sugar)
                                    const spicedText = item.customizations?.spiced ? t('product.spiced') : null

                                    const detailsList = [sizeText, sugarText, spicedText].filter(Boolean)

                                    return (
                                        <div key={item.cartId} className="flex gap-4 p-4 rounded-xl bg-rich-black-800/50 border border-rich-black-800">
                                            {/* Item Image */}
                                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-rich-black-900 flex-shrink-0">
                                                <img src={item.image || "/api/placeholder/100/100"} alt={item.title} className="w-full h-full object-cover" />
                                            </div>

                                            {/* Item Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-bold text-gold-50 truncate pr-2">{item.title}</h3>
                                                    <span className="text-gold-400 font-amiri font-bold">{item.price * item.quantity} {t('term.egp')}</span>
                                                </div>

                                                {detailsList.length > 0 && (
                                                    <p className="text-xs text-rich-black-300 mb-2">
                                                        {detailsList.join(' • ')}
                                                    </p>
                                                )}

                                                {/* Quantity Controls */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 bg-rich-black-900 rounded-lg p-1">
                                                        <button
                                                            onClick={() => updateQuantity(item.cartId, -1)}
                                                            className="p-1 hover:text-gold-400 disabled:opacity-50"
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="text-sm w-4 text-center font-bold text-gold-100">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.cartId, 1)}
                                                            className="p-1 hover:text-gold-400"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>

                                                    <button
                                                        onClick={() => removeFromCart(item.cartId)}
                                                        className="text-rich-black-500 hover:text-red-500 transition-colors p-1"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        {/* Footer / Total */}
                        {items.length > 0 && (
                            <div className="p-6 border-t border-rich-black-800 bg-rich-black-900">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-rich-black-300">{t('cart.totalAmount')}</span>
                                    <span className="text-3xl font-amiri font-bold text-gold-400">{total} {t('term.egp')}</span>
                                </div>
                                <Button onClick={handleCheckout} size="lg" className="w-full text-lg font-bold shadow-gold-500/20">
                                    {t('cart.proceedCheckout')}
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
