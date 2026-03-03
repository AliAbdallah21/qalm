import { getFullProfile } from '@/features/profile/queries'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForms from '@/components/shared/ProfileForms'
import LinkedInImport from '@/components/shared/LinkedInImport'

export default async function ProfilePage() {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const fullProfile = await getFullProfile(user.id)

    return (
        <div className="max-w-4xl mx-auto p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Your Base Profile</h1>
                    <p className="text-sm text-gray-500 mt-2">
                        This information is used by Qalm to automatically tailor applications and CVs.
                        Keep it accurate and comprehensive.
                    </p>
                </div>

                {/* Profile Completeness Pill */}
                <div className="bg-gray-100 rounded-full px-4 py-2 flex items-center gap-2 border border-gray-200">
                    <div className="text-sm font-medium text-gray-700">Completeness</div>
                    <div className={`text-sm font-bold ${fullProfile.completeness_score === 100 ? 'text-green-600' : 'text-amber-600'}`}>
                        {fullProfile.completeness_score}%
                    </div>
                </div>
            </div>

            {/* LinkedIn Import — shown at top so user can fill profile from LinkedIn first */}
            <LinkedInImport />

            <ProfileForms initialData={fullProfile} />
        </div>
    )
}
