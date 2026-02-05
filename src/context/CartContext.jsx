"use client"
import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
    const [items, setItems] = useState([])
    const [isOpen, setIsOpen] = useState(false)

    // Load from local storage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
            setItems(JSON.parse(savedCart))
        }
    }, [])

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items))
    }, [items])

    const addToCart = (product, size, customizations, price) => {
        setItems(prev => {
            // Check if identical item exists
            const existing = prev.find(item =>
                item._id === product._id &&
                item.selectedSize === size &&
                JSON.stringify(item.customizations) === JSON.stringify(customizations)
            )

            if (existing) {
                return prev.map(item =>
                    item === existing
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            }

            return [...prev, {
                ...product,
                selectedSize: size,
                customizations,
                price, // Unit price for this configuration
                quantity: 1,
                cartId: Date.now() + Math.random() // Unique ID for cart operations
            }]
        })
        setIsOpen(true) // Open cart when item added
    }

    const removeFromCart = (cartId) => {
        setItems(prev => prev.filter(item => item.cartId !== cartId))
    }

    const updateQuantity = (cartId, delta) => {
        setItems(prev => prev.map(item => {
            if (item.cartId === cartId) {
                const newQty = Math.max(1, item.quantity + delta)
                return { ...item, quantity: newQty }
            }
            return item
        }))
    }

    const clearCart = () => setItems([])

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            total,
            isOpen,
            setIsOpen
        }}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => useContext(CartContext)
