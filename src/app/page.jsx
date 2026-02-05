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
      <section className="text-center py-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-gold-400 text-lg uppercase tracking-widest font-bold mb-2">Welcome to</h2>
          <h1 className="text-5xl md:text-7xl font-amiri font-bold text-gold-100 mb-6 drop-shadow-lg">
            Bayt Al-Bunn
          </h1>
          <p className="text-rich-black-300 max-w-lg mx-auto text-lg">
            Experience the authentic taste of coffee, brewed with passion and tradition since 1919.
          </p>
        </motion.div>
      </section>

      {/* Categories */}
      <section className="sticky top-20 z-30 bg-rich-black-950/90 py-4 backdrop-blur-md -mx-4 px-4 border-b border-rich-black-800 flex overflow-x-auto gap-3 justify-center md:justify-center">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`
                        px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap
                        ${selectedCategory === cat.id
                ? 'bg-gold-400 text-rich-black-900 shadow-gold-400/20 shadow-lg'
                : 'bg-rich-black-800 text-rich-black-300 hover:text-gold-200 hover:bg-rich-black-700'}
                    `}
          >
            {cat.label}
          </button>
        ))}
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
