"use client"
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { FileText, Coffee } from 'lucide-react'

export default function AdminPage({ children }) {
    return (
        <div className="space-y-6">
            <div className="flex gap-4 border-b border-rich-black-800 pb-4">
                <Link href="/admin">
                    <Button variant="outline" className="flex items-center gap-2">
                        <Coffee size={18} /> Menu Management
                    </Button>
                </Link>
                <Link href="/admin/orders">
                    <Button variant="outline" className="flex items-center gap-2 bg-gold-500 text-rich-black-900 border-gold-500 hover:bg-gold-600">
                        <FileText size={18} /> Manage Orders
                    </Button>
                </Link>
            </div>
            {children}
        </div>
    )
}
