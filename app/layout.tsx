import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Navigation } from "@/components/navbar";
import { GroupsProviderClient } from "./GroupsContext";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Ledgerio - Group Expense Tracker",
  description: "Easily manage and track group expenses with Ledgerio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <GroupsProviderClient>
            <div className="min-h-screen flex flex-col">
              <Navigation />
              <main className="flex-1 flex flex-col max-w-5xl w-full mx-auto px-5 py-8 overflow-hidden">
                {children}
              </main>
            </div>
          </GroupsProviderClient>
        </ThemeProvider>
      </body>
    </html>
  );
}
