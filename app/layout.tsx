import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'קרתא — מערכת תכנון ורישוי',
  description: 'ניהול תהליכי תכנון ורישוי לפרויקטי נדל"ן',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
      </head>
      <body>{children}</body>
    </html>
  )
}
