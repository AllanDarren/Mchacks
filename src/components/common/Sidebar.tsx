export function Sidebar() {
  return (
    <aside className="hidden md:block w-64 bg-secondary border-r border-border p-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Quick Links</h3>
        <nav className="space-y-2">
          <a href="/dashboard" className="block hover:text-primary transition">
            Dashboard
          </a>
          <a href="/profile" className="block hover:text-primary transition">
            Profile
          </a>
          <a href="/mentors" className="block hover:text-primary transition">
            Find Mentors
          </a>
          <a href="/students" className="block hover:text-primary transition">
            Find Students
          </a>
        </nav>
      </div>
    </aside>
  );
}
