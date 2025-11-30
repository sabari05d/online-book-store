import { createClient } from '@/lib/supabase/server'
import { BookCard } from '@/components/book-card'
import Link from 'next/link'

export default async function BooksPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedSearchParams = await searchParams
    const supabase = await createClient()
    const page = Number(resolvedSearchParams.page) || 1
    const genreSlug = resolvedSearchParams.genre as string | undefined
    const sort = resolvedSearchParams.sort as string | undefined
    const limit = 12
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Fetch genres for sidebar
    const { data: genres } = await supabase.from('genres').select('*').order('name')

    // Build query for books
    let query = supabase
        .from('books')
        .select('*, genres!inner(name, slug)', { count: 'exact' })

    if (genreSlug) {
        query = query.eq('genres.slug', genreSlug)
    }

    // Sorting
    if (sort === 'price-asc') {
        query = query.order('price', { ascending: true })
    } else if (sort === 'price-desc') {
        query = query.order('price', { ascending: false })
    } else {
        query = query.order('created_at', { ascending: false })
    }

    const { data: books, count } = await query.range(from, to)

    const totalPages = count ? Math.ceil(count / limit) : 0

    return (
        <div className="flex flex-col md:flex-row gap-8 py-8">
            {/* Sidebar Filters */}
            <aside className="w-full md:w-64 space-y-6">
                <div>
                    <h3 className="font-semibold mb-4">Genres</h3>
                    <ul className="space-y-2">
                        <li>
                            <Link
                                href="/books"
                                className={`block text-sm ${!genreSlug ? 'font-bold text-primary' : 'text-muted-foreground hover:text-primary'
                                    }`}
                            >
                                All Genres
                            </Link>
                        </li>
                        {genres?.map((g) => (
                            <li key={g.id}>
                                <Link
                                    href={`/books?genre=${g.slug}${sort ? `&sort=${sort}` : ''}`}
                                    className={`block text-sm ${genreSlug === g.slug
                                        ? 'font-bold text-primary'
                                        : 'text-muted-foreground hover:text-primary'
                                        }`}
                                >
                                    {g.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">
                        {genreSlug
                            ? genres?.find((g) => g.slug === genreSlug)?.name || 'Books'
                            : 'All Books'}
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Sort by:</span>
                        <div className="flex gap-2 text-sm">
                            <Link
                                href={`/books?${new URLSearchParams({
                                    ...(genreSlug ? { genre: genreSlug } : {}),
                                    sort: 'newest',
                                }).toString()}`}
                                className={!sort || sort === 'newest' ? 'font-bold' : 'text-muted-foreground'}
                            >
                                Newest
                            </Link>
                            <Link
                                href={`/books?${new URLSearchParams({
                                    ...(genreSlug ? { genre: genreSlug } : {}),
                                    sort: 'price-asc',
                                }).toString()}`}
                                className={sort === 'price-asc' ? 'font-bold' : 'text-muted-foreground'}
                            >
                                Price: Low to High
                            </Link>
                            <Link
                                href={`/books?${new URLSearchParams({
                                    ...(genreSlug ? { genre: genreSlug } : {}),
                                    sort: 'price-desc',
                                }).toString()}`}
                                className={sort === 'price-desc' ? 'font-bold' : 'text-muted-foreground'}
                            >
                                Price: High to Low
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {books?.map((book) => (
                        <BookCard key={book.id} book={book} />
                    ))}
                    {(!books || books.length === 0) && (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            No books found.
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                        {page > 1 && (
                            <Link
                                href={`/books?${new URLSearchParams({
                                    ...(genreSlug ? { genre: genreSlug } : {}),
                                    ...(sort ? { sort } : {}),
                                    page: (page - 1).toString(),
                                }).toString()}`}
                                className="px-4 py-2 border rounded hover:bg-accent"
                            >
                                Previous
                            </Link>
                        )}
                        <span className="px-4 py-2">
                            Page {page} of {totalPages}
                        </span>
                        {page < totalPages && (
                            <Link
                                href={`/books?${new URLSearchParams({
                                    ...(genreSlug ? { genre: genreSlug } : {}),
                                    ...(sort ? { sort } : {}),
                                    page: (page + 1).toString(),
                                }).toString()}`}
                                className="px-4 py-2 border rounded hover:bg-accent"
                            >
                                Next
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
