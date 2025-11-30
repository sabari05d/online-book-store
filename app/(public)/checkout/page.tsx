'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [cart, setCart] = useState<any>(null)
    const [address, setAddress] = useState({
        name: '',
        street: '',
        city: '',
        zip: '',
        country: ''
    })

    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const fetchCart = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login?next=/checkout')
                return
            }

            const { data } = await supabase
                .from('carts')
                .select('*, cart_items(*, books(*))')
                .eq('user_id', user.id)
                .single()

            if (!data || !data.cart_items || data.cart_items.length === 0) {
                router.push('/cart')
                return
            }
            setCart(data)
            setLoading(false)
        }
        fetchCart()
    }, [router, supabase])

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault()
        setProcessing(true)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user || !cart) return

        const total = cart.cart_items.reduce((sum: number, item: any) => sum + (item.books.price * item.quantity), 0)

        // 1. Create Order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                total_amount: total,
                status: 'paid', // Mock payment success
                shipping_address: address
            })
            .select()
            .single()

        if (orderError) {
            alert('Error creating order: ' + orderError.message)
            setProcessing(false)
            return
        }

        // 2. Create Order Items
        const orderItems = cart.cart_items.map((item: any) => ({
            order_id: order.id,
            book_id: item.book_id,
            quantity: item.quantity,
            price_at_purchase: item.books.price
        }))

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems)

        if (itemsError) {
            alert('Error creating order items: ' + itemsError.message)
            setProcessing(false)
            return
        }

        // 3. Clear Cart
        await supabase.from('cart_items').delete().eq('cart_id', cart.id)
        // Optionally delete cart or keep it empty. We'll just empty items.

        // 4. Update Stock (Optional but good)
        // For simplicity, we won't do complex stock management in this client-side flow, 
        // but ideally this should be a DB function or transaction.

        router.push('/orders')
    }

    if (loading) return <div className="p-8 text-center">Loading checkout...</div>

    const total = cart.cart_items.reduce((sum: number, item: any) => sum + (item.books.price * item.quantity), 0)

    return (
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
            <div>
                <h1 className="text-2xl font-bold mb-6">Checkout</h1>
                <form onSubmit={handlePayment} className="space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Shipping Address</h2>
                        <div>
                            <label className="block text-sm font-medium mb-1">Full Name</label>
                            <input
                                required
                                type="text"
                                value={address.name}
                                onChange={e => setAddress({ ...address, name: e.target.value })}
                                className="w-full rounded-md border px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Street Address</label>
                            <input
                                required
                                type="text"
                                value={address.street}
                                onChange={e => setAddress({ ...address, street: e.target.value })}
                                className="w-full rounded-md border px-3 py-2"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">City</label>
                                <input
                                    required
                                    type="text"
                                    value={address.city}
                                    onChange={e => setAddress({ ...address, city: e.target.value })}
                                    className="w-full rounded-md border px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">ZIP Code</label>
                                <input
                                    required
                                    type="text"
                                    value={address.zip}
                                    onChange={e => setAddress({ ...address, zip: e.target.value })}
                                    className="w-full rounded-md border px-3 py-2"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Country</label>
                            <input
                                required
                                type="text"
                                value={address.country}
                                onChange={e => setAddress({ ...address, country: e.target.value })}
                                className="w-full rounded-md border px-3 py-2"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Payment Details (Mock)</h2>
                        <div className="p-4 border rounded bg-muted/20 text-sm text-muted-foreground">
                            This is a mock payment form. No real payment will be processed.
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Card Number</label>
                            <input
                                type="text"
                                placeholder="0000 0000 0000 0000"
                                className="w-full rounded-md border px-3 py-2"
                                disabled
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Expiry</label>
                                <input
                                    type="text"
                                    placeholder="MM/YY"
                                    className="w-full rounded-md border px-3 py-2"
                                    disabled
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">CVC</label>
                                <input
                                    type="text"
                                    placeholder="123"
                                    className="w-full rounded-md border px-3 py-2"
                                    disabled
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-md bg-primary px-4 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                        {processing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                    </button>
                </form>
            </div>

            <div>
                <div className="bg-muted/10 p-6 rounded-lg border sticky top-24">
                    <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                    <div className="space-y-3 mb-4">
                        {cart?.cart_items.map((item: any) => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span>{item.books.title} x {item.quantity}</span>
                                <span>${(item.books.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t pt-4 flex justify-between font-bold">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
