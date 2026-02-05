"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const pathname = usePathname();
  const { setIsOpen, items } = useCart()
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0)
  const [activeOrderId, setActiveOrderId] = React.useState(null)

  React.useEffect(() => {
    // Check for active order ID in local storage
    const storedId = localStorage.getItem('activeOrderId')
    if (storedId) setActiveOrderId(storedId)
  }, [pathname]) // Re-check on navigation changes

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-rich-black-800 bg-rich-black-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo area - simple text for now, should replace with Image if needed */}
        <Link href="/" className="flex items-center gap-2">
          <h1 className="font-amiri text-2xl font-bold text-gold-400">بيت البن</h1>
        </Link>

        <div className='flex items-center gap-6'>
          <Link href="/" className={cn("nav-link", pathname === '/' && "active-link")}>Menu</Link>
          {activeOrderId && (
            <Link href={`/order/${activeOrderId}`} className={cn("nav-link", pathname.includes('/order') && "active-link")}>
              Track Order
            </Link>
          )}

          {/* Cart Trigger */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative p-2 text-gold-400 hover:bg-rich-black-800 rounded-full transition-colors"
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

