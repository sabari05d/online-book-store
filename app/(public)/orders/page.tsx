import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function OrdersPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login?next=/orders')
    }

    const { data: orders } = await supabase
        .from('orders')
        .select('*, order_items(*, books(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="max-w-4xl mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">Your Orders</h1>

            <div className="space-y-6">
                {orders?.map((order) => (
                    <div key={order.id} className="border rounded-lg overflow-hidden">
                        <div className="bg-muted p-4 flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium">Order #{order.id}</p>
                                <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${order.status === 'paid' ? 'bg-green-100 text-green-800' :
                                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                    {order.status}
                                </span>
                                <span className="font-bold">${order.total_amount}</span>
                            </div>
                        </div>
                        <div className="p-4">
                            <ul className="divide-y">
                                {order.order_items.map((item: any) => (
                                    <li key={item.id} className="py-4 flex justify-between">
                                        <div className="flex gap-4">
                                            <div className="w-16 h-24 bg-muted rounded overflow-hidden relative">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                {item.books?.cover_url && <img src={item.books.cover_url} alt={item.books.title} className="object-cover w-full h-full" />}
                                            </div>
                                            <div>
                                                <p className="font-medium">{item.books?.title || 'Unknown Book'}</p>
                                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">${item.price_at_purchase}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}

                {(!orders || orders.length === 0) && (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>You haven't placed any orders yet.</p>
                        <Link href="/books" className="text-primary hover:underline mt-2 inline-block">
                            Start Shopping
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
