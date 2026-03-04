import { getFullProfile } from '@/features/profile/queries'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForms from '@/components/shared/ProfileForms'
import LinkedInImport from '@/components/shared/LinkedInImport'
import { UserCircle, Target, ShieldCheck } from 'lucide-react'

export default async function ProfilePage() {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const fullProfile = await getFullProfile(user.id)

    return (
        <div className="space-y-12 animate-in fade-in duration-700 max-w-[1000px] mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border-subtle pb-8">
                <div className="space-y-2">
                    <h1 className="text-5xl font-black tracking-tight text-[var(--text-primary)] italic">
                        Base Profile
                    </h1>
                    <p className="text-text-secondary font-medium text-lg">
                        Define your professional identity for precise neural tailoring.
                    </p>
                </div>

                {/* Profile Completeness Pill */}
                <div className="bg-surface-card rounded-2xl px-6 py-3 flex items-center gap-4 border border-border-subtle shadow-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-accent-blue/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 flex flex-col items-center">
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Integrity Score</span>
                        <div className="flex items-center gap-2">
                            <span className={`text-2xl font-black italic ${fullProfile.completeness_score === 100 ? 'text-success' : 'text-warning'}`}>
                                {fullProfile.completeness_score}%
                            </span>
                            <Target size={18} className={fullProfile.completeness_score === 100 ? 'text-success' : 'text-warning'} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-12">
                {/* LinkedIn Import — shown at top so user can fill profile from LinkedIn first */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center">
                            <ShieldCheck className="text-accent-blue w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-black text-[var(--text-primary)] italic tracking-tight uppercase">Identity Ingestion</h2>
                    </div>
                    <LinkedInImport />
                </section>

                <section className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border)] flex items-center justify-center">
                            <UserCircle className="text-[var(--text-primary)] w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-black text-[var(--text-primary)] italic tracking-tight uppercase">Technical Parameters</h2>
                    </div>
                    <ProfileForms initialData={fullProfile} />
                </section>
            </div>
        </div>
    )
}
