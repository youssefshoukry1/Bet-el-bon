"use client"
import { useQuery } from '@tanstack/react-query'
import { fetchInstitutions } from '@/lib/api'
import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Building2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function InstitutionSelector({ isOpen, onClose, onSelect }) {
    const { data: institutions = [], isLoading } = useQuery({
        queryKey: ['institutions'],
        queryFn: fetchInstitutions
    })

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Select Location">
            <div className="p-4">
                <p className="text-rich-black-300 text-sm mb-4">Please select which branch you are ordering from.</p>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                    {isLoading ? <div className="text-center py-4">Loading branches...</div> : institutions.map(inst => (
                        <button
                            key={inst._id}
                            onClick={() => onSelect(inst)}
                            className="w-full flex items-center p-4 rounded-xl border border-rich-black-700 bg-rich-black-800/50 hover:bg-rich-black-800 transition-colors group"
                        >
                            <div className="w-10 h-10 rounded-full bg-rich-black-700 flex items-center justify-center mr-4 group-hover:bg-gold-500 group-hover:text-rich-black-900 transition-colors">
                                <Building2 size={20} />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-gold-100 group-hover:text-white">{inst.name}</h3>
                                <p className="text-xs text-rich-black-400">{inst.code}</p>
                            </div>
                        </button>
                    ))}
                    {institutions.length === 0 && !isLoading && (
                        <div className="text-center text-rich-black-400">No branches found.</div>
                    )}
                </div>
            </div>
        </Modal>
    )
}
