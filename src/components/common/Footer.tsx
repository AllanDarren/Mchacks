export function Footer() {
  return (
    <footer className="bg-secondary border-t border-border py-6">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-600">
        <p>&copy; {new Date().getFullYear()} MentorMatch. All rights reserved.</p>
      </div>
    </footer>
  );
}
