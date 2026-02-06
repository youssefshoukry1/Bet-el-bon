"use client"
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export function Modal({ isOpen, onClose, children, title }) {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden'
        else document.body.style.overflow = 'unset'
        return () => { document.body.style.overflow = 'unset' }
    }, [isOpen])

    if (!isOpen) return null

    // Ensure we render only on client
    if (typeof window === 'undefined') return null

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-rich-black-950/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full sm:max-w-lg bg-rich-black-900 border-t sm:border border-rich-black-700 shadow-2xl overflow-hidden rounded-t-3xl sm:rounded-xl max-h-[90vh] sm:max-h-[85vh] flex flex-col"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-rich-black-800 shrink-0">
                            <h2 className="text-xl font-amiri text-gold-400">{title}</h2>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-full text-rich-black-400 hover:text-gold-400 hover:bg-rich-black-800 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-4 sm:p-6 pb-safe-area">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    )
}
