import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
    const supabase = await createClient()

    // Fetch total orders count
    const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })

    // Fetch total books count
    const { count: booksCount } = await supabase
        .from('books')
        .select('*', { count: 'exact', head: true })

    // Fetch total revenue from completed orders
    const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, status')
        .eq('status', 'completed')

    const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground">Total Orders</h3>
                    <div className="mt-2 text-2xl font-bold">
                        {ordersCount !== null && ordersCount > 0 ? ordersCount : (
                            <span className="text-lg text-muted-foreground">No orders yet</span>
                        )}
                    </div>
                </div>
                <div className="rounded-lg border p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground">Total Books</h3>
                    <div className="mt-2 text-2xl font-bold">
                        {booksCount !== null && booksCount > 0 ? booksCount : (
                            <span className="text-lg text-muted-foreground">No books yet</span>
                        )}
                    </div>
                </div>
                <div className="rounded-lg border p-6 shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
                    <div className="mt-2 text-2xl font-bold">
                        {totalRevenue > 0 ? `$${totalRevenue.toFixed(2)}` : (
                            <span className="text-lg text-muted-foreground">No payments yet</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
