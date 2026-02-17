"use client"
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchDrinks, createDrink, deleteDrink } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Trash2, Plus } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'

import { AdminGuard } from '@/components/auth/AdminGuard'

export default function AdminPage() {
    return (
        <AdminGuard level="owner">
            <MenuContent />
        </AdminGuard>
    )
}

function MenuContent() {
    const queryClient = useQueryClient()
    const { data: drinks = [], isLoading } = useQuery({ queryKey: ['drinks'], queryFn: fetchDrinks })
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isUpdateOpen, setIsUpdateOpen] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priceSmall: '',
        priceMedium: '',
        priceLarge: '',
        coffeeType: 'espresso',
        image: ''
    })
    const [updateId, setUpdateId] = useState(null)

    const deleteMutation = useMutation({
        mutationFn: deleteDrink,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drinks'] }),
        onError: (err) => alert(err.response?.data?.message || err.message)
    })

    const createMutation = useMutation({
        mutationFn: createDrink,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['drinks'] })
            setIsCreateOpen(false)
            setFormData({ title: '', description: '', priceSmall: '', priceMedium: '', priceLarge: '', coffeeType: 'espresso', image: '' })
        },
        onError: (err) => alert(err.response?.data?.message || "Error creating drink: " + err.message)
    })

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const { updateDrink } = await import('@/lib/api');
            return updateDrink(id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['drinks'] });
            setIsUpdateOpen(false);
            setFormData({ title: '', description: '', priceSmall: '', priceMedium: '', priceLarge: '', coffeeType: 'espresso', image: '' });
            setUpdateId(null);
        },
        onError: (err) => alert(err.response?.data?.message || "Error updating drink: " + err.message)
    });

    const handleSubmit = () => {
        const payload = {
            title: formData.title,
            description: formData.description,
            coffeeType: formData.coffeeType,
            image: formData.image || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
            sizes: [
                { size: 'small', price: Number(formData.priceSmall) || 0 },
                { size: 'medium', price: Number(formData.priceMedium) || 0 },
                { size: 'large', price: Number(formData.priceLarge) || 0 }
            ],
            options: { sugar: true, spiced: true },
            isAvailable: true
        }
        createMutation.mutate(payload)
    }

    const handleUpdate = () => {
        const payload = {
            title: formData.title,
            description: formData.description,
            coffeeType: formData.coffeeType,
            image: formData.image || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
            sizes: [
                { size: 'small', price: Number(formData.priceSmall) || 0 },
                { size: 'medium', price: Number(formData.priceMedium) || 0 },
                { size: 'large', price: Number(formData.priceLarge) || 0 }
            ],
            options: { sugar: true, spiced: true },
            isAvailable: true
        }
        updateMutation.mutate({ id: updateId, data: payload });
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-amiri font-bold text-gold-400">Menu Management</h1>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2" size={20} /> Add New Drink
                </Button>
            </div>

            <div className="grid gap-4">
                {isLoading ? <div>Loading...</div> : drinks.map(drink => (
                    <Card key={drink._id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                            <img src={drink.image} alt={drink.title} className="w-16 h-16 rounded object-cover" />
                            <div>
                                <h3 className="font-bold text-gold-100">{drink.title}</h3>
                                <p className="text-sm text-rich-black-400">{drink.coffeeType}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                size="icon"
                                onClick={() => {
                                    setIsUpdateOpen(true);
                                    setUpdateId(drink._id);
                                    setFormData({
                                        title: drink.title,
                                        description: drink.description,
                                        priceSmall: drink.sizes.find(s => s.size === 'small')?.price || '',
                                        priceMedium: drink.sizes.find(s => s.size === 'medium')?.price || '',
                                        priceLarge: drink.sizes.find(s => s.size === 'large')?.price || '',
                                        coffeeType: drink.coffeeType,
                                        image: drink.image || ''
                                    });
                                }}
                            >
                                Update
                            </Button>
                            <Button
                                variant="danger"
                                size="icon"
                                onClick={() => {
                                    if (confirm('Delete ' + drink.title + '?')) deleteMutation.mutate(drink._id)
                                }}
                            >
                                <Trash2 size={18} />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Create Modal */}
            <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add New Drink">
                <div className="p-4 space-y-4">
                    <input
                        className="w-full bg-rich-black-800 p-2 rounded text-white"
                        placeholder="Title"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                    <textarea
                        className="w-full bg-rich-black-800 p-2 rounded text-white"
                        placeholder="Description"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />

                    <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                            <label className="text-xs text-rich-black-400">Price (Small)</label>
                            <input
                                className="w-full bg-rich-black-800 p-2 rounded text-white"
                                type="number"
                                value={formData.priceSmall}
                                onChange={e => setFormData({ ...formData, priceSmall: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-rich-black-400">Price (Medium)</label>
                            <input
                                className="w-full bg-rich-black-800 p-2 rounded text-white"
                                type="number"
                                value={formData.priceMedium}
                                onChange={e => setFormData({ ...formData, priceMedium: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-rich-black-400">Price (Large)</label>
                            <input
                                className="w-full bg-rich-black-800 p-2 rounded text-white"
                                type="number"
                                value={formData.priceLarge}
                                onChange={e => setFormData({ ...formData, priceLarge: e.target.value })}
                            />
                        </div>
                    </div>

                    <select
                        className="w-full bg-rich-black-800 p-2 rounded text-white"
                        value={formData.coffeeType}
                        onChange={e => setFormData({ ...formData, coffeeType: e.target.value })}
                    >
                        <option value="espresso">Espresso</option>
                        <option value="cappuccino">Cappuccino</option>
                        <option value="coffee">Coffee</option>
                        <option value="tea">Tea</option>
                    </select>
                    <input
                        className="w-full bg-rich-black-800 p-2 rounded text-white"
                        placeholder="Image URL"
                        value={formData.image}
                        onChange={e => setFormData({ ...formData, image: e.target.value })}
                    />
                    <Button onClick={handleSubmit} className="w-full" isLoading={createMutation.isPending}>
                        Create Drink
                    </Button>
                </div>
            </Modal>

            {/* Update Modal */}
            <Modal isOpen={isUpdateOpen} onClose={() => setIsUpdateOpen(false)} title="Update Drink">
                <div className="p-4 space-y-4">
                    <input
                        className="w-full bg-rich-black-800 p-2 rounded text-white"
                        placeholder="Title"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                    <textarea
                        className="w-full bg-rich-black-800 p-2 rounded text-white"
                        placeholder="Description"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />

                    <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                            <label className="text-xs text-rich-black-400">Price (Small)</label>
                            <input
                                className="w-full bg-rich-black-800 p-2 rounded text-white"
                                type="number"
                                value={formData.priceSmall}
                                onChange={e => setFormData({ ...formData, priceSmall: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-rich-black-400">Price (Medium)</label>
                            <input
                                className="w-full bg-rich-black-800 p-2 rounded text-white"
                                type="number"
                                value={formData.priceMedium}
                                onChange={e => setFormData({ ...formData, priceMedium: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-rich-black-400">Price (Large)</label>
                            <input
                                className="w-full bg-rich-black-800 p-2 rounded text-white"
                                type="number"
                                value={formData.priceLarge}
                                onChange={e => setFormData({ ...formData, priceLarge: e.target.value })}
                            />
                        </div>
                    </div>

                    <select
                        className="w-full bg-rich-black-800 p-2 rounded text-white"
                        value={formData.coffeeType}
                        onChange={e => setFormData({ ...formData, coffeeType: e.target.value })}
                    >
                        <option value="espresso">Espresso</option>
                        <option value="cappuccino">Cappuccino</option>
                        <option value="coffee">Coffee</option>
                        <option value="tea">Tea</option>
                    </select>
                    <input
                        className="w-full bg-rich-black-800 p-2 rounded text-white"
                        placeholder="Image URL"
                        value={formData.image}
                        onChange={e => setFormData({ ...formData, image: e.target.value })}
                    />
                    <Button onClick={handleUpdate} className="w-full" isLoading={updateMutation.isPending}>
                        Update Drink
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
