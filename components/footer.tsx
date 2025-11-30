export function Footer() {
    return (
        <footer className="border-t bg-muted/50 py-6">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} Online Book Store. All rights reserved.
            </div>
        </footer>
    )
}
