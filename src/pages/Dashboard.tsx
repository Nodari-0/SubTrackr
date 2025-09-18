import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  const name =
    `${(user?.user_metadata as any)?.first_name || ""} ${
      (user?.user_metadata as any)?.last_name || ""
    }`.trim() ||
    user?.email ||
    "User";

  return (
    <div className="text-white text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome, {name}!</h1>
      <p className="text-lg">This is your dashboard.</p>
    </div>
  );
}
