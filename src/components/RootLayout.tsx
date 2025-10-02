import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import {
  LayoutDashboard,
  Wallet,
  Tags,
  Settings,
  MessageSquare,
  AlertTriangle,
  LogOut,
  Menu,
  X,
  Shield,
} from "lucide-react";
import logo from "../assets/logo-color.png";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Main navigation items (removed Give Feedback and Report Issue)
const navigationItems: NavigationItem[] = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/wallets", label: "Wallets", icon: Wallet },
  // { path: "/categories", label: "Categories", icon: Tags },
  { path: "/settings", label: "Settings", icon: Settings },
];

// Footer navigation items
const footerItems: NavigationItem[] = [
  { path: "/give-feedback", label: "Give Feedback", icon: MessageSquare },
  { path: "/report-issue", label: "Report Issue", icon: AlertTriangle },
];

export default function RootLayout() {
  const { user, signOut, userRole } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(userRole === "admin" || userRole === "superuser");
  }, [userRole]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/auth/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const userName = user?.user_metadata?.full_name || user?.email || "User";

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <TooltipProvider>
      <div className="h-screen flex overflow-hidden bg-gray-50">
        {/* Mobile overlay with blur */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-20 md:hidden"
            onClick={toggleSidebar}
          />
        )}

        {/* Sidebar */}
        <div
          className={`
        fixed md:static inset-y-0 left-0 z-30
        w-64 md:w-16 lg:w-64
        bg-white shadow-lg flex flex-col border-r border-gray-200 h-full
        transform transition-transform duration-300 ease-in-out
        ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }
      `}
        >
          {/* Header */}
          <div className="p-6 md:p-4 lg:p-6 border-b border-gray-200">
            {/* Mobile close button */}
            <button
              onClick={toggleSidebar}
              className="absolute top-4 right-4 p-2 md:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Logo - hidden on tablet, shown on mobile and desktop */}
            <div className="block md:hidden lg:block">
              <h1 className="text-xl font-bold text-gray-900">
                <img
                  src={logo}
                  className="w-[200px] lg:w-[250px] mx-auto"
                  alt="logo"
                />
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome,{" "}
                <b className="text-black">
                  {userName
                    .split(" ")
                    .map(
                      (word: string) =>
                        word.charAt(0).toUpperCase() + word.slice(1)
                    )
                    .join(" ")}
                </b>
              </p>
            </div>

            {/* User initials for tablet */}
            <div className="hidden md:block lg:hidden text-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto">
                <span className="text-black font-medium text-xs">
                  {userName
                    .split(" ")
                    .map((word: string) => word.charAt(0).toUpperCase())
                    .slice(0, 2)
                    .join(".")}
                </span>
              </div>
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 p-4 md:p-2 lg:p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center px-4 py-3 md:px-2 md:py-3 md:justify-center lg:px-4 lg:justify-start text-sm font-medium rounded-lg transition-colors ${
                          isActive
                            ? "bg-gray-50 text-black border border-gray-200"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        }`
                      }
                    >
                      {/* Tablet view with tooltip */}
                      <div className="hidden md:flex lg:hidden">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Icon className="w-5 h-5" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>{item.label}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      {/* Mobile and Desktop view */}
                      <div className="flex md:hidden lg:flex items-center">
                        <Icon className="w-5 h-5 mr-3" />
                        <span>{item.label}</span>
                      </div>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer with Give Feedback, Report Issue, and Sign Out */}
          <div className="p-4 md:p-2 lg:p-4 border-t border-gray-200">
            {/* Admin Panel Link */}
            {isAdmin && (
              <div className="mb-2">
                <NavLink
                  to="/admin"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center px-4 py-3 md:px-2 md:py-3 md:justify-center lg:px-4 lg:justify-start text-sm font-medium rounded-lg transition-colors bg-black text-white hover:bg-gray-800"
                >
                  {/* Tablet view with tooltip */}
                  <div className="hidden md:flex lg:hidden">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Shield className="w-5 h-5" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Admin Panel</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Mobile and Desktop view */}
                  <div className="flex md:hidden lg:flex items-center">
                    <Shield className="w-5 h-5 mr-3" />
                    <span>Admin Panel</span>
                  </div>
                </NavLink>
              </div>
            )}

            {/* Footer navigation items */}
            <ul className="space-y-2 mb-2">
              {footerItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className="flex items-center px-4 py-3 md:px-2 md:py-3 md:justify-center lg:px-4 lg:justify-start text-sm font-medium rounded-lg transition-colors text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                      {/* Tablet view with tooltip */}
                      <div className="hidden md:flex lg:hidden">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Icon className="w-5 h-5" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>{item.label}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      {/* Mobile and Desktop view */}
                      <div className="flex md:hidden lg:flex items-center">
                        <Icon className="w-5 h-5 mr-3" />
                        <span>{item.label}</span>
                      </div>
                    </NavLink>
                  </li>
                );
              })}
            </ul>

            {/* Sign Out Button */}
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full flex items-center justify-center md:justify-center lg:justify-start text-black bg-white md:px-2 lg:px-4"
            >
              {/* Tablet view with tooltip */}
              <div className="hidden md:flex lg:hidden">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <LogOut className="w-4 h-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Sign Out</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Mobile and Desktop view */}
              <div className="flex md:hidden lg:flex items-center">
                <LogOut className="w-4 h-4 mr-2" />
                <span>Sign Out</span>
              </div>
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col bg-white overflow-y-auto">
          {/* Mobile header with hamburger */}
          <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="ml-4 text-lg font-semibold text-gray-900">
              Expense Tracker
            </h1>
          </div>

          <main className="flex-1 overflow-auto w-full">
            <div className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 w-full">
              <div className="max-w-full mx-auto">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
