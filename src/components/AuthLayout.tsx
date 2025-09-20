import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthLayout() {
  const { user } = useAuth();

  // If user is already authenticated, redirect to dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Expense Tracker</h1>
          <p className="text-gray-600 mt-2">Manage your finances with ease</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}