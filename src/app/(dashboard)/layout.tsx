import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import DashboardSidebar from '@/components/layout/DashboardSidebar'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-bg-secondary flex">
            <DashboardSidebar userEmail={user.email} />
            <main className="flex-1 w-full lg:pl-64 min-h-screen transition-all">
                <div className="max-w-[1400px] mx-auto p-4 sm:p-8 lg:p-12 animate-in fade-in transition-all duration-500">
                    {children}
                </div>
            </main>
        </div>
    )
}
