import "./globals.css";
import {ClientProviders} from "@/app/ClientProviders";

export default function RootLayout({children}: { children: React.ReactNode }) {
    // convert to client using a nested client wrapper
    return (
        <html lang="en">
        <body className="bg-background text-foreground">
        <ClientProviders>{children}</ClientProviders>
        </body>
        </html>
    );
}
