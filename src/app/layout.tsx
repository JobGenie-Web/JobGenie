import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import StoreProvider from "@/components/providers/StoreProvider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "JobGenie - Find Your Perfect Career Match",
  description: "JobGenie connects talented candidates with forward-thinking employers. Whether you're looking for your dream job or the perfect hire, we've got you covered.",
  keywords: ["jobs", "careers", "hiring", "recruitment", "job portal", "employment"],
  authors: [{ name: "JobGenie" }],
  openGraph: {
    title: "JobGenie - Find Your Perfect Career Match",
    description: "JobGenie connects talented candidates with forward-thinking employers.",
    type: "website",
  },
  icons: {
    icon: "/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <StoreProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
