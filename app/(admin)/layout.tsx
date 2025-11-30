import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

    if (!profile?.is_admin) {
        redirect('/')
    }

    return (
        <div className="flex min-h-screen">
            <aside className="w-64 border-r bg-muted/30 p-6">
                <div className="mb-8 text-xl font-bold">Admin Panel</div>
                <nav className="flex flex-col gap-2">
                    <Link href="/admin" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                        Dashboard
                    </Link>
                    <Link href="/admin/books" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                        Manage Books
                    </Link>
                    <Link href="/admin/genres" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                        Manage Genres
                    </Link>
                    <Link href="/admin/orders" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                        Manage Orders
                    </Link>
                    <Link href="/" className="mt-8 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                        &larr; Back to Store
                    </Link>
                </nav>
            </aside>
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    )
}
