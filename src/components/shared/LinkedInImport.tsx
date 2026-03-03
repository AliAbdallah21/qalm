'use client'

import { useState, useRef } from 'react'
import {
    Linkedin, Upload, CheckCircle, AlertCircle, Loader2,
    Briefcase, GraduationCap, Wrench, Award, Code, ChevronRight,
    FileArchive
} from 'lucide-react'
import type { LinkedInImportPreview } from '@/features/linkedin-import/types'

type ImportStep = 'instructions' | 'upload' | 'preview' | 'done'

export default function LinkedInImport() {
    const [step, setStep] = useState<ImportStep>('instructions')
    const [isUploading, setIsUploading] = useState(false)
    const [isImporting, setIsImporting] = useState(false)
    const [preview, setPreview] = useState<LinkedInImportPreview | null>(null)
    const [importedCounts, setImportedCounts] = useState<Record<string, number> | null>(null)
    const [error, setError] = useState<string | null>(null)
    const fileRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (!file.name.endsWith('.zip')) {
            setError('Please upload a .zip file downloaded from LinkedIn.')
            return
        }

        setIsUploading(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append('file', file)

            const res = await fetch('/api/profile/linkedin-import', {
                method: 'POST',
                body: formData,
            })
            const json = await res.json()

            if (!res.ok) throw new Error(json.error || 'Failed to parse ZIP')

            setPreview(json.data as LinkedInImportPreview)
            setStep('preview')
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Upload failed')
        } finally {
            setIsUploading(false)
        }
    }

    const handleConfirm = async () => {
        if (!preview) return
        setIsImporting(true)
        setError(null)

        try {
            const res = await fetch('/api/profile/linkedin-import', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(preview),
            })
            const json = await res.json()

            if (!res.ok) throw new Error(json.error || 'Import failed')

            setImportedCounts((json.data as { imported: Record<string, number> }).imported)
            setStep('done')
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Import failed')
        } finally {
            setIsImporting(false)
        }
    }

    return (
        <div className="bg-white rounded-2xl border border-blue-100 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500">
                <Linkedin className="w-5 h-5 text-white" />
                <h2 className="text-base font-bold text-white">Import from LinkedIn</h2>
                <span className="ml-auto text-xs text-blue-200 font-medium">Fill your profile in seconds</span>
            </div>

            <div className="p-6 space-y-5">
                {/* ── Step: Instructions ─────────────────────────────────── */}
                {step === 'instructions' && (
                    <div className="space-y-5">
                        <p className="text-sm text-gray-600">
                            Export your LinkedIn data and upload the ZIP here — Qalm will automatically import
                            your experience, education, skills, and certifications.
                        </p>

                        <div className="space-y-3">
                            {[
                                {
                                    num: 1,
                                    text: <>Go to <strong>LinkedIn → Settings → Data privacy → Get a copy of your data</strong></>,
                                },
                                {
                                    num: 2,
                                    text: <>Select <strong>"The works"</strong> or choose individual categories, then click <strong>Request archive</strong></>,
                                },
                                {
                                    num: 3,
                                    text: <>Wait 10–30 minutes. LinkedIn will email you a download link.</>,
                                },
                                {
                                    num: 4,
                                    text: <>Download the <strong>.zip</strong> file and upload it below.</>,
                                },
                            ].map(item => (
                                <div key={item.num} className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                        {item.num}
                                    </div>
                                    <p className="text-sm text-gray-700">{item.text}</p>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setStep('upload')}
                            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                        >
                            I have my ZIP file
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* ── Step: Upload ───────────────────────────────────────── */}
                {step === 'upload' && (
                    <div className="space-y-4">
                        <input
                            ref={fileRef}
                            type="file"
                            accept=".zip"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <button
                            onClick={() => fileRef.current?.click()}
                            disabled={isUploading}
                            className="w-full py-10 border-2 border-dashed border-blue-200 rounded-xl flex flex-col items-center gap-3 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all disabled:opacity-60"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                    <span className="text-sm font-medium">Parsing your LinkedIn data...</span>
                                </>
                            ) : (
                                <>
                                    <FileArchive className="w-8 h-8" />
                                    <span className="text-sm font-medium">Click to upload your LinkedIn ZIP file</span>
                                    <span className="text-xs text-gray-400">Only .zip files accepted</span>
                                </>
                            )}
                        </button>

                        {error && (
                            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <button onClick={() => setStep('instructions')} className="text-sm text-gray-400 hover:text-gray-600 w-full text-center">
                            ← Back
                        </button>
                    </div>
                )}

                {/* ── Step: Preview ──────────────────────────────────────── */}
                {step === 'preview' && preview && (
                    <div className="space-y-5">
                        <p className="text-sm text-gray-600 font-medium">Review what will be imported:</p>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[
                                { icon: Briefcase, label: 'Experiences', count: preview.counts.experiences },
                                { icon: GraduationCap, label: 'Education', count: preview.counts.education },
                                { icon: Wrench, label: 'Skills', count: preview.counts.skills },
                                { icon: Award, label: 'Certificates', count: preview.counts.certifications },
                                { icon: Code, label: 'Projects', count: preview.counts.projects },
                            ].map(item => (
                                <div key={item.label} className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                                    <item.icon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                    <div>
                                        <p className="text-xl font-bold text-gray-900">{item.count}</p>
                                        <p className="text-xs text-gray-500">{item.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {preview.profile && (
                            <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-800">
                                <strong>Profile found:</strong> {preview.profile.firstName} {preview.profile.lastName}
                                {preview.profile.headline && <> · {preview.profile.headline.slice(0, 60)}{preview.profile.headline.length > 60 ? '…' : ''}</>}
                            </div>
                        )}

                        <p className="text-xs text-gray-400">
                            Existing entries will NOT be overwritten. Only new items will be added.
                        </p>

                        {error && (
                            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setStep('upload'); setPreview(null) }}
                                className="px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                            >
                                Upload different file
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={isImporting}
                                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {isImporting ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Importing...</>
                                ) : (
                                    <><Upload className="w-4 h-4" /> Confirm Import</>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Step: Done ─────────────────────────────────────────── */}
                {step === 'done' && importedCounts && (
                    <div className="space-y-5 text-center">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-emerald-600" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Import complete!</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Your LinkedIn data has been added to your profile.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-left">
                            {Object.entries(importedCounts)
                                .filter(([, count]) => count > 0)
                                .map(([key, count]) => (
                                    <div key={key} className="bg-emerald-50 rounded-xl p-3">
                                        <p className="text-xl font-bold text-emerald-700">{count}</p>
                                        <p className="text-xs text-emerald-600 capitalize">{key} added</p>
                                    </div>
                                ))}
                        </div>
                        <p className="text-xs text-gray-400">
                            Scroll down to review and edit your imported data.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
