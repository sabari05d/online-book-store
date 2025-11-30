import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables for seeding.')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seed() {
    console.log('Seeding data...')

    // 1. Create Admin User
    const adminEmail = 'admin@example.com'
    const adminPassword = 'password123'

    // Check if user exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    let adminUser = existingUsers.users.find(u => u.email === adminEmail)

    if (!adminUser) {
        const { data, error } = await supabase.auth.admin.createUser({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true
        })
        if (error) {
            console.error('Error creating admin user:', error)
        } else {
            adminUser = data.user
            console.log('Admin user created.')
        }
    } else {
        console.log('Admin user already exists.')
    }

    if (adminUser) {
        // Ensure profile exists and is admin
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({ id: adminUser.id, is_admin: true, full_name: 'Admin User' })

        if (profileError) console.error('Error updating admin profile:', profileError)
    }

    // 2. Seed Genres
    const genres = [
        { name: 'Fiction', slug: 'fiction' },
        { name: 'Non-Fiction', slug: 'non-fiction' },
        { name: 'Science Fiction', slug: 'sci-fi' },
        { name: 'Mystery', slug: 'mystery' },
    ]

    for (const genre of genres) {
        const { error } = await supabase.from('genres').upsert(genre, { onConflict: 'slug' })
        if (error) console.error(`Error seeding genre ${genre.name}:`, error)
    }

    // 3. Seed Books
    // First get genre IDs
    const { data: genreData } = await supabase.from('genres').select('id, slug')
    const genreMap = new Map(genreData?.map(g => [g.slug, g.id]))

    const books = [
        {
            title: 'The Great Gatsby',
            description: 'A novel written by American author F. Scott Fitzgerald.',
            price: 10.99,
            stock: 100,
            genre_id: genreMap.get('fiction'),
            cover_url: 'https://via.placeholder.com/300x450?text=Gatsby'
        },
        {
            title: 'Sapiens',
            description: 'A Brief History of Humankind by Yuval Noah Harari.',
            price: 15.50,
            stock: 50,
            genre_id: genreMap.get('non-fiction'),
            cover_url: 'https://via.placeholder.com/300x450?text=Sapiens'
        },
        {
            title: 'Dune',
            description: 'A 1965 epic science fiction novel by American author Frank Herbert.',
            price: 12.99,
            stock: 80,
            genre_id: genreMap.get('sci-fi'),
            cover_url: 'https://via.placeholder.com/300x450?text=Dune'
        }
    ]

    for (const book of books) {
        if (!book.genre_id) continue
        const { error } = await supabase.from('books').upsert(book, { onConflict: 'title' }) // Using title as conflict target for simplicity in seed
        // Note: books table doesn't have unique title constraint by default, but upsert needs one or primary key.
        // We might just insert if not exists, or we should add unique constraint to title or slug.
        // For now, let's just insert.
        if (error) {
            // If error is about constraint, ignore.
            // Actually, upsert without onConflict works on PK. We don't have PK here.
            // Let's just check if exists first.
            const { data: existing } = await supabase.from('books').select('id').eq('title', book.title).single()
            if (!existing) {
                await supabase.from('books').insert(book)
            }
        }
    }

    console.log('Seeding complete.')
}

seed().catch(console.error)
