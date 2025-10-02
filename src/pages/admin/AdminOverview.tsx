import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { Card } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { Users, DollarSign, CreditCard, TrendingUp } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalTransactions: number;
  totalAmount: number;
  feedbackCount: number;
  issuesCount: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalTransactions: 0,
    totalAmount: 0,
    feedbackCount: 0,
    issuesCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch total users
        const { count: usersCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        // Fetch total transactions
        const { count: transactionsCount } = await supabase
          .from("transactions")
          .select("*", { count: "exact", head: true });

        // Fetch total transaction amount
        const { data: transactionsData } = await supabase
          .from("transactions")
          .select("amount");

        const totalAmount = transactionsData?.reduce(
          (sum, t) => sum + (t.amount || 0),
          0
        ) || 0;

        // Fetch feedback count
        const { count: feedbackCount } = await supabase
          .from("feedback")
          .select("*", { count: "exact", head: true });

        // Fetch issues count
        const { count: issuesCount } = await supabase
          .from("issues")
          .select("*", { count: "exact", head: true });

        setStats({
          totalUsers: usersCount || 0,
          totalTransactions: transactionsCount || 0,
          totalAmount,
          feedbackCount: feedbackCount || 0,
          issuesCount: issuesCount || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Transactions",
      value: stats.totalTransactions,
      icon: CreditCard,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Amount",
      value: `$${stats.totalAmount.toFixed(2)}`,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Feedback Received",
      value: stats.feedbackCount,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Issues Reported",
      value: stats.issuesCount,
      icon: TrendingUp,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="text-gray-900">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard Overview</h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-12 w-24" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <div className="mt-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <p className="text-gray-600">
            Use the navigation menu to manage users, view feedback, or handle reported issues.
          </p>
        </Card>
      </div>
    </div>
  );
}
