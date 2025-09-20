import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { 
  LayoutDashboard, 
  Wallet, 
  Tags, 
  Settings, 
  MessageSquare, 
  AlertTriangle,
  LogOut 
} from "lucide-react";

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigationItems: NavigationItem[] = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/wallets", label: "Wallets", icon: Wallet },
  { path: "/categories", label: "Categories", icon: Tags },
  { path: "/settings", label: "Settings", icon: Settings },
  { path: "/give-feedback", label: "Give Feedback", icon: MessageSquare },
  { path: "/report-issue", label: "Report Issue", icon: AlertTriangle },
];

export default function RootLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/auth/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const userName = user?.user_metadata?.full_name || user?.email || "User";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col border-r border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">SubTrackr</h1>
          <p className="text-sm text-gray-600 mt-1">Welcome, {userName}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`
                    }
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer with logout */}
        <div className="p-4 border-t border-gray-200">
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="w-full flex items-center justify-center text-black bg-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col bg-white">
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}