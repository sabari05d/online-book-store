import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import Home from '../app/(public)/page'

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
    createClient: () => Promise.resolve({
        from: () => ({
            select: () => ({
                limit: () => ({
                    order: () => Promise.resolve({
                        data: [
                            {
                                id: 1,
                                title: 'Test Book',
                                price: 10,
                                cover_url: 'http://example.com/img.jpg',
                                genres: { name: 'Fiction' }
                            }
                        ]
                    })
                })
            })
        })
    })
}))

// Mock Next/Link and Image
vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>
}))

vi.mock('next/image', () => ({
    // eslint-disable-next-line @next/next/no-img-element
    default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />
}))

test('Home page renders featured books', async () => {
    const jsx = await Home()
    render(jsx)

    expect(screen.getByText('Welcome to BookStore')).toBeInTheDocument()
    expect(screen.getByText('Test Book')).toBeInTheDocument()
    expect(screen.getByText('$10')).toBeInTheDocument()
})
