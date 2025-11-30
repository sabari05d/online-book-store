import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { BookCard } from '@/components/book-card'

export default async function Home() {
  const supabase = await createClient()
  const { data: books } = await supabase
    .from('books')
    .select('*, genres(name)')
    .limit(6)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-12">
      <section className="text-center space-y-4 py-12 bg-muted/20 rounded-2xl">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Welcome to BookStore
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover your next favorite book from our curated collection of fiction, non-fiction, and more.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/books" className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
            Browse Books
          </Link>
          <Link href="/search" className="inline-flex items-center justify-center rounded-md border bg-background px-6 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
            Search
          </Link>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Books</h2>
          <Link href="/books" className="text-sm font-medium text-primary hover:underline">
            View all &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books?.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
          {(!books || books.length === 0) && (
            <p className="col-span-full text-center text-muted-foreground py-12">
              No books found. Please seed the database.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
