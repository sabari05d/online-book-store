/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function AddToCartButton({ bookId, price }: { bookId: number; price: number }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const addToCart = async () => {
        setLoading(true)

        // Check if user is logged in
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            router.push('/login?next=/books/' + bookId)
            return
        }

        // Get or create cart
        // Note: In a real app we'd use a more robust cart logic (e.g. check active cart)
        // For this demo, we'll assume one active cart per user or create new if none.
        // Let's try to find the most recent cart or create one.

        // Simplified: Just get the user's cart (assuming 1 cart for now or we create one)
        interface Cart {
            id: number
            user_id: string
        }

        const { data: cartData } = await supabase
            .from('carts')
            .select('id, user_id')
            .eq('user_id', user.id)
            .single()

        let cart: Cart | null = cartData as unknown as Cart | null

        if (!cart) {
            const { data: newCart, error } = await supabase
                .from('carts')
                .insert({ user_id: user.id })
                .select()
                .single()

            if (error) {
                alert('Error creating cart')
                setLoading(false)
                return
            }
            cart = newCart as unknown as Cart
        }

        // Add item to cart
        // Check if item exists
        interface CartItem {
            id: number
            quantity: number
        }

        const { data: itemData } = await supabase
            .from('cart_items')
            .select('id, quantity')
            .eq('cart_id', cart.id)
            .eq('book_id', bookId)
            .single()

        const existingItem = itemData as unknown as CartItem | null

        if (existingItem) {
            await supabase
                .from('cart_items')
                .update({ quantity: existingItem.quantity + 1 })
                .eq('id', existingItem.id)
        } else {
            await supabase
                .from('cart_items')
                .insert({ cart_id: cart.id, book_id: bookId, quantity: 1 })
        }

        setLoading(false)
        router.refresh()
        router.push('/cart')
    }

    return (
        <button
            onClick={addToCart}
            disabled={loading}
            className="w-full md:w-auto rounded-md bg-primary px-8 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
            {loading ? 'Adding...' : 'Add to Cart'}
        </button>
    )
}
