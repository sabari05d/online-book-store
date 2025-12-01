import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export default async function GenresPage() {
    const supabase = await createClient()
    const { data: genres } = await supabase.from('genres').select('*').order('name')

    async function addGenre(formData: FormData) {
        'use server'
        const name = formData.get('name') as string
        const slug = formData.get('slug') as string

        const supabase = await createClient()
        await supabase.from('genres').insert({ name, slug })
        revalidatePath('/admin/genres')
    }

    async function deleteGenre(formData: FormData) {
        'use server'
        const id = formData.get('id') as string
        const supabase = await createClient()
        await supabase.from('genres').delete().eq('id', id)
        revalidatePath('/admin/genres')
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Manage Genres</h1>

            <div className="mb-8 p-4 border rounded-lg bg-card">
                <h2 className="text-lg font-semibold mb-4">Add New Genre</h2>
                <form action={addGenre} className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="w-full sm:w-auto">
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input name="name" required className="w-full rounded-md border px-3 py-2" />
                    </div>
                    <div className="w-full sm:w-auto">
                        <label className="block text-sm font-medium mb-1">Slug</label>
                        <input name="slug" required className="w-full rounded-md border px-3 py-2" />
                    </div>
                    <button type="submit" className="w-full sm:w-auto rounded-md bg-primary px-4 py-2 text-primary-foreground">
                        Add Genre
                    </button>
                </form>
            </div>

            <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[480px]">
                    <thead className="bg-muted">
                        <tr>
                            <th className="p-4 font-medium">Name</th>
                            <th className="p-4 font-medium">Slug</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {genres?.map((genre) => (
                            <tr key={genre.id}>
                                <td className="p-4">{genre.name}</td>
                                <td className="p-4">{genre.slug}</td>
                                <td className="p-4 text-right">
                                    <form action={deleteGenre}>
                                        <input type="hidden" name="id" value={genre.id} />
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
