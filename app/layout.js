import './globals.css'

export const metadata = {
  title: 'Xeetrix - Trading Journal',
  description: 'Track your trades with logic',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-background text-white">{children}</body>
    </html>
  )
}