'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NewBookPage() { // We'll fetch genres in a parent or use client fetch
    // For simplicity, let's fetch genres client side or pass them.
    // To keep it simple, I'll fetch client side here.
    interface Genre {
        id: number
        name: string
    }

    const [genres, setGenres] = useState<Genre[]>([])
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useState(() => {
        supabase.from('genres').select('*').then(({ data }) => {
            if (data) setGenres(data)
        })
    })

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        const title = formData.get('title') as string
        const description = formData.get('description') as string
        const price = parseFloat(formData.get('price') as string)
        const stock = parseInt(formData.get('stock') as string)
        const genre_id = formData.get('genre_id') as string
        const coverFile = formData.get('cover') as File

        let cover_url = ''

        if (coverFile && coverFile.size > 0) {
            setUploading(true)
            const fileExt = coverFile.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const { error: uploadError } = await supabase.storage
                .from('book-covers')
                .upload(fileName, coverFile)

            if (uploadError) {
                alert('Error uploading image: ' + uploadError.message)
                setLoading(false)
                setUploading(false)
                return
            }

            const { data: { publicUrl } } = supabase.storage
                .from('book-covers')
                .getPublicUrl(fileName)

            cover_url = publicUrl
            setUploading(false)
        }

        const { error } = await supabase.from('books').insert({
            title,
            description,
            price,
            stock,
            genre_id: parseInt(genre_id),
            cover_url
        })

        if (error) {
            alert('Error creating book: ' + error.message)
            setLoading(false)
        } else {
            router.push('/admin/books')
            router.refresh()
        }
    }

    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-bold mb-6">Add New Book</h1>

            <form onSubmit={handleSubmit} className="space-y-6 border p-6 rounded-lg bg-card">
                <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input name="title" required className="w-full rounded-md border px-3 py-2" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea name="description" rows={4} className="w-full rounded-md border px-3 py-2" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Price</label>
                        <input name="price" type="number" step="0.01" required className="w-full rounded-md border px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Stock</label>
                        <input name="stock" type="number" required className="w-full rounded-md border px-3 py-2" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Genre</label>
                    <select name="genre_id" required className="w-full rounded-md border px-3 py-2">
                        <option value="">Select a genre</option>
                        {genres.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Cover Image</label>
                    <input name="cover" type="file" accept="image/*" className="w-full" />
                </div>

                <button
                    type="submit"
                    disabled={loading || uploading}
                    className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                    {uploading ? 'Uploading Image...' : loading ? 'Saving...' : 'Create Book'}
                </button>
            </form>
        </div>
    )
}
