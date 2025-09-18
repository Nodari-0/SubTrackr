import { AuthProvider, useAuth } from "./context/AuthContext"
import AuthCard from "./components/AuthForm"
import Dashboard from "./pages/Dashboard"
import { Button } from "./components/ui/button"

function AppContent() {
  const { user, signOut } = useAuth()

  if (user) {
    return (
      <div className="min-h-screen bg-black relative">
        {/* Logout button top-right */}
        <div className="absolute top-4 right-4">
          <Button onClick={signOut} className="bg-white text-black px-4 py-2 rounded">
            Logout
          </Button>
        </div>

        {/* Dashboard centered */}
        <div className="flex items-center justify-center min-h-screen">
          <Dashboard />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <AuthCard />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
