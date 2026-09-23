"use client"
import { useQuery } from '@tanstack/react-query'
import { fetchInstitutions } from '@/lib/api'
import { Modal } from '@/components/ui/Modal'
import { Building2 } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export function InstitutionSelector({ isOpen, onClose, onSelect }) {
    const { t } = useLanguage()
    const { data: institutions = [], isLoading } = useQuery({
        queryKey: ['institutions'],
        queryFn: fetchInstitutions
    })

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('institution.selectLocation')}>
            <div className="p-4">
                <p className="text-rich-black-300 text-sm mb-4">{t('institution.selectBranchDesc')}</p>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="text-center py-4 text-gold-400">{t('institution.loadingBranches')}</div>
                    ) : (
                        institutions.map(inst => (
                            <button
                                key={inst._id}
                                onClick={() => onSelect(inst)}
                                className="w-full flex items-center p-4 rounded-xl border border-rich-black-700 bg-rich-black-800/50 hover:bg-rich-black-800 transition-colors group text-start"
                            >
                                <div className="w-10 h-10 rounded-full bg-rich-black-700 flex items-center justify-center me-4 group-hover:bg-gold-500 group-hover:text-rich-black-900 transition-colors shrink-0">
                                    <Building2 size={20} />
                                </div>
                                <div className="text-start">
                                    <h3 className="font-bold text-gold-100 group-hover:text-white">{inst.name}</h3>
                                    <p className="text-xs text-rich-black-400">{inst.code}</p>
                                </div>
                            </button>
                        ))
                    )}
                    {institutions.length === 0 && !isLoading && (
                        <div className="text-center text-rich-black-400 py-4">{t('institution.noBranches')}</div>
                    )}
                </div>
            </div>
        </Modal>
    )
}
