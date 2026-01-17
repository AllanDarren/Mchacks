export default function ProfilePage() {
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <div className="bg-secondary p-8 rounded-lg border border-border max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Tell us about yourself"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
            </select>
          </div>
          <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition font-medium">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
