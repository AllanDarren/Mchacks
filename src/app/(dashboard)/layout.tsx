export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-secondary p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="text-2xl font-bold hover:opacity-80 transition">
            MentorMatch
          </a>
          <div className="flex gap-4 items-center">
            <a href="/dashboard" className="hover:text-primary transition">
              Dashboard
            </a>
            <a href="/messages" className="hover:text-primary transition">
              Messages
            </a>
            <a href="/profile" className="hover:text-primary transition">
              Profile
            </a>
            <a href="/" className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition text-sm">
              Home
            </a>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-4">{children}</main>
    </div>
  );
}
