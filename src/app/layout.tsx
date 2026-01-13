import './globals.css'
import { Inter } from 'next/font/google'
import { TRPCReactProvider } from '@/lib/trpc/client'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Pebblebed Current',
  description: 'Talent flowing through the portfolio',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  )
}
