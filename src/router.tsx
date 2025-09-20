import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./components/RootLayout";
import AuthLayout from "./components/AuthLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import Wallets from "./pages/Wallets";
import Settings from "./pages/Settings";
import GiveFeedback from "./pages/GiveFeedBack";
import ReportIssue from "./pages/ReportIssue";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "categories",
        element: <Categories />,
      },
      {
        path: "wallets",
        element: <Wallets />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "give-feedback",
        element: <GiveFeedback />,
      },
      {
        path: "report-issue",
        element: <ReportIssue />,
      },
    ],
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
    ],
  },
]);