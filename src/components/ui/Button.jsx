"use client"
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function Button({
    className,
    variant = 'primary',
    size = 'default',
    children,
    isLoading,
    ...props
}) {
    const variants = {
        primary: 'bg-gold-400 text-rich-black-900 hover:bg-gold-500 shadow-lg shadow-gold-900/20',
        secondary: 'bg-rich-black-800 text-gold-100 hover:bg-rich-black-700 border border-rich-black-700',
        outline: 'border-2 border-gold-400 text-gold-400 hover:bg-gold-400/10',
        ghost: 'text-gold-200 hover:text-gold-400 hover:bg-rich-black-800/50',
        danger: 'bg-red-600 text-white hover:bg-red-700'
    }

    const sizes = {
        sm: 'h-8 px-3 text-sm',
        default: 'h-10 px-4 py-2',
        lg: 'h-12 px-6 text-lg',
        icon: 'h-10 w-10 p-2 flex items-center justify-center'
    }

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
                'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 disabled:pointer-events-none disabled:opacity-50',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading}
            {...props}
        >
            {isLoading ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : null}
            {children}
        </motion.button>
    )
}
