import { cn } from '@/lib/utils'

export function Card({ className, children, ...props }) {
    return (
        <div
            className={cn(
                'rounded-xl border border-rich-black-800 bg-rich-black-900/50 backdrop-blur-sm text-gold-50 shadow-sm',
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

export function CardHeader({ className, children, ...props }) {
    return (
        <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props}>
            {children}
        </div>
    )
}

export function CardTitle({ className, children, ...props }) {
    return (
        <h3
            className={cn(
                'font-amiri text-2xl font-semibold leading-none tracking-tight text-gold-400',
                className
            )}
            {...props}
        >
            {children}
        </h3>
    )
}

export function CardContent({ className, children, ...props }) {
    return (
        <div className={cn('p-6 pt-0', className)} {...props}>
            {children}
        </div>
    )
}

export function CardFooter({ className, children, ...props }) {
    return (
        <div className={cn('flex items-center p-6 pt-0', className)} {...props}>
            {children}
        </div>
    )
}
