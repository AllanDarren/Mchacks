import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MentorMatch',
  description: 'Connect with mentors and learners',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">{children}</body>
    </html>
  );
}
