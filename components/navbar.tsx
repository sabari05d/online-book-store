import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export async function Navbar() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Check if admin
    let isAdmin = false
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single()
        isAdmin = profile?.is_admin || false
    }

    return (
        <nav className="border-b bg-background">
            <div className="container mx-auto flex h-auto min-h-16 items-center justify-between px-4 py-3 gap-4">
                <Link href="/" className="text-xl font-bold shrink-0">
                    bookiz
                </Link>

                <div className="flex items-center gap-3 sm:gap-6 flex-wrap justify-end">
                    <Link href="/books" className="text-sm font-medium hover:text-primary whitespace-nowrap">
                        Browse
                    </Link>
                    <Link href="/search" className="text-sm font-medium hover:text-primary whitespace-nowrap">
                        Search
                    </Link>

                    {user ? (
                        <>
                            <Link href="/cart" className="text-sm font-medium hover:text-primary whitespace-nowrap">
                                Cart
                            </Link>
                            <Link href="/orders" className="text-sm font-medium hover:text-primary whitespace-nowrap">
                                Orders
                            </Link>
                            {isAdmin && (
                                <Link href="/admin" className="text-sm font-medium text-destructive hover:text-destructive/80 whitespace-nowrap">
                                    Admin Panel
                                </Link>
                            )}
                            <form action="/auth/signout" method="post">
                                <button type="submit" className="text-sm font-medium hover:text-primary whitespace-nowrap">
                                    Sign Out
                                </button>
                            </form>
                        </>
                    ) : (
                        <Link href="/login" className="text-sm font-medium hover:text-primary whitespace-nowrap">
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}
