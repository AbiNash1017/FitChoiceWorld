import { DM_Sans, Inter } from "next/font/google";
import "./globals.css";
import { twMerge } from "tailwind-merge";
import { FitnessCentreProvider } from "./context/FitnessCentreContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./components/theme-provider";

// const dmsans= DM_Sans({subsets: ['latin']})

const inter = Inter({
    subsets: ['latin'],
    weight: ['400', '700', '800'],
    variable: '--font-inter',
});

export const metadata = {
    title: "Fit Choice World",
    description: "Fit Choice World",
};

export default function RootLayout({
    children,
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={twMerge(inter.className, "antialiased bg-[#EAEEFE]")}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <AuthProvider>
                        <FitnessCentreProvider>
                            {children}
                        </FitnessCentreProvider>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
