import Link from 'next/link'
import Image from 'next/image'

export interface Book {
    id: number
    title: string
    price: number
    cover_url: string | null
    genres?: {
        name: string
    } | null
}

interface BookCardProps {
    book: Book
}

export function BookCard({ book }: BookCardProps) {
    return (
        <Link href={`/books/${book.id}`} className="group block space-y-3">
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg border bg-muted">
                {book.cover_url ? (
                    <Image
                        src={book.cover_url}
                        alt={book.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        No Cover
                    </div>
                )}
            </div>
            <div>
                <h3 className="font-medium leading-none group-hover:underline">{book.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    {/* @ts-ignore: joins are tricky in TS without generated types */}
                    {book.genres?.name}
                </p>
                <p className="font-bold mt-1">${book.price}</p>
            </div>
        </Link>
    )
}
