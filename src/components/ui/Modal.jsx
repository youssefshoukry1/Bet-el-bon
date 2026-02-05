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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-rich-black-950/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg rounded-xl border border-rich-black-700 bg-rich-black-900 shadow-2xl overflow-hidden"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-rich-black-800">
                            <h2 className="text-xl font-amiri text-gold-400">{title}</h2>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-full text-rich-black-400 hover:text-gold-400 hover:bg-rich-black-800 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="max-h-[80vh] overflow-y-auto">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    )
}
