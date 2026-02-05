import { cn } from '@/lib/utils'

export function Badge({ className, variant = 'default', ...props }) {
    const variants = {
        default: 'border-transparent bg-gold-400 text-rich-black-900 hover:bg-gold-500',
        secondary: 'border-transparent bg-rich-black-800 text-gold-100 hover:bg-rich-black-700',
        outline: 'text-gold-400 border-gold-400',
        success: 'border-transparent bg-emerald-600 text-white',
        warning: 'border-transparent bg-amber-500 text-rich-black-900',
    }

    return (
        <div
            className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                variants[variant],
                className
            )}
            {...props}
        />
    )
}
