import { createClient } from '@/lib/supabase/server'
import { CartClient } from './cart-client'
import { redirect } from 'next/navigation'

export default async function CartPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login?next=/cart')
    }

    const { data: cart } = await supabase
        .from('carts')
        .select('*, cart_items(*, books(*))')
        .eq('user_id', user.id)
        .single()

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>
            <CartClient initialCart={cart} />
        </div>
    )
}
