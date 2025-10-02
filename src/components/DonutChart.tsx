import { useEffect, useState } from "react";

import { supabase } from "../supabaseClient";

import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

interface Transaction {
  type: string;
  amount: number;
}

const DonutChart = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }); // ✅ Show recent first

      if (!error && data) {
        setTransactions(data);
      }
    };

    fetchTransactions();
  }, []);

  // ✅ Totals
  const totalIncome = transactions
    .filter((t) => t.type === "Income")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "Expense")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const data = {
    labels: ["Income", "Expense"],
    datasets: [
      {
        data: [totalIncome, totalExpense],
        backgroundColor: ["#4ade80", "#f87171"], // green, red
        borderColor: ["#22c55e", "#ef4444"],
        borderWidth: 1,
      },
    ],
  };
  const totalBalance = totalIncome - totalExpense;

  return (
    <div className="flex flex-col md:flex-row items-center gap-8">
      {" "}
      <div className="w-[300px] ">
        <Doughnut data={data} />
      </div>
      <p className="text-black  mt-2 text-6xl">
        Total Balance:{" "}
        <span className=" text-green-500">${totalBalance.toFixed(2)}</span>
      </p>
    </div>
  );
};

export default DonutChart;
