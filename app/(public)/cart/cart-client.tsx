'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function CartClient({ initialCart }: { initialCart: any }) {
    const [cart, setCart] = useState(initialCart)
    const [loading, setLoading] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const updateQuantity = async (itemId: number, newQuantity: number) => {
        if (newQuantity < 1) return
        setLoading(true)

        const { error } = await supabase
            .from('cart_items')
            .update({ quantity: newQuantity })
            .eq('id', itemId)

        if (!error) {
            refreshCart()
        } else {
            setLoading(false)
        }
    }

    const removeItem = async (itemId: number) => {
        if (!confirm('Are you sure you want to remove this item?')) return
        setLoading(true)

        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', itemId)

        if (!error) {
            refreshCart()
        } else {
            setLoading(false)
        }
    }

    const refreshCart = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data: newCart } = await supabase
                .from('carts')
                .select('*, cart_items(*, books(*))')
                .eq('user_id', user.id)
                .single()
            setCart(newCart)
        }
        setLoading(false)
        router.refresh() // Refresh server components too
    }

    if (!cart || !cart.cart_items || cart.cart_items.length === 0) {
        return (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
                <p className="text-muted-foreground mb-4">Your cart is empty.</p>
                <Link href="/books" className="text-primary hover:underline">
                    Browse Books
                </Link>
            </div>
        )
    }

    const total = cart.cart_items.reduce((sum: number, item: any) => {
        return sum + (item.books.price * item.quantity)
    }, 0)

    return (
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
                {cart.cart_items.map((item: any) => (
                    <div key={item.id} className="flex gap-4 p-4 border rounded-lg bg-card">
                        <div className="relative w-20 h-30 flex-shrink-0 bg-muted rounded overflow-hidden">
                            {item.books.cover_url && (
                                <Image
                                    src={item.books.cover_url}
                                    alt={item.books.title}
                                    fill
                                    className="object-cover"
                                />
                            )}
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="font-medium">{item.books.title}</h3>
                                <p className="text-sm text-muted-foreground">${item.books.price}</p>
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center border rounded-md">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        disabled={loading || item.quantity <= 1}
                                        className="px-2 py-1 hover:bg-accent disabled:opacity-50"
                                    >
                                        -
                                    </button>
                                    <span className="px-2 py-1 min-w-[2rem] text-center text-sm">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        disabled={loading}
                                        className="px-2 py-1 hover:bg-accent disabled:opacity-50"
                                    >
                                        +
                                    </button>
                                </div>
                                <button
                                    onClick={() => removeItem(item.id)}
                                    disabled={loading}
                                    className="text-sm text-destructive hover:underline disabled:opacity-50"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                        <div className="font-bold">
                            ${(item.books.price * item.quantity).toFixed(2)}
                        </div>
                    </div>
                ))}
            </div>

            <div className="md:col-span-1">
                <div className="border rounded-lg p-6 bg-card sticky top-24">
                    <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                    <div className="flex justify-between mb-2 text-sm">
                        <span>Subtotal</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-4 text-sm">
                        <span>Shipping</span>
                        <span>Free</span>
                    </div>
                    <div className="border-t pt-4 flex justify-between font-bold text-lg mb-6">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <Link
                        href="/checkout"
                        className="block w-full text-center rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        Proceed to Checkout
                    </Link>
                </div>
            </div>
        </div>
    )
}
