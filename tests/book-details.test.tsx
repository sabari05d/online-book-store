/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import BookDetailsPage from '../app/(public)/books/[id]/page'

// Mock Supabase
const mockSingle = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
    createClient: () => Promise.resolve({
        from: () => ({
            select: () => ({
                eq: () => ({
                    single: () => {
                        mockSingle()
                        return Promise.resolve({
                            data: {
                                id: 1,
                                title: 'Detailed Book',
                                price: 20,
                                description: 'A great book',
                                stock: 5,
                                cover_url: 'http://example.com/cover.jpg',
                                genres: { name: 'Fiction' }
                            }
                        })
                    }
                })
            })
        })
    })
}))

vi.mock('@/lib/supabase/client', () => ({
    createClient: () => ({
        auth: {
            getUser: () => Promise.resolve({ data: { user: { id: 'test-user' } } })
        },
        from: () => ({
            select: () => ({
                eq: () => ({
                    single: () => Promise.resolve({ data: { id: 1, user_id: 'test-user' } })
                })
            }),
            insert: () => ({
                select: () => ({
                    single: () => Promise.resolve({ data: { id: 1, user_id: 'test-user' } })
                })
            }),
            cart_items: () => ({
                select: () => ({
                    eq: () => ({
                        eq: () => ({
                            single: () => Promise.resolve({ data: null })
                        })
                    })
                })
            })
        })
    })
}))

// Mock Next/Link, Image, and Navigation
vi.mock('next/link', () => ({
    default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>
}))

vi.mock('next/image', () => ({
    // eslint-disable-next-line @next/next/no-img-element
    default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />
}))

vi.mock('next/navigation', () => ({
    notFound: vi.fn(),
    useRouter: () => ({
        push: vi.fn(),
        refresh: vi.fn()
    })
}))

describe('Book Details Page', () => {
    it('renders book details', async () => {
        const jsx = await BookDetailsPage({ params: Promise.resolve({ id: '1' }) })
        render(jsx)

        expect(screen.getByText('Detailed Book')).toBeInTheDocument()
        expect(screen.getByText('$20')).toBeInTheDocument()
        expect(screen.getByText('A great book')).toBeInTheDocument()
        expect(screen.getByText('Add to Cart')).toBeInTheDocument()
    })
})
