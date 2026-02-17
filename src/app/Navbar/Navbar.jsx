"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { ShoppingBag, Globe } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useLanguage } from '@/context/LanguageContext'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const pathname = usePathname();
  const { setIsOpen, items } = useCart()
  const { t, language, setLanguage, isRTL } = useLanguage()
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0)
  const [hasOrders, setHasOrders] = React.useState(false)
  const [isLangOpen, setIsLangOpen] = React.useState(false)

  React.useEffect(() => {
    // Check for active orders list
    const storedOrders = JSON.parse(localStorage.getItem('myOrders') || '[]')
    setHasOrders(storedOrders.length > 0)
  }, [pathname]) // Re-check on navigation changes

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-rich-black-800 bg-rich-black-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo area - simple text for now, should replace with Image if needed */}
        <Link href="/" className="flex items-center gap-2">
          <h1 className="font-amiri text-2xl font-bold text-gold-400">بيت البن</h1>
        </Link>

        <div className='flex items-center gap-6'>
          <Link href="/" className={cn("nav-link", pathname === '/' && "active-link")}>{t('nav.menu')}</Link>
          {hasOrders && (
            <Link href="/orders" className={cn("nav-link", pathname.startsWith('/order') && "active-link")}>
              {t('nav.myOrders')}
            </Link>
          )}

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 p-2 text-gold-400 hover:bg-rich-black-800 rounded-full transition-colors"
              title="Switch Language"
            >
              <Globe size={20} />
              <span className="text-sm font-semibold uppercase">{language}</span>
            </button>

            {isLangOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`absolute top-full mt-2 bg-rich-black-900 border border-rich-black-700 rounded-lg shadow-lg overflow-hidden min-w-40 ${isRTL ? 'right-0' : 'left-0'}`}
              >
                <button
                  onClick={() => {
                    setLanguage('en')
                    setIsLangOpen(false)
                  }}
                  className={cn(
                    "w-full px-4 py-3 text-left text-sm hover:bg-rich-black-800 transition-colors flex items-center gap-2",
                    language === 'en' && 'bg-gold-500/20 text-gold-400 font-bold'
                  )}
                >
                  <span className="text-lg">🇺🇸</span>
                  {t('nav.langEn')}
                </button>
                <button
                  onClick={() => {
                    setLanguage('ar')
                    setIsLangOpen(false)
                  }}
                  className={cn(
                    "w-full px-4 py-3 text-left text-sm hover:bg-rich-black-800 transition-colors flex items-center gap-2",
                    language === 'ar' && 'bg-gold-500/20 text-gold-400 font-bold'
                  )}
                >
                  <span className="text-lg">🇸🇦</span>
                  {t('nav.langAr')}
                </button>
              </motion.div>
            )}
          </div>

          {/* Cart Trigger */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative p-2 text-gold-400 hover:bg-rich-black-800 rounded-full transition-colors"
            title={t('cart.title')}
          >
            <ShoppingBag size={24} />
            {itemCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                key={itemCount}
                className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full"
              >
                {itemCount}
              </motion.span>
            )}
          </button>
        </div>
      </div>
    </nav>
  )
}
