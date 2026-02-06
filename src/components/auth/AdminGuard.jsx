"use client"
import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Lock } from 'lucide-react'
import api from '@/lib/api'

export function AdminGuard({ children, level = 'admin' }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        const checkAuth = async () => {
            // Check localStorage
            const storedAuth = localStorage.getItem(`${level}Auth`) // 'adminAuth' or 'ownerAuth'
            if (storedAuth === 'true') {
                setIsAuthenticated(true)
            }
            setIsLoading(false)
        }
        checkAuth()
    }, [level])

    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')

        try {
            const { data } = await api.post(`/settings/verify`, {
                password,
                type: level
            })

            if (data.success) {
                localStorage.setItem(`${level}Auth`, 'true')
                setIsAuthenticated(true)
            }
        } catch (err) {
            setError('Invalid Password')
        }
    }

    if (isLoading) return null

    if (isAuthenticated) {
        return <>{children}</>
    }

    return (
        <div className="fixed inset-0 z-[100] bg-rich-black-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-rich-black-900 border border-rich-black-800 p-8 rounded-2xl shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center text-gold-500 mb-4">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-2xl font-amiri font-bold text-gold-100">
                        {level === 'owner' ? 'Owner Access' : 'Admin Access'}
                    </h1>
                    <p className="text-rich-black-400 text-sm mt-2 text-center">
                        This area is protected. Please enter your password.
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter Password"
                            className="w-full bg-rich-black-950 border border-rich-black-700 rounded-lg p-4 text-center text-xl tracking-widest text-gold-100 focus:outline-none focus:border-gold-500 transition-colors"
                            autoFocus
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <Button className="w-full h-12 text-lg font-bold">
                        Unlock
                    </Button>
                </form>
            </div>
        </div>
    )
}
