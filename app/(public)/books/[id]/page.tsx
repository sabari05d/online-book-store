import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AddToCartButton } from './add-to-cart-button'

export default async function BookDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    const { data: book } = await supabase
        .from('books')
        .select('*, genres(name)')
        .eq('id', id)
        .single()

    if (!book) {
        notFound()
    }

    return (
        <div className="py-8">
            <Link href="/books" className="text-sm text-muted-foreground hover:text-primary mb-6 inline-block">
                &larr; Back to Books
            </Link>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                {/* Image Column */}
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden border bg-muted">
                    {book.cover_url ? (
                        <Image
                            src={book.cover_url}
                            alt={book.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            No Cover Available
                        </div>
                    )}
                </div>

                {/* Details Column */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold sm:text-4xl">{book.title}</h1>
                        <p className="text-lg text-muted-foreground mt-2">
                            {/* @ts-ignore: joins are tricky in TS without generated types */}
                            {book.genres?.name}
                        </p>
                    </div>

                    <div className="text-2xl font-bold">${book.price}</div>

                    <div className="prose max-w-none text-muted-foreground">
                        <p>{book.description || 'No description available.'}</p>
                    </div>

                    <div className="pt-6 border-t">
                        <div className="flex items-center gap-4 mb-4">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${book.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {book.stock > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                            {book.stock > 0 && (
                                <span className="text-sm text-muted-foreground">
                                    {book.stock} available
                                </span>
                            )}
                        </div>

                        <AddToCartButton bookId={book.id} price={book.price} />
                    </div>
                </div>
            </div>
        </div>
    )
}
