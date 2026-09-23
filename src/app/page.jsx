"use client"
import { useState, useRef, useEffect } from 'react'
import { ProductCard } from '@/components/features/ProductCard'
import { ProductModal } from '@/components/features/ProductModal'
import { useQuery } from '@tanstack/react-query'
import { useLanguage } from '@/context/LanguageContext'
import { fetchDrinks } from '@/lib/api'
import Image from "next/image";

const CATEGORIES = [
  { id: 'all', labelKey: 'category.all' },
  { id: 'coffee', labelKey: 'category.coffee' },
  { id: 'espresso', labelKey: 'category.espresso' },
  { id: 'cappuccino', labelKey: 'category.cappuccino' },
  { id: 'tea', labelKey: 'category.tea' },
]

export default function Home() {
  const { t } = useLanguage()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const touchStartX = useRef(null)
  const videoRef = useRef(null)

  // Control video playback based on active slide
  useEffect(() => {
    if (videoRef.current) {
      if (currentSlide === 0) {
        videoRef.current.play().catch(() => {})
      } else {
        videoRef.current.pause()
      }
    }
  }, [currentSlide])

  // Touch swipe handling
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) {
      setCurrentSlide(prev => (prev === 0 ? 1 : 0))
    }
    touchStartX.current = null
  }

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
        {t('error.failedLoadMenu')}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-rich-black-800/60 bg-rich-black-900/40 shadow-2xl select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative w-full aspect-[16/9] sm:aspect-[2.2/1] md:aspect-[2.5/1] max-h-[380px] overflow-hidden">
          {/* Slides Track */}
          <div
            className="flex w-full h-full transition-transform duration-500 ease-out will-change-transform"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {/* Slide 0: Video */}
            <div className="relative min-w-full h-full shrink-0">
              <video
                ref={videoRef}
                src="https://res.cloudinary.com/dgksfb9g4/video/upload/v1790127426/gemini_generated_video_beb4a8b6_ojq8rc.mp4"
                poster="/betelboon.webp"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Slide 1: Image */}
            <div className="relative min-w-full h-full shrink-0">
              <Image
                src="/betelboon.webp"
                alt="Bayt Al-Bunn"
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
              />
            </div>
          </div>

          {/* Subtle lighting vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-rich-black-950/80 via-transparent to-rich-black-950/20 pointer-events-none" />
          {/* Subtle gold accent border line */}
          <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-gold-400/40 to-transparent pointer-events-none" />

          {/* Pagination Indicators */}
          <div className="absolute bottom-3 inset-x-0 flex justify-center items-center gap-2 z-10">
            {[0, 1].map((idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentSlide === idx
                    ? 'w-6 bg-gold-400 shadow-[0_0_8px_rgba(212,175,55,0.6)]'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>
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
              {t(cat.labelKey)}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 min-h-[400px]">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center text-rich-black-400 py-12">
            {t('product.noItems')}
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
