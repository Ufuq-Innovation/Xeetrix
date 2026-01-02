import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Xeetrix | E-commerce Operating System',
  description: 'Advanced Inventory & Order Management System for Modern Businesses',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-[#0a0a0a] text-white">
          {children}
        </div>
      </body>
    </html>
  )
}