import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export default async function AdminOrdersPage() {
    const supabase = await createClient()
    const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

    async function updateStatus(formData: FormData) {
        'use server'
        const id = formData.get('id') as string
        const status = formData.get('status') as string
        const supabase = await createClient()
        await supabase.from('orders').update({ status }).eq('id', id)
        revalidatePath('/admin/orders')
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Manage Orders</h1>

            <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[768px]">
                    <thead className="bg-muted">
                        <tr>
                            <th className="p-4 font-medium">Order ID</th>
                            <th className="p-4 font-medium">User ID</th>
                            <th className="p-4 font-medium">Total</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium">Date</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {orders?.map((order) => (
                            <tr key={order.id}>
                                <td className="p-4">#{order.id}</td>
                                <td className="p-4 font-mono text-xs">{order.user_id}</td>
                                <td className="p-4 font-bold">${order.total_amount}</td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${order.status === 'paid' ? 'bg-green-100 text-green-800' :
                                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="p-4 text-muted-foreground">
                                    {new Date(order.created_at).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-right">
                                    <form action={updateStatus} className="flex justify-end gap-2">
                                        <input type="hidden" name="id" value={order.id} />
                                        <select
                                            name="status"
                                            defaultValue={order.status}
                                            className="rounded border text-xs p-1"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="paid">Paid</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                        <button className="text-primary hover:underline text-xs">Update</button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
