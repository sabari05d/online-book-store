import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import BooksPage from '../app/(public)/books/page'

// Mock Supabase
const mockSelect = vi.fn()
const mockOrder = vi.fn()
const mockRange = vi.fn()
const mockEq = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
    createClient: () => Promise.resolve({
        from: (table: string) => ({
            select: (...args: any[]) => {
                if (table === 'genres') {
                    return {
                        order: () => Promise.resolve({
                            data: [
                                { id: 1, name: 'Fiction', slug: 'fiction' },
                                { id: 2, name: 'Non-Fiction', slug: 'non-fiction' }
                            ]
                        })
                    }
                }
                return {
                    eq: (...args: any[]) => {
                        mockEq(...args)
                        return {
                            order: (...args: any[]) => {
                                mockOrder(...args)
                                return {
                                    range: (...args: any[]) => {
                                        mockRange(...args)
                                        return Promise.resolve({
                                            data: [
                                                {
                                                    id: 1,
                                                    title: 'Test Book',
                                                    price: 10,
                                                    cover_url: null,
                                                    genres: { name: 'Fiction', slug: 'fiction' }
                                                }
                                            ],
                                            count: 1
                                        })
                                    }
                                }
                            }
                        }
                    },
                    order: (...args: any[]) => {
                        mockOrder(...args)
                        return {
                            range: (...args: any[]) => {
                                mockRange(...args)
                                return Promise.resolve({
                                    data: [
                                        {
                                            id: 1,
                                            title: 'Test Book',
                                            price: 10,
                                            cover_url: null,
                                            genres: { name: 'Fiction', slug: 'fiction' }
                                        }
                                    ],
                                    count: 1
                                })
                            }
                        }
                    }
                }
            }
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

describe('Books Page', () => {
    it('renders list of books and genres', async () => {
        const jsx = await BooksPage({ searchParams: Promise.resolve({}) })
        render(jsx)

        expect(screen.getByText('All Books')).toBeInTheDocument()
        expect(screen.getAllByText('Fiction')[0]).toBeInTheDocument()
        expect(screen.getByText('Test Book')).toBeInTheDocument()
    })

    it('renders filtered view', async () => {
        const jsx = await BooksPage({ searchParams: Promise.resolve({ genre: 'fiction' }) })
        render(jsx)

        expect(screen.getAllByText('Fiction')[0]).toBeInTheDocument()
    })
})
