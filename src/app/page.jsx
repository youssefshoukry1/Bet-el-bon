"use client"
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ProductCard } from '@/components/features/ProductCard'
import { ProductModal } from '@/components/features/ProductModal'
import { useQuery } from '@tanstack/react-query'
import { fetchDrinks } from '@/lib/api'

const CATEGORIES = [
  { id: 'all', label: 'All Menu' },
  { id: 'coffee', label: 'Coffee' },
  { id: 'espresso', label: 'Espresso' },
  { id: 'cappuccino', label: 'Cappuccino' },
  { id: 'tea', label: 'Tea' },
]

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedProduct, setSelectedProduct] = useState(null)

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['drinks'],
    queryFn: fetchDrinks
  })

  // Filter products based on category
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.coffeeType === selectedCategory)

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-400"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-red-500">
        Failed to load menu. Please try again later.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative text-center py-20 overflow-hidden rounded-3xl -mx-4 md:mx-0">
        <div className="absolute inset-0 bg-gradient-to-br from-rich-black-900 via-rich-black-800 to-gold-900/20 z-0" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 z-0" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 px-4"
        >
          <span className="inline-block py-1 px-3 rounded-full bg-gold-500/10 text-gold-400 text-xs tracking-[0.2em] font-bold uppercase mb-4 border border-gold-500/20 backdrop-blur-sm">
            Est. 1919
          </span>
          <h1 className="text-5xl md:text-8xl font-amiri font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-100 to-gold-400 mb-6 drop-shadow-sm">
            Bayt Al-Bunn
          </h1>
          <p className="text-rich-black-300 max-w-lg mx-auto text-lg/relaxed md:text-xl/relaxed font-light">
            Brewing legacy in every cup. Experience the authentic taste of tradition.
          </p>
        </motion.div>
      </section>

      {/* Categories */}
      <section className="sticky top-[4.5rem] z-30 bg-rich-black-950/80 py-4 backdrop-blur-lg -mx-4 px-4 border-b border-rich-black-800/50">
        <div className="flex overflow-x-auto gap-3 pb-2 [&::-webkit-scrollbar]:hidden mobile-scroll-fade">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`
                px-6 py-2.5 rounded-full font-medium transition-all duration-300 whitespace-nowrap text-sm md:text-base border
                ${selectedCategory === cat.id
                  ? 'bg-gold-500 text-rich-black-900 border-gold-500 shadow-[0_0_15px_rgba(212,175,55,0.3)] transform scale-105'
                  : 'bg-rich-black-900/50 text-rich-black-400 border-rich-black-700 hover:border-gold-500/50 hover:text-gold-200'}
              `}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 min-h-[400px]">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center text-rich-black-400 py-12">
            No items found in this category.
          </div>
        ) : (
          filteredProducts.map(product => (
            <ProductCard
              key={product._id}
              product={product}
              onSelect={() => setSelectedProduct(product)}
            />
          ))
        )}
      </section>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
