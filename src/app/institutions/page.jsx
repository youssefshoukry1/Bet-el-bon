"use client"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchInstitutions, createInstitution, deleteInstitution } from '@/lib/api'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useState } from 'react'
import { Building2, Plus, Trash2 } from 'lucide-react'
import { AdminGuard } from '@/components/auth/AdminGuard'

export default function AdminInstitutionsPage() {
    return (
        <AdminGuard level="owner">
            <InstitutionsContent />
        </AdminGuard>
    )
}

function InstitutionsContent() {
    const queryClient = useQueryClient()
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [formData, setFormData] = useState({ name: '', code: '' })

    const { data: institutions = [], isLoading } = useQuery({
        queryKey: ['institutions'],
        queryFn: fetchInstitutions
    })

    const createMutation = useMutation({
        mutationFn: createInstitution,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['institutions'] })
            setIsCreateOpen(false)
            setFormData({ name: '', code: '' })
        },
        onError: (err) => alert("Failed: " + err.message)
    })

    const deleteMutation = useMutation({
        mutationFn: deleteInstitution,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['institutions'] })
    })

    const handleSubmit = () => {
        if (!formData.name || !formData.code) return alert('Fill all fields')
        createMutation.mutate(formData)
    }

    if (isLoading) return <div className="p-8 text-gold-400">Loading...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-amiri font-bold text-gold-400">Institutions</h1>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2" size={20} /> Add Branch
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {institutions.map(inst => (
                    <Card key={inst._id} className="border border-rich-black-700">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-rich-black-800 flex items-center justify-center text-gold-400">
                                    <Building2 size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gold-100">{inst.name}</h3>
                                    <p className="text-xs text-rich-black-400 uppercase tracking-widest">{inst.code}</p>
                                </div>
                            </div>
                            <Button
                                variant="danger"
                                size="icon"
                                onClick={() => {
                                    if (confirm(`Delete ${inst.name}?`)) deleteMutation.mutate(inst._id)
                                }}
                            >
                                <Trash2 size={18} />
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Create Modal */}
            <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add New Branch">
                <div className="p-4 space-y-4">
                    <div>
                        <label className="text-sm text-rich-black-400">Branch Name</label>
                        <input
                            className="w-full bg-rich-black-800 p-2 rounded text-white border border-rich-black-700 focus:border-gold-500 outline-none"
                            placeholder="e.g. Main Street Branch"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-sm text-rich-black-400">Branch Code</label>
                        <input
                            className="w-full bg-rich-black-800 p-2 rounded text-white border border-rich-black-700 focus:border-gold-500 outline-none uppercase"
                            placeholder="e.g. MSB01"
                            value={formData.code}
                            onChange={e => setFormData({ ...formData, code: e.target.value })}
                        />
                    </div>

                    <Button onClick={handleSubmit} className="w-full" isLoading={createMutation.isPending}>
                        Create Branch
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
