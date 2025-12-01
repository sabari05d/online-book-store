import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { revalidatePath } from 'next/cache'

export default async function AdminBooksPage() {
    const supabase = await createClient()
    interface BookWithGenre {
        id: number
        title: string
        price: number
        stock: number
        cover_url: string | null
        genres: {
            name: string
        } | null
    }

    const { data } = await supabase
        .from('books')
        .select('*, genres(name)')
        .order('created_at', { ascending: false })

    const books = data as unknown as BookWithGenre[]

    async function deleteBook(formData: FormData) {
        'use server'
        const id = formData.get('id') as string
        const supabase = await createClient()
        await supabase.from('books').delete().eq('id', id)
        revalidatePath('/admin/books')
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Books</h1>
                <Link href="/admin/books/new" className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
                    Add New Book
                </Link>
            </div>

            <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[640px]">
                    <thead className="bg-muted">
                        <tr>
                            <th className="p-4 font-medium">Cover</th>
                            <th className="p-4 font-medium">Title</th>
                            <th className="p-4 font-medium">Genre</th>
                            <th className="p-4 font-medium">Price</th>
                            <th className="p-4 font-medium">Stock</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {books?.map((book) => (
                            <tr key={book.id}>
                                <td className="p-4">
                                    <div className="relative w-10 h-14 bg-muted rounded overflow-hidden">
                                        {book.cover_url && (
                                            <Image src={book.cover_url} alt={book.title} fill className="object-cover" />
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 font-medium">{book.title}</td>
                                <td className="p-4">
                                    {book.genres?.name}
                                </td>
                                <td className="p-4">${book.price}</td>
                                <td className="p-4">{book.stock}</td>
                                <td className="p-4 text-right">
                                    <form action={deleteBook}>
                                        <input type="hidden" name="id" value={book.id.toString()} />
                                        <button className="text-destructive hover:underline">Delete</button>
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
