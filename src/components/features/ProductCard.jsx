"use client"
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export function ProductCard({ product, onSelect }) {
    // Get base price (usually the smallest size)
    const basePrice = product.sizes?.[0]?.price || 0

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
        >
            <Card className="overflow-hidden border-rich-black-800 bg-rich-black-900/40 hover:border-gold-500/50 transition-colors group cursor-pointer" onClick={() => onSelect(product)}>
                <div className="aspect-square relative overflow-hidden bg-rich-black-800">
                    {/* Fallback image if product.image is missing/valid */}
                    <img
                        src={product.image || "/api/placeholder/400/400"}
                        alt={product.title}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-rich-black-950/80 to-transparent opacity-60" />

                    <div className="absolute bottom-3 right-3">
                        <Button size="icon" className="rounded-full h-10 w-10 shadow-lg bg-gold-400 text-rich-black-900 hover:bg-gold-300">
                            <Plus size={20} />
                        </Button>
                    </div>
                </div>
                <CardContent className="p-4">
                    <h3 className="text-lg font-amiri font-bold text-gold-100 mb-1">{product.title}</h3>
                    <p className="text-sm text-rich-black-300 line-clamp-2 mb-3">{product.description}</p>
                    <div className="flex items-center justify-between">
                        <span className="font-sans font-bold text-gold-400 text-lg">
                            {basePrice} EGP
                        </span>
                        <span className="text-xs uppercase tracking-wider text-rich-black-500 font-semibold border border-rich-black-700 px-2 py-1 rounded">
                            {product.coffeeType}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
