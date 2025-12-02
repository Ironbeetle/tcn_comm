import SessionBar from '@/components/SessionBar'

export default function AdminHomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SessionBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Home Page</h1>
        <p className="text-gray-600">Welcome to the admin dashboard.</p>
      </div>
    </div>
  );
}