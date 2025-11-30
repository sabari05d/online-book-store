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
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="text-xl font-bold">
                    BookStore
                </Link>

                <div className="flex items-center gap-6">
                    <Link href="/books" className="text-sm font-medium hover:text-primary">
                        Browse
                    </Link>
                    <Link href="/search" className="text-sm font-medium hover:text-primary">
                        Search
                    </Link>

                    {user ? (
                        <>
                            <Link href="/cart" className="text-sm font-medium hover:text-primary">
                                Cart
                            </Link>
                            <Link href="/orders" className="text-sm font-medium hover:text-primary">
                                Orders
                            </Link>
                            {isAdmin && (
                                <Link href="/admin" className="text-sm font-medium text-destructive hover:text-destructive/80">
                                    Admin Panel
                                </Link>
                            )}
                            <form action="/auth/signout" method="post">
                                <button type="submit" className="text-sm font-medium hover:text-primary">
                                    Sign Out
                                </button>
                            </form>
                        </>
                    ) : (
                        <Link href="/login" className="text-sm font-medium hover:text-primary">
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}
